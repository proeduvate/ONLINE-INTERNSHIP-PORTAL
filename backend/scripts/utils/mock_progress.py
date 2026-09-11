import sys
import os
from datetime import datetime, timezone

sys.path.append(os.path.dirname(__file__))
from app.db.session import engine
from sqlalchemy import text

def mock_progress():
    with engine.connect() as conn:
        intern_id_row = conn.execute(text("SELECT id, domain_id FROM users WHERE email='intern1@gmail.com'")).fetchone()
        if not intern_id_row:
            print("Intern not found.")
            return
        intern_id, domain_id = intern_id_row
        
        tasks = conn.execute(text(f"SELECT id, day_number FROM tasks WHERE domain_id={domain_id} AND day_number <= 11")).fetchall()
        
        now = datetime.now(timezone.utc)
        for task in tasks:
            task_id = task[0]
            exists = conn.execute(text(f"SELECT id FROM submissions WHERE intern_id={intern_id} AND task_id={task_id}")).fetchone()
            if not exists:
                conn.execute(text("""
                    INSERT INTO submissions (intern_id, task_id, status, submitted_at, ai_score, mcq_score)
                    VALUES (:intern_id, :task_id, 'approved', :now, 100, 100)
                """), {"intern_id": intern_id, "task_id": task_id, "now": now})
                
        day1_task = [t[0] for t in tasks if t[1] == 1]
        if day1_task:
            task_id = day1_task[0]
            req = conn.execute(text(f"SELECT id FROM github_repository_requests WHERE intern_id={intern_id} AND task_id={task_id}")).fetchone()
            if not req:
                conn.execute(text("""
                    INSERT INTO github_repository_requests (intern_id, task_id, repository_url, request_status, requested_at, approved_at)
                    VALUES (:intern_id, :task_id, 'https://github.com/proeduvate-interns/intern1-react-day1', 'assigned', :now, :now)
                """), {"intern_id": intern_id, "task_id": task_id, "now": now})
                
        conn.commit()
        print("Mock progress and repo request generated successfully!")

if __name__ == "__main__":
    mock_progress()
