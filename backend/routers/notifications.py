"""
Communication & Notifications Router (A10)
Handles Notifications, Announcements, and 1-on-1 Messages.
"""

from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from dependencies import get_current_user
import models
import schemas
from services.scheduler_service import send_daily_reminders, process_end_of_day_deadline, start_scheduler

router = APIRouter(prefix="", tags=["Notifications & Communication"])


# ==========================================
#           NOTIFICATIONS
# ==========================================

@router.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.put("/notifications/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


# ==========================================
#           ANNOUNCEMENTS
# ==========================================

@router.post("/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(
    data: schemas.AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(status_code=403, detail="Only admins and mentors can create announcements")

    announcement = models.Announcement(
        sender_id=current_user.id,
        title=data.title,
        content=data.content,
        target_role=data.target_role or "all"
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.get("/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Announcement)
    if current_user.role == models.UserRole.INTERN:
        query = query.filter(models.Announcement.target_role.in_(["all", "intern"]))
    elif current_user.role == models.UserRole.MENTOR:
        query = query.filter(models.Announcement.target_role.in_(["all", "mentor"]))
    announcements = query.order_by(models.Announcement.created_at.desc()).all()
    return announcements


# ==========================================
#           DIRECT MESSAGES
# ==========================================

@router.post("/messages", response_model=schemas.MessageResponse)
def send_message(
    data: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    receiver = db.query(models.User).filter(models.User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Restriction: Intern cannot message another intern
    if current_user.role == models.UserRole.INTERN and receiver.role == models.UserRole.INTERN:
        raise HTTPException(
            status_code=400,
            detail="Restriction violation: Interns cannot message other interns"
        )

    # Check if intern is messaging their assigned mentor, or mentor messaging an intern
    if current_user.role == models.UserRole.INTERN:
        if receiver.role != models.UserRole.MENTOR:
            raise HTTPException(
                status_code=403,
                detail="Access Denied: Interns can only message a mentor"
            )
        # Auto-link mentor if not set
        if not current_user.mentor_id:
            current_user.mentor_id = receiver.id
            db.commit()
            db.refresh(current_user)

    if current_user.role == models.UserRole.MENTOR:
        if receiver.role != models.UserRole.INTERN:
            raise HTTPException(
                status_code=400,
                detail="Mentors can only direct message interns"
            )
        if not receiver.mentor_id:
            receiver.mentor_id = current_user.id
            db.commit()

    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
        file_url=data.file_url
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg


@router.get("/messages")
def get_messages(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    contact_user = db.query(models.User).filter(models.User.id == contact_id).first()
    if not contact_user:
        raise HTTPException(status_code=404, detail="Contact user not found")

    if current_user.role == models.UserRole.INTERN:
        if contact_user.role != models.UserRole.MENTOR:
            raise HTTPException(status_code=403, detail="Access Denied: Interns may only retrieve messages with a mentor")
        if not current_user.mentor_id:
            current_user.mentor_id = contact_user.id
            db.commit()

    if current_user.role == models.UserRole.MENTOR:
        if contact_user.role != models.UserRole.INTERN:
            raise HTTPException(status_code=403, detail="Access Denied: Mentors may only retrieve messages with interns")

    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == contact_id)) |
        ((models.Message.sender_id == contact_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.sent_at).all()

    return messages
