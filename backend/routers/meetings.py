from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, BackgroundTasks
from typing import Dict, List
from sqlalchemy.orm import Session
import asyncio

# Assuming dependencies.py or database.py exports get_db
# Adjust import path relative to backend root
from app.db.session import get_db 
from app import models, schemas

router = APIRouter(prefix="/meetings", tags=["meetings"])

# --- WebSocket Connection Manager ---
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
    try:
        while True:
            data = await websocket.receive_json()
            # Relay WebRTC signals (offer, answer, ICE candidates) to other room participants
            await manager.broadcast_to_room(room_id, {"sender": client_id, "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"type": "USER_DISCONNECTED", "client_id": client_id})