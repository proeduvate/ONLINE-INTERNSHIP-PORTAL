import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from database import engine

def main():
    try:
        with engine.connect() as conn:
            # Check if sqlite or postgresql to handle syntax, but VARCHAR(20) DEFAULT 'Medium' works in both
            conn.execute(text("ALTER TABLE tickets ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium';"))
            conn.commit()
            print("Successfully added priority column to tickets table.")
    except Exception as e:
        print(f"Error adding column: {e}")
        # Note: If column already exists, this might fail, but that's fine.

if __name__ == "__main__":
    main()
