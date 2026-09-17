import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Task, Submission

def clear_all_tasks():
    db = SessionLocal()
    try:
        # First delete all submissions because they depend on tasks
        deleted_subs = db.query(Submission).delete()
        print(f"Deleted {deleted_subs} submissions to satisfy foreign key constraints.")
        
        # Now delete all tasks
        deleted_tasks = db.query(Task).delete()
        print(f"Deleted {deleted_tasks} tasks.")
        
        db.commit()
        print("Successfully cleared all data from the tasks table!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_tasks()
