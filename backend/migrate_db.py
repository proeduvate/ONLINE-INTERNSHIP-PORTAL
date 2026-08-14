import os
import urllib.parse
from sqlalchemy import text
import database
import models

def migrate():
    engine = database.engine
    with engine.connect() as conn:
        try:
            # Check if column exists, if not add it
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_task_completion_date TIMESTAMP;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_streak INTEGER DEFAULT 0;"))
            conn.commit()
            print("Successfully altered users table.")
        except Exception as e:
            print(f"Error altering users table: {e}")
            conn.rollback()
        
        # Create new tables if they don't exist
        models.Base.metadata.create_all(bind=engine)
        print("Created missing tables.")

if __name__ == "__main__":
    migrate()
