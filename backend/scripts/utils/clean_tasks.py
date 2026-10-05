import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine

def clean_table():
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM submissions WHERE task_id IN (SELECT id FROM tasks WHERE task_type = 'simulation' OR title LIKE '%Workplace Simulation%');"))
        result = conn.execute(text("DELETE FROM tasks WHERE task_type = 'simulation' OR title LIKE '%Workplace Simulation%';"))
        print(f"Deleted {result.rowcount} rows.")

if __name__ == "__main__":
    clean_table()
