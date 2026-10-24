import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app.models import User, Task

def check_tasks():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "python@gmail.com").first()
        if not user:
            print("User not found.")
            return

        tasks = db.query(Task).filter(
            Task.domain_id == user.domain_id,
            Task.task_type == "coding"
        ).order_by(Task.day_number).all()

        print(f"Found {len(tasks)} coding tasks for Python domain.")
        for t in tasks[:2]:
            print(f"Day {t.day_number}: {t.title}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_tasks()
