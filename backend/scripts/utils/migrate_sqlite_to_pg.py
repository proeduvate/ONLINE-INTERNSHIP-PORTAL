import sqlite3
import os
import sys
sys.path.append(os.path.dirname(__file__))
from app.db.session import engine
from sqlalchemy import text

sqlite_db_path = os.path.join(os.path.dirname(__file__), "internship_portal.db")

def migrate():
    conn_sqlite = sqlite3.connect(sqlite_db_path)
    cursor_sqlite = conn_sqlite.cursor()
    
    with engine.connect() as conn_pg:
        # Migrate tasks
        tasks = cursor_sqlite.execute("SELECT id, domain_id, day_number, title, description, instructions, task_type, difficulty FROM tasks").fetchall()
        for task in tasks:
            try:
                conn_pg.execute(text("""
                    INSERT INTO tasks (id, domain_id, day_number, title, description, instructions, task_type, difficulty)
                    VALUES (:id, :domain_id, :day_number, :title, :description, :instructions, :task_type, :difficulty)
                    ON CONFLICT (id) DO UPDATE SET
                    title=EXCLUDED.title, description=EXCLUDED.description, instructions=EXCLUDED.instructions, difficulty=EXCLUDED.difficulty
                """), {
                    "id": task[0], "domain_id": task[1], "day_number": task[2], "title": task[3], 
                    "description": task[4], "instructions": task[5], "task_type": task[6], "difficulty": task[7]
                })
            except Exception as e:
                print(f"Failed to insert task {task[0]}: {e}")
        
        # Migrate github_repository_requests
        try:
            reqs = cursor_sqlite.execute("SELECT id, intern_id, task_id, repository_url, request_status, requested_at, approved_at FROM github_repository_requests").fetchall()
            for req in reqs:
                try:
                    conn_pg.execute(text("""
                        INSERT INTO github_repository_requests (id, intern_id, task_id, repository_url, request_status, requested_at, approved_at)
                        VALUES (:id, :intern_id, :task_id, :repository_url, :request_status, :requested_at, :approved_at)
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        "id": req[0], "intern_id": req[1], "task_id": req[2], "repository_url": req[3],
                        "request_status": req[4], "requested_at": req[5], "approved_at": req[6]
                    })
                except Exception as e:
                    print(f"Failed to insert repo request {req[0]}: {e}")
        except Exception as e:
            print("No github_repository_requests in sqlite")
            
        # Migrate submissions
        try:
            subs = cursor_sqlite.execute("SELECT id, task_id, intern_id, github_url, live_url, status, ai_score, ai_feedback, point_awarded, is_scraped, content, screenshot_url, ai_points, submitted_at, graded_at FROM submissions").fetchall()
            for sub in subs:
                try:
                    conn_pg.execute(text("""
                        INSERT INTO submissions (id, task_id, intern_id, github_url, live_url, status, ai_score, ai_feedback, point_awarded, is_scraped, content, screenshot_url, ai_points, submitted_at, graded_at)
                        VALUES (:id, :task_id, :intern_id, :github_url, :live_url, :status, :ai_score, :ai_feedback, :point_awarded, :is_scraped, :content, :screenshot_url, :ai_points, :submitted_at, :graded_at)
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        "id": sub[0], "task_id": sub[1], "intern_id": sub[2], "github_url": sub[3],
                        "live_url": sub[4], "status": sub[5], "ai_score": sub[6], "ai_feedback": sub[7],
                        "point_awarded": sub[8], "is_scraped": sub[9], "content": sub[10], "screenshot_url": sub[11],
                        "ai_points": sub[12], "submitted_at": sub[13], "graded_at": sub[14]
                    })
                except Exception as e:
                    print(f"Failed to insert submission {sub[0]}: {e}")
        except Exception as e:
            print("No submissions in sqlite or error")
            
        conn_pg.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
