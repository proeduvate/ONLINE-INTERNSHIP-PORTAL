import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            # Drop category column
            conn.execute(text("ALTER TABLE tickets DROP COLUMN category;"))
            conn.commit()
            print("Successfully dropped category column from tickets table.")
    except Exception as e:
        print(f"Error dropping category column: {e}")

if __name__ == "__main__":
    main()
