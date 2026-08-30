import os
import uuid
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from agora_token_builder import RtcTokenBuilder, Role_Attendee

# Core Application Imports
import database
import models
import schemas
import auth

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Agora Environment Configurations
AGORA_APP_ID = os.getenv("AGORA_APP_ID")
AGORA_APP_CERTIFICATE = os.getenv("AGORA_APP_CERTIFICATE")
AGORA_TOKEN_EXPIRATION_IN_SECONDS = 3600  # 1 hour

if not AGORA_APP_ID or not AGORA_APP_CERTIFICATE:
    logger.warning("Agora credentials (AGORA_APP_ID, AGORA_APP_CERTIFICATE) are not fully configured.")

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings & Breakout Rooms"]
)

# Helper Functions
def generate_room_code() -> str:
    return f"room-{uuid.uuid4().hex[:8]}"

def generate_rtc_token(user_id: int, channel_name: str, role: int = Role_Attendee) -> str:
    """Generates an Agora RTC token for video/audio communication."""
    if not AGORA_APP_ID or not AGORA_APP_CERTIFICATE:
        logger.error("Attempted to generate RTC token without Agora App ID or App Certificate.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Agora credentials are not set."
        )

    current_timestamp = int(datetime.now(timezone.utc).timestamp())
    privilege_expired_ts = current_timestamp + AGORA_TOKEN_EXPIRATION_IN_SECONDS
    
    token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel_name,
        user_id,
        role,
        privilege_expired_ts
    )
    return token

# ==========================================
#        AGORA TOKEN & ROOM ENDPOINTS
# ==========================================

@router.get("/token", response_model=schemas.RoomTokenResponse)
async def get_room_token(
    room_id: str = Query(..., description="The room code or channel identifier"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Generates an RTC token for joining a main meeting or breakout room."""
    user_role = str(current_user.role).lower()
    
    # Check if target is a Main Meeting or a Breakout Room
    meeting = db.query(models.Meeting).filter(models.Meeting.room_code == room_id).first()
    breakout_room = db.query(models.BreakoutRoom).filter(models.BreakoutRoom.room_code == room_id).first()

    if not meeting and not breakout_room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting room not found.")

    # Access control & status validation
    if meeting and meeting.status == "closed":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This meeting room is closed.")
    if breakout_room and breakout_room.status == "closed":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This breakout room is currently closed.")

    channel_name = f"internship_portal_{room_id}"
    token = generate_rtc_token(current_user.id, channel_name, Role_Attendee)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=AGORA_TOKEN_EXPIRATION_IN_SECONDS)

    return schemas.RoomTokenResponse(
        room_id=room_id,
        channel_name=channel_name,
        token=token,
        user_id=str(current_user.id),
        role=user_role,
        expires_at=expires_at,
    )

# ==========================================
#          MAIN MEETING ENDPOINTS
# ==========================================

@router.post("/", response_model=schemas.MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    meeting: schemas.MeetingCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Creates a main meeting room (Mentors/Admins only)."""
    user_role = str(current_user.role).lower()
    if user_role not in ["mentor", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only mentors and admins can create meetings.")

    db_meeting = models.Meeting(
        title=meeting.title,
        scheduled_time=meeting.scheduled_time,
        duration_minutes=meeting.duration_minutes,
        mentor_id=current_user.id,
        room_code=generate_room_code(),
        status="active"
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.get("/", response_model=List[schemas.MeetingResponse])
def list_meetings(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Lists all active meetings."""
    return db.query(models.Meeting).filter(models.Meeting.status != "closed").all()

@router.get("/{meeting_id}", response_model=schemas.MeetingResponse)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Gets details of a specific meeting including breakout rooms."""
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return db_meeting

# ==========================================
#        BREAKOUT ROOM ENDPOINTS
# ==========================================

@router.post("/{meeting_id}/breakout-rooms", response_model=schemas.BreakoutRoomResponse, status_code=status.HTTP_201_CREATED)
def create_breakout_room(
    meeting_id: int,
    breakout: schemas.BreakoutRoomBase,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Creates a new breakout room attached to a main meeting."""
    user_role = str(current_user.role).lower()
    if user_role not in ["mentor", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only mentors and admins can create breakout rooms.")

    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent meeting not found.")

    db_room = models.BreakoutRoom(
        meeting_id=meeting_id,
        title=breakout.title,
        max_participants=breakout.max_participants,
        room_code=generate_room_code(),
        status="active"
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.get("/{meeting_id}/breakout-rooms", response_model=List[schemas.BreakoutRoomResponse])
def list_breakout_rooms(
    meeting_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Lists all active breakout rooms for a specific meeting."""
    return db.query(models.BreakoutRoom).filter(
        models.BreakoutRoom.meeting_id == meeting_id,
        models.BreakoutRoom.status != "closed"
    ).all()

@router.patch("/breakout-rooms/{room_id}/close", response_model=schemas.BreakoutRoomResponse)
def close_breakout_room(
    room_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Closes/deactivates a breakout room."""
    user_role = str(current_user.role).lower()
    if user_role not in ["mentor", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only mentors and admins can close breakout rooms.")

    db_room = db.query(models.BreakoutRoom).filter(models.BreakoutRoom.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Breakout room not found.")
    
    db_room.status = "closed"
    db.commit()
    db.refresh(db_room)
    return db_room
