import os
import sys

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

import database
import models
from sqlalchemy import text

def migrate():
    engine = database.engine
    with engine.connect() as conn:
        try:
            # 1. Add 'assigned' to enum if not exists
            # We can't do IF NOT EXISTS for enum values easily in older PG, but in PG >= 9.1:
            conn.execute(text("ALTER TYPE ticketstatus ADD VALUE IF NOT EXISTS 'assigned';"))
            conn.commit()
            print("Enum updated.")
        except Exception as e:
            conn.rollback()
            print(f"Enum update error (might already exist or not PG): {e}")

        try:
            # 2. Add columns to tickets
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS domain VARCHAR(100) DEFAULT 'General';"))
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id);"))
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;"))
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution TEXT;"))
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_by INTEGER REFERENCES users(id);"))
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;"))
            conn.execute(text("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closure_reason TEXT;"))
            conn.commit()
            print("Columns added to tickets.")
        except Exception as e:
            conn.rollback()
            print(f"Error adding columns: {e}")
            
    # 3. Create ticket_history table
    models.Base.metadata.create_all(bind=engine)
    print("Missing tables created.")

if __name__ == "__main__":
    migrate()
