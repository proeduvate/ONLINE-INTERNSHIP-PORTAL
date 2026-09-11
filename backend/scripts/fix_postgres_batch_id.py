import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            # Check if using PostgreSQL
            if engine.dialect.name == "postgresql":
                print("Fixing PostgreSQL batch_id column type...")
                try:
                    # Cast column to integer safely
                    conn.execute(text("ALTER TABLE users ALTER COLUMN batch_id TYPE INTEGER USING (NULLIF(batch_id, '')::integer);"))
                    conn.commit()
                    print("Successfully altered batch_id to INTEGER.")
                except Exception as e:
                    print(f"Error altering column: {e}")
            else:
                print(f"Not using PostgreSQL (using {engine.dialect.name}), no cast needed.")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    main()
