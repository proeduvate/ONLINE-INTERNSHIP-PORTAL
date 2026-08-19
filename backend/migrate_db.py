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
            
            # Add new columns to daily_question_results
            conn.execute(text("ALTER TABLE daily_question_results ADD COLUMN IF NOT EXISTS mcq_score FLOAT DEFAULT 0.0;"))
            conn.execute(text("ALTER TABLE daily_question_results ADD COLUMN IF NOT EXISTS coding_score FLOAT DEFAULT 0.0;"))
            conn.execute(text("ALTER TABLE daily_question_results ADD COLUMN IF NOT EXISTS final_score FLOAT DEFAULT 0.0;"))
            
            try:
                # Add winner_count if it doesn't exist
                conn.execute(text("ALTER TABLE bonus_airdrops ADD COLUMN IF NOT EXISTS winner_count INTEGER DEFAULT 1;"))
            except Exception as e:
                print(f"Error adding winner_count column: {e}")
                
            try:
                # Fallback to rename just in case
                conn.execute(text("ALTER TABLE bonus_airdrops RENAME COLUMN winner_percentage TO winner_count;"))
            except Exception as e:
                pass

            conn.commit()
            print("Successfully altered tables.")
        except Exception as e:
            print(f"Error altering tables: {e}")
            conn.rollback()
        
        # Create new tables if they don't exist
        models.Base.metadata.create_all(bind=engine)
        print("Created missing tables.")

if __name__ == "__main__":
    migrate()
