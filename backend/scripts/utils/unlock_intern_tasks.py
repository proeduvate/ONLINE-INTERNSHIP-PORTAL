import sys
import os

# Ensure backend root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.db.session import SessionLocal
from app import models
from datetime import datetime

def unlock_previous_days_for_interns():
    db = SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        for u in users:
            if not u.domain_id:
                continue
            print(f"Checking user {u.email} (ID {u.id}, Domain {u.domain_id})")
            tasks = db.query(models.Task).filter(
                models.Task.domain_id == u.domain_id,
                models.Task.task_type == "coding"
            ).order_by(models.Task.day_number).all()

            for t in tasks:
                if t.day_number >= 4:
                    # We are unlocking days 1, 2, 3
                    break

                existing = db.query(models.Submission).filter(
                    models.Submission.intern_id == u.id,
                    models.Submission.task_id == t.id,
                    models.Submission.status.in_(["submitted", "approved"])
                ).first()

                if not existing:
                    print(f"  Adding submitted entry for Day {t.day_number} (Task {t.id})")
                    sub = models.Submission(
                        intern_id=u.id,
                        task_id=t.id,
                        status="submitted",
                        code_submission="// Completed baseline task\n",
                        ai_score=85,
                        ai_feedback="Auto-completed for testing baseline progression",
                        submitted_at=datetime.utcnow(),
                        attendance_marked=True
                    )
                    db.add(sub)
        
        db.commit()
        print("Successfully unlocked previous days for test interns!")
    except Exception as e:
        db.rollback()
        print(f"Error unlocking tasks: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    unlock_previous_days_for_interns()
