"""
Background Scheduler Service for ProEduvate Online Internship Portal.
Centralizes automated reminders, daily deadlines, and database maintenance.
"""

import logging
from datetime import datetime, timezone
import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

import database
import models

logger = logging.getLogger(__name__)

_scheduler = None


def send_daily_reminders(time_of_day: str):
    """
    Sends automated reminders to interns who have not completed today's tasks.
    Runs at morning (9 AM IST), afternoon (2 PM IST), and evening (7 PM IST).
    """
    db = database.SessionLocal()
    try:
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        for intern in interns:
            completed_today = db.query(models.Submission).filter(
                models.Submission.intern_id == intern.id,
                models.Submission.attendance_marked == True,
                models.Submission.submitted_at >= today_start
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
        logger.error(f"[SchedulerService] Error sending {time_of_day} reminders: {e}")
    finally:
        db.close()


def process_end_of_day_deadline():
    """
    Evaluates end-of-day deadline at 11:59 PM IST (18:29 UTC).
    Marks unsubmitted interns as absent and resets their learning streak.
    """
    db = database.SessionLocal()
    try:
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        for intern in interns:
            completed_today = db.query(models.Submission).filter(
                models.Submission.intern_id == intern.id,
                models.Submission.attendance_marked == True,
                models.Submission.submitted_at >= today_start
            ).first()

            if not completed_today:
                intern.learning_streak = 0
                db.add(models.AttendanceLog(
                    intern_id=intern.id,
                    status="absent",
                    note="Failed to submit daily task before deadline"
                ))

                reminder = models.Notification(
                    user_id=intern.id,
                    title="Deadline Missed",
                    message="Today's deadline has passed. Your attendance has been marked as Absent and your learning streak was reset.",
                    type="system"
                )
                db.add(reminder)
        db.commit()
    except Exception as e:
        logger.error(f"[SchedulerService] Error processing end of day deadline: {e}")
    finally:
        db.close()


def scheduled_daily_cleanup():
    """Daily midnight maintenance task."""
    logger.info("[SchedulerService] Executing scheduled daily maintenance cleanup.")


def start_scheduler():
    """Initializes and starts the single application-wide BackgroundScheduler."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        return _scheduler

    _scheduler = BackgroundScheduler(timezone=pytz.UTC)

    # UTC times mapped from IST: 9 AM IST = 3:30 AM UTC, 2 PM IST = 8:30 AM UTC, 7 PM IST = 1:30 PM UTC
    _scheduler.add_job(send_daily_reminders, 'cron', hour=3, minute=30, args=["morning"], id="daily_reminders_morning")
    _scheduler.add_job(send_daily_reminders, 'cron', hour=8, minute=30, args=["afternoon"], id="daily_reminders_afternoon")
    _scheduler.add_job(send_daily_reminders, 'cron', hour=13, minute=30, args=["evening"], id="daily_reminders_evening")

    # 11:59 PM IST = 18:29 UTC
    _scheduler.add_job(process_end_of_day_deadline, 'cron', hour=18, minute=29, id="end_of_day_deadline")

    # Midnight UTC cleanup
    _scheduler.add_job(scheduled_daily_cleanup, 'cron', hour=0, minute=0, id="daily_cleanup")

    try:
        _scheduler.start()
        logger.info("[SchedulerService] BackgroundScheduler successfully started.")
    except Exception as e:
        logger.error(f"[SchedulerService] Failed to start BackgroundScheduler: {e}")

    return _scheduler


def shutdown_scheduler():
    """Stops the scheduler safely if running."""
    global _scheduler
    if _scheduler is not None and _scheduler.running:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("[SchedulerService] BackgroundScheduler stopped.")

