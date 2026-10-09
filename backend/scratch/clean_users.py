import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal
import models
from sqlalchemy import func

def clean_extra_users():
    db = SessionLocal()
    try:
        allowed_emails = [
            "admin@gmail.com",
            "mentor@gmail.com",
            "kaul190905@gmail.com"
        ]
        allowed_emails_lower = [e.lower() for e in allowed_emails]

        all_users = db.query(models.User).all()
        print(f"Total users currently in DB: {len(all_users)}")
        for u in all_users:
            print(f" - ID: {u.id}, Email: '{u.email}', Role: {u.role}")

        users_to_delete = db.query(models.User).filter(
            ~func.lower(models.User.email).in_(allowed_emails_lower)
        ).all()

        delete_ids = [u.id for u in users_to_delete]
        print(f"\nTarget user IDs to delete: {delete_ids}")

        if delete_ids:
            # 1. Unlink Onboarding Applications
            db.query(models.OnboardingApplication).filter(
                models.OnboardingApplication.user_id.in_(delete_ids)
            ).update({models.OnboardingApplication.user_id: None}, synchronize_session=False)

            # 2. Delete Tickets created by or assigned to deleted users
            db.query(models.Ticket).filter(
                (models.Ticket.intern_id.in_(delete_ids)) | 
                (models.Ticket.created_by.in_(delete_ids)) | 
                (models.Ticket.assigned_to_id.in_(delete_ids))
            ).delete(synchronize_session=False)

            # 3. Delete Submissions
            db.query(models.Submission).filter(
                models.Submission.intern_id.in_(delete_ids)
            ).delete(synchronize_session=False)

            # 4. Delete Attendance Logs
            db.query(models.AttendanceLog).filter(
                models.AttendanceLog.intern_id.in_(delete_ids)
            ).delete(synchronize_session=False)

            # 5. Delete Meetings
            db.query(models.Meeting).filter(
                (models.Meeting.mentor_id.in_(delete_ids)) |
                (models.Meeting.intern_id.in_(delete_ids))
            ).delete(synchronize_session=False)

            # 6. Delete Notifications
            db.query(models.Notification).filter(
                models.Notification.user_id.in_(delete_ids)
            ).delete(synchronize_session=False)

            # 7. Delete Certificates
            db.query(models.Certificate).filter(
                models.Certificate.intern_id.in_(delete_ids)
            ).delete(synchronize_session=False)

            # 8. Unlink mentor_id for any other users pointing to deleted users
            db.query(models.User).filter(
                models.User.mentor_id.in_(delete_ids)
            ).update({models.User.mentor_id: None}, synchronize_session=False)

            # 9. Delete Users
            db.query(models.User).filter(
                models.User.id.in_(delete_ids)
            ).delete(synchronize_session=False)

            db.commit()
            print("\nSuccessfully cleaned up database!")
        else:
            print("\nNo users need deletion.")

        remaining = db.query(models.User).all()
        print(f"\nRemaining accounts in DB ({len(remaining)}):")
        for u in remaining:
            print(f" - ID: {u.id}, Email: '{u.email}', Name: '{u.name}', Role: {u.role}")

    except Exception as e:
        db.rollback()
        print("Error during database cleanup:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    clean_extra_users()
