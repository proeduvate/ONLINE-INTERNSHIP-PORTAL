import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine

def alter_table():
    with engine.begin() as conn:
        # Delete old data
        conn.execute(text("DELETE FROM daily_scenarios;"))
        print("Deleted old data from daily_scenarios.")
        
        # Add domain column if not exists
        try:
            conn.execute(text("ALTER TABLE daily_scenarios ADD COLUMN domain VARCHAR(100);"))
            print("Added column 'domain'.")
        except Exception as e:
            print(f"Column 'domain' might already exist: {e}")
            
        # Add step_number column if not exists
        try:
            conn.execute(text("ALTER TABLE daily_scenarios ADD COLUMN step_number INTEGER;"))
            print("Added column 'step_number'.")
        except Exception as e:
            print(f"Column 'step_number' might already exist: {e}")

if __name__ == "__main__":
    alter_table()
