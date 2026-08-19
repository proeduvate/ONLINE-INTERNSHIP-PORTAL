import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from database import engine

def main():
    try:
        with engine.connect() as conn:
            if engine.dialect.name == "postgresql":
                print("Fixing PostgreSQL ticket_history status columns...")
                try:
                    conn.execute(text("ALTER TABLE ticket_history ALTER COLUMN old_status TYPE VARCHAR USING old_status::text;"))
                    conn.execute(text("ALTER TABLE ticket_history ALTER COLUMN new_status TYPE VARCHAR USING new_status::text;"))
                    conn.commit()
                    print("Successfully altered old_status and new_status to VARCHAR.")
                except Exception as e:
                    print(f"Error altering column: {e}")
            else:
                print(f"Not using PostgreSQL (using {engine.dialect.name}), no cast needed.")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    main()
