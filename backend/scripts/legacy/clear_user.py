from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()
email = '23cse134@act.edu.in'

try:
    user = db.execute(text("SELECT id FROM users WHERE email=:email"), {"email": email}).fetchone()
    if user:
        uid = user[0]
        tables = ['attendance_logs', 'applications', 'submissions', 'meeting_participants', 'notifications', 'intern_progress', 'onboarding_applications']
        for table in tables:
            try:
                db.execute(text(f"DELETE FROM {table} WHERE user_id=:uid"), {"uid": uid})
                db.commit()
            except Exception:
                db.rollback()
            try:
                db.execute(text(f"DELETE FROM {table} WHERE intern_id=:uid"), {"uid": uid})
                db.commit()
            except Exception:
                db.rollback()
        
        try:
            db.execute(text("DELETE FROM users WHERE id=:uid"), {"uid": uid})
            db.commit()
            print("Successfully cleared user and application data for", email)
        except Exception as e:
            db.rollback()
            print("Error deleting user:", e)
    else:
        print("User not found.")
except Exception as e:
    print("Error:", e)
finally:
    db.close()
