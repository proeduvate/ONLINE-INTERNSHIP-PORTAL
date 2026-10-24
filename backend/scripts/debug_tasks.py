import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app.models import User, Task

def debug_tasks():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "python@gmail.com").first()
        if not user:
            print("python@gmail.com not found")
            return
            
        print(f"python@gmail.com domain_id: {user.domain_id}")
        
        tasks = db.query(Task).filter(
            Task.domain_id == user.domain_id,
            Task.task_type == "coding"
        ).order_by(Task.day_number).all()
        
        print(f"Found {len(tasks)} coding tasks for this user's domain")
        if tasks:
            print(f"First task: {tasks[0].title}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_tasks()
