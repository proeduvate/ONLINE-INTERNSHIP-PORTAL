import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            if engine.dialect.name == "postgresql":
                print("Fixing PostgreSQL ticket priority column type...")
                try:
                    conn.execute(text("ALTER TABLE tickets ALTER COLUMN priority TYPE VARCHAR(20) USING priority::text;"))
                    conn.commit()
                    print("Successfully altered priority to VARCHAR(20).")
                except Exception as e:
                    print(f"Error altering column: {e}")
            else:
                print(f"Not using PostgreSQL (using {engine.dialect.name}), no cast needed.")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    main()
