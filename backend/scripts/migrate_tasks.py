import sqlite3
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
from app.db.session import engine

def migrate():
    # Create new tables
    print("Creating new tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "internship_portal.db")
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    print("Migrating tasks table...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tasks table
    cursor.execute("PRAGMA table_info(tasks)")
    task_columns = [col[1] for col in cursor.fetchall()]
    
    if "batch_id" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN batch_id INTEGER REFERENCES batches(id)")
    if "difficulty" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN difficulty VARCHAR(50) DEFAULT 'medium'")
    if "task_type" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN task_type VARCHAR(50) DEFAULT 'coding'")
    if "instructions" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN instructions TEXT")
    if "expected_outcome" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN expected_outcome TEXT")
    if "created_by" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN created_by INTEGER REFERENCES users(id)")
    if "is_active" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN is_active BOOLEAN DEFAULT 1")
        
    print("Migrating submissions table...")
    # Check submissions table
    cursor.execute("PRAGMA table_info(submissions)")
    sub_columns = [col[1] for col in cursor.fetchall()]
    
    if "started_at" not in sub_columns:
        cursor.execute("ALTER TABLE submissions ADD COLUMN started_at DATETIME")
        
    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
