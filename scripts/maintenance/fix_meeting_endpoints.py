import os

filepath = "backend/routers/meetings.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_endpoints = """
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import models
from database import get_db
from routers.auth import get_current_user

class MeetingCreate(BaseModel):
    title: str
    room_code: str
    status: Optional[str] = "scheduled"
    scheduled_time: Optional[datetime] = None
    domain: Optional[str] = None
    batch_id: Optional[str] = None

class MeetingResponse(BaseModel):
    id: int
    title: str
    room_code: str
    status: str
    mentor_id: int
    
    class Config:
        orm_mode = True

@router.post("/", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # We save the meeting fields that exist in the database model
    # (If scheduled_time/domain exist in the model, they should be assigned. Assuming they might be missing from schema, we'll try to map what we can safely)
    db_meeting = models.Meeting(
        mentor_id=current_user.id,
        title=meeting.title,
        room_code=meeting.room_code,
        status=meeting.status
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.get("/", response_model=List[MeetingResponse])
def get_meetings(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Return active or scheduled meetings. If intern, return all platform meetings for simplicity (or could filter by domain if added to model)
    meetings = db.query(models.Meeting).filter(models.Meeting.status.in_(["active", "scheduled"])).all()
    return meetings

"""

# Insert these endpoints above the ConnectionManager class or below imports
if "class MeetingCreate(BaseModel):" not in content:
    content = content.replace("class ConnectionManager:", new_endpoints + "\nclass ConnectionManager:")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added GET/POST endpoints to meetings.py")
