import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from app.db.session import engine
from sqlalchemy import text

def main():
    try:
        with engine.connect() as conn:
            print("Adding correct_answer column...")
            try:
                conn.execute(text("ALTER TABLE bonus_airdrops ADD COLUMN correct_answer TEXT;"))
                conn.execute(text("UPDATE bonus_airdrops SET correct_answer = 'default';"))
                conn.execute(text("ALTER TABLE bonus_airdrops ALTER COLUMN correct_answer SET NOT NULL;"))
                conn.commit()
                print("Successfully added correct_answer column!")
            except Exception as e:
                print(f"Error altering table: {e}")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    main()
