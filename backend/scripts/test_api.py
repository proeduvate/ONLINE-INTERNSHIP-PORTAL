import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app.models import User
from app.main import get_intern_tasks_with_unlock_status

def test_api():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "python@gmail.com").first()
        if not user:
            print("User not found")
            return
            
        print(f"Testing for user: {user.email}")
        results = get_intern_tasks_with_unlock_status(db=db, current_user=user)
        print(f"API returned {len(results)} tasks.")
        if results:
            print(f"First result: {results[0]['title']}, unlocked: {results[0]['unlocked']}")
            
    except Exception as e:
        print(f"API Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_api()
