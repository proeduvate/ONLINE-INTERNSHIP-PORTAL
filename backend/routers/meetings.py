from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, BackgroundTasks
from typing import Dict, List
from sqlalchemy.orm import Session
import asyncio

# Assuming dependencies.py or database.py exports get_db
# Adjust import path relative to backend root
from database import get_db 
import models, schemas

router = APIRouter(tags=["meetings"])

# --- WebSocket Connection Manager ---

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import models
from database import get_db


class MeetingCreate(BaseModel):
    title: str
    room_code: str
    status: Optional[str] = "scheduled"
    scheduled_time: Optional[str] = None
    domain: Optional[str] = None
    batch_id: Optional[str] = None

class MeetingResponse(BaseModel):
    id: int
    title: str
    room_code: str
    status: str
    mentor_id: int
    
    class Config:
        from_attributes = True


import os
from fastapi import Header
import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
ALGORITHM = "HS256"

def get_user_id_from_token(authorization: str = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                return int(user_id)
        except:
            pass
    return 1 # Fallback mentor ID

@router.post("", response_model=MeetingResponse)
@router.post("/", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db), authorization: str = Header(None)):
    mentor_id = get_user_id_from_token(authorization)
    if not mentor_id:
        mentor_id = 1 # Fallback for demo


    # We save the meeting fields that exist in the database model
    # (If scheduled_time/domain exist in the model, they should be assigned. Assuming they might be missing from schema, we'll try to map what we can safely)
    db_meeting = models.Meeting(
        mentor_id=mentor_id,
        title=meeting.title,
        room_code=meeting.room_code,
        status=meeting.status
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


@router.get("/verify-intern/{intern_id}")
def verify_intern(intern_id: int, db: Session = Depends(get_db)):
    # Verify if intern exists and is an intern
    user = db.query(models.User).filter(models.User.id == intern_id, models.User.role == "intern").first()
    if not user:
        raise HTTPException(status_code=404, detail="Intern not found or invalid role")
    return {"status": "success", "intern_id": user.id, "name": user.name}

@router.get("", response_model=List[MeetingResponse])
@router.get("/", response_model=List[MeetingResponse])
def get_meetings(db: Session = Depends(get_db), authorization: str = Header(None)):

    # Return active or scheduled meetings. If intern, return all platform meetings for simplicity (or could filter by domain if added to model)
    meetings = db.query(models.Meeting).filter(models.Meeting.status.in_(["active", "scheduled"])).all()
    return meetings


# (Removed duplicated APIRouter definition)

# --- WebSocket Connection Manager ---

global_meeting_active = False

@router.get("/global-status")
def get_global_status():
    global global_meeting_active
    return {"active": global_meeting_active}

@router.post("/global-status")
def set_global_status(active: bool):
    global global_meeting_active
    global_meeting_active = active
    return {"active": global_meeting_active}

class ConnectionManager:

    def __init__(self):
        # Maps room_id -> list of active WebSockets
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        self.active_rooms[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            if websocket in self.active_rooms[room_id]:
                self.active_rooms[room_id].remove(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict):
        if room_id in self.active_rooms:
            for connection in self.active_rooms[room_id]:
                await connection.send_json(message)

manager = ConnectionManager()

# --- Endpoints ---

waiting_rooms: Dict[str, Dict[str, dict]] = {} # room_id -> { intern_id -> { "name": ..., "status": "waiting" } }

class JoinRequest(BaseModel):
    intern_id: str
    name: str

@router.post("/{room_id}/join-request")
async def request_join(room_id: str, req: JoinRequest):
    if room_id not in waiting_rooms:
        waiting_rooms[room_id] = {}
    waiting_rooms[room_id][req.intern_id] = {"name": req.name, "status": "waiting"}
    
    await manager.broadcast_to_room(room_id, {
        "type": "join-request",
        "payload": {"internId": req.intern_id, "name": req.name}
    })
    return {"status": "success"}

@router.get("/{room_id}/waiting-list")
def get_waiting_list(room_id: str):
    return {"waiting": waiting_rooms.get(room_id, {})}

class ApproveRequest(BaseModel):
    intern_id: str
    status: str

@router.post("/{room_id}/approve")
def approve_join(room_id: str, req: ApproveRequest):
    if room_id in waiting_rooms and req.intern_id in waiting_rooms[room_id]:
        waiting_rooms[room_id][req.intern_id]["status"] = req.status
    return {"status": "success"}

@router.get("/{room_id}/join-status/{intern_id}")
def check_join_status(room_id: str, intern_id: str):
    status = "prompt"
    if room_id in waiting_rooms and intern_id in waiting_rooms[room_id]:
        status = waiting_rooms[room_id][intern_id]["status"]
    return {"status": status}

@router.post("/switch-room")
def switch_room(participant_id: int, target_room_id: str, db: Session = Depends(get_db)):
    participant = db.query(models.RoomParticipant).filter(models.RoomParticipant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    participant.current_room_id = target_room_id
    db.commit()
    return {"status": "success", "target_room_id": target_room_id}

@router.post("/{meeting_id}/recall")
async def recall_to_main(meeting_id: str, db: Session = Depends(get_db)):
    db.query(models.RoomParticipant).filter(models.RoomParticipant.meeting_id == meeting_id).update({"current_room_id": meeting_id})
    db.commit()
    
    await manager.broadcast_to_room(meeting_id, {"type": "FORCE_RECALL", "target_room_id": meeting_id})
    return {"status": "Recalled all participants to main room"}

async def auto_close_breakout(meeting_id: str, duration_seconds: int):
    await asyncio.sleep(duration_seconds)
    await manager.broadcast_to_room(
        meeting_id, 
        {"type": "BREAKOUT_EXPIRED", "message": "Breakout session ended. Returning to main room."}
    )

@router.post("/{meeting_id}/start-breakout-timer")
def start_timer(meeting_id: str, duration_minutes: int, background_tasks: BackgroundTasks):
    seconds = duration_minutes * 60
    background_tasks.add_task(auto_close_breakout, meeting_id, seconds)
    return {"status": f"Timer set for {duration_minutes} minutes"}

# --- WebSocket Signaling Endpoint ---

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(room_id, websocket)
    # Notify room that user joined
    await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-join", "payload": {}})
    try:
        while True:
            data = await websocket.receive_json()
            # If it's a state-update or reaction, broadcast it
            msg_type = data.get("type")
            
            if msg_type in ["state-update", "reaction"]:
                await manager.broadcast_to_room(room_id, {"sender": client_id, "type": msg_type, "payload": data})
            else:
                # Relay standard WebRTC signals (offer, answer, ICE)
                await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "webrtc", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-leave", "payload": {}})
    try:
        while True:
            data = await websocket.receive_json()
            # Relay WebRTC signals (offer, answer, ICE candidates) to other room participants
            await manager.broadcast_to_room(room_id, {"sender": client_id, "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"type": "USER_DISCONNECTED", "client_id": client_id})
