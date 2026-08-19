import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from database import engine

def main():
    try:
        with engine.connect() as conn:
            # Safely drop column if exists
            conn.execute(text("ALTER TABLE tickets DROP COLUMN IF EXISTS priority;"))
            conn.commit()
            print("Successfully dropped priority column from tickets table.")
    except Exception as e:
        print(f"Error dropping column: {e}")

if __name__ == "__main__":
    main()
