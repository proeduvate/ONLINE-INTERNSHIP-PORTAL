from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
import models
import schemas
from typing import List, Optional, Dict, Any, Tuple

router = APIRouter(prefix="", tags=["Notifications"])

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
#           SCHEDULED JOBS
# ==========================================

def send_daily_reminders(time_of_day: str):
    db = database.SessionLocal()
    try:
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        for intern in interns:
            # Check if intern completed today's task
            now = datetime.utcnow()
            completed_today = db.query(models.Submission).filter(
                models.Submission.intern_id == intern.id,
                models.Submission.attendance_marked == True,
                models.Submission.submitted_at >= now.replace(hour=0, minute=0, second=0, microsecond=0)
            ).first()

            if not completed_today:
                if time_of_day == "morning":
                    title = "Morning Reminder"
                    message = "📚 Good Morning! It's time to begin your internship tasks today. Complete your lesson, MCQ, and coding assignment to maintain your learning streak."
                elif time_of_day == "afternoon":
                    title = "Afternoon Reminder"
                    message = "⏰ Reminder! You haven't completed today's internship tasks yet. Finish your activities before the deadline to avoid being marked absent."
                elif time_of_day == "evening":
                    title = "Final Reminder"
                    message = "⚠️ Final Reminder! Today is almost over. Complete your lesson, MCQ, and coding assignment before the deadline. Otherwise, today's attendance will be marked as Absent."
                else:
                    continue

                reminder = models.Notification(
                    user_id=intern.id,
                    title=title,
                    message=message,
                    type="daily_reminder"
                )
                db.add(reminder)
        db.commit()
    except Exception as e:
        print(f"Error sending {time_of_day} reminders: {e}")
    finally:
        db.close()


def process_end_of_day_deadline():
    db = database.SessionLocal()
    try:
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        now = datetime.utcnow()
        for intern in interns:
            completed_today = db.query(models.Submission).filter(
                models.Submission.intern_id == intern.id,
                models.Submission.attendance_marked == True,
                models.Submission.submitted_at >= now.replace(hour=0, minute=0, second=0, microsecond=0)
            ).first()

            if not completed_today:
                intern.learning_streak = 0
                db.add(models.AttendanceLog(intern_id=intern.id, status="absent", note="Failed to submit daily task before deadline"))
                
                reminder = models.Notification(
                    user_id=intern.id,
                    title="Deadline Missed",
                    message="Today's deadline has passed. Your attendance has been marked as Absent and your learning streak was reset.",
                    type="system"
                )
                db.add(reminder)
        db.commit()
    except Exception as e:
        print(f"Error processing end of day deadline: {e}")
    finally:
        db.close()


@router.on_event("startup")
def start_scheduler():
    scheduler = BackgroundScheduler()
    # UTC times mapped from IST: 9 AM IST = 3:30 AM UTC, 2 PM IST = 8:30 AM UTC, 7 PM IST = 1:30 PM UTC
    scheduler.add_job(send_daily_reminders, 'cron', hour=3, minute=30, args=["morning"])
    scheduler.add_job(send_daily_reminders, 'cron', hour=8, minute=30, args=["afternoon"])
    scheduler.add_job(send_daily_reminders, 'cron', hour=13, minute=30, args=["evening"])
    # 11:59 PM IST = 6:29 PM UTC
    scheduler.add_job(process_end_of_day_deadline, 'cron', hour=18, minute=29)
    scheduler.start()


@router.get("/certificate/verify/{certificate_id}")
def verify_certificate(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    cert = db.query(models.Certificate).filter(models.Certificate.certificate_id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    intern = db.query(models.User).filter(models.User.id == cert.intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found for certificate")

    domain = db.query(models.Domain).filter(models.Domain.id == intern.domain_id).first()
    mentor = db.query(models.User).filter(models.User.id == intern.mentor_id).first()

    return {
        "certificate_id": cert.certificate_id,
        "intern_name": intern.name,
        "intern_id": intern.intern_id,
        "college": intern.college,
        "domain": domain.name if domain else "Tech domain",
        "mentor_name": mentor.name if mentor else "Lead Mentor",
        "grade": cert.grade,
        "final_score": cert.final_score,
        "issued_at": cert.generated_at.strftime("%Y-%m-%d")
    }


# ==========================================
#      BACKWARD COMPATIBILITY ENDPOINTS
# ==========================================

@router.post("/internships", status_code=status.HTTP_201_CREATED)
def create_internship(
    internship_data: schemas.InternshipCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_internship = models.Internship(
        title=internship_data.title,
        company_name=internship_data.company_name,
        description=internship_data.description,
        location=internship_data.location,
        stipend=internship_data.stipend,
        posted_by=current_user.id
    )
    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)
    return {"message": "Internship posted", "internship_id": new_internship.id}


@router.get("/internships")
def get_all_internships(db: Session = Depends(get_db)):
    return db.query(models.Internship).all()


@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_internship(
    application_data: schemas.ApplicationCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_application = models.Application(
        internship_id=application_data.internship_id,
        user_id=current_user.id,
        resume_url=application_data.resume_url,
        status="Pending"
    )
    db.add(new_application)
    db.commit()
    return {"message": "Application submitted"}

