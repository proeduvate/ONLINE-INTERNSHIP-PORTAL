import asyncio
import os
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
import models
import schemas

router = APIRouter(tags=["meetings"])


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
    scheduled_time: Optional[Any] = None
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True


@router.post("", response_model=MeetingResponse)
@router.post("/", response_model=MeetingResponse)
def create_meeting(
    meeting: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", str(current_user.role)).lower()
    if user_role not in ["mentor", "admin"]:
        raise HTTPException(status_code=403, detail="Only mentors and admins can create meetings")

    parsed_time = None
    if meeting.scheduled_time:
        if isinstance(meeting.scheduled_time, datetime):
            parsed_time = meeting.scheduled_time
        elif isinstance(meeting.scheduled_time, str):
            try:
                parsed_time = datetime.fromisoformat(meeting.scheduled_time.replace("Z", "+00:00"))
            except Exception:
                try:
                    parsed_time = datetime.strptime(meeting.scheduled_time, "%Y-%m-%dT%H:%M")
                except Exception:
                    parsed_time = None

    db_meeting = models.Meeting(
        mentor_id=current_user.id,
        title=meeting.title,
        room_code=meeting.room_code,
        status=meeting.status or "scheduled",
        scheduled_time=parsed_time
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


@router.get("/verify-intern/{intern_id}")
def verify_intern(intern_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == intern_id, models.User.role == models.UserRole.INTERN).first()
    if not user:
        raise HTTPException(status_code=404, detail="Intern not found or invalid role")
    return {"status": "success", "intern_id": user.id, "name": user.name}


@router.get("", response_model=List[MeetingResponse])
@router.get("/", response_model=List[MeetingResponse])
def get_meetings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", str(current_user.role)).lower()
    query = db.query(models.Meeting).filter(models.Meeting.status.in_(["active", "scheduled"]))
    if user_role == "mentor":
        query = query.filter(models.Meeting.mentor_id == current_user.id)
    elif user_role == "intern":
        if current_user.mentor_id:
            query = query.filter(models.Meeting.mentor_id == current_user.mentor_id)
    return query.order_by(models.Meeting.id.desc()).all()


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
            stale_connections = []
            for connection in self.active_rooms[room_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    stale_connections.append(connection)
            for stale in stale_connections:
                self.disconnect(room_id, stale)


manager = ConnectionManager()

waiting_rooms: Dict[str, Dict[str, dict]] = {}


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


# --- WebSocket Signaling Endpoints ---

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(room_id, websocket)
    await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-join", "payload": {}})
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            if msg_type in ["state-update", "reaction"]:
                await manager.broadcast_to_room(room_id, {"sender": client_id, "type": msg_type, "payload": data})
            else:
                await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "webrtc", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-leave", "payload": {}})


@router.websocket("/ws/rooms/{room_id}")
async def websocket_rooms_endpoint(websocket: WebSocket, room_id: str):
    client_id = f"peer-{id(websocket)}"
    await manager.connect(room_id, websocket)
    await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-join", "payload": {}})
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "webrtc")
            sender = data.get("sender") or client_id
            await manager.broadcast_to_room(room_id, {"sender": sender, "type": msg_type, "payload": data.get("payload", data)})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-leave", "payload": {}})


# --- Breakout Signaling & Room State ---
SIGNALING_ROOMS: Dict[str, dict] = {}


@router.websocket("/ws/signaling/{room_code}")
async def signaling_websocket(
    room_code: str,
    websocket: WebSocket
):
    await websocket.accept()
    room = SIGNALING_ROOMS.setdefault(room_code, {"participants": {}, "breakouts": {}})
    participant_id = None

    async def broadcast(message: dict, exclude_id: int = None):
        for pid, conn in list(room["participants"].items()):
            if pid == exclude_id:
                continue
            try:
                await conn.send_json(message)
            except Exception:
                pass

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            if action == "join":
                participant_id = data.get("user_id")
                if participant_id is None:
                    await websocket.close(code=1008)
                    return
                room["participants"][participant_id] = websocket
                await broadcast({
                    "action": "participant_joined",
                    "user_id": participant_id,
                    "role": data.get("role")
                }, exclude_id=participant_id)
                await websocket.send_json({"action": "joined", "room_code": room_code})
            elif action in ["offer", "answer", "ice_candidate"]:
                target_id = data.get("target_id")
                if target_id and target_id in room["participants"]:
                    await room["participants"][target_id].send_json(data)
            elif action == "breakout_create":
                breakout_id = data.get("breakout_id") or str(uuid.uuid4())
                room["breakouts"][breakout_id] = {"members": [participant_id]} if participant_id else {"members": []}
                await broadcast({"action": "breakout_created", "breakout_id": breakout_id})
            elif action == "breakout_join":
                breakout_id = data.get("breakout_id")
                if breakout_id in room["breakouts"] and participant_id is not None:
                    members = room["breakouts"][breakout_id].get("members", [])
                    if participant_id not in members:
                        members.append(participant_id)
                    room["breakouts"][breakout_id]["members"] = members
                    await broadcast({"action": "breakout_joined", "breakout_id": breakout_id, "user_id": participant_id})
            elif action == "breakout_leave":
                breakout_id = data.get("breakout_id")
                if breakout_id in room["breakouts"] and participant_id is not None:
                    members = room["breakouts"][breakout_id].get("members", [])
                    if participant_id in members:
                        members.remove(participant_id)
                    room["breakouts"][breakout_id]["members"] = members
                    await broadcast({"action": "breakout_left", "breakout_id": breakout_id, "user_id": participant_id})
            elif action == "leave":
                if participant_id in room["participants"]:
                    room["participants"].pop(participant_id, None)
                await websocket.close()
                return
            else:
                await broadcast(data, exclude_id=participant_id)
    except WebSocketDisconnect:
        if participant_id and participant_id in room["participants"]:
            room["participants"].pop(participant_id, None)
            await broadcast({"action": "participant_left", "user_id": participant_id})


@router.get("/meetings/{room_code}/breakouts")
@router.get("/{room_code}/breakouts")
def get_meeting_breakouts(
    room_code: str,
    current_user: models.User = Depends(get_current_user)
):
    room = SIGNALING_ROOMS.get(room_code)
    if not room:
        raise HTTPException(status_code=404, detail="Meeting room not found or no signaling session yet")
    return {
        "room_code": room_code,
        "participants": list(room["participants"].keys()),
        "breakouts": room["breakouts"]
    }


@router.post("/meetings/{room_code}/close")
@router.post("/{room_code}/close")
def close_meeting(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", str(current_user.role)).lower()
    if user_role not in ["mentor", "admin"]:
        raise HTTPException(status_code=403, detail="Only mentors and admins can close meeting rooms")

    meet = db.query(models.Meeting).filter(
        models.Meeting.room_code == room_code
    ).first()

    if not meet:
        raise HTTPException(status_code=404, detail="Meeting room not found")

    meet.status = "completed"
    db.add(meet)
    db.commit()
    return {"message": "Meeting closed"}
