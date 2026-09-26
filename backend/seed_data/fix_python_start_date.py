import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app.models import User

def fix_user_start_date():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "python@gmail.com").first()
        if user:
            user.start_date = datetime.utcnow()
            db.commit()
            print("Successfully updated start_date for python@gmail.com to today!")
        else:
            print("User not found.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_start_date()
