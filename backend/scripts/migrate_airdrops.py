import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from database import engine
import models

def main():
    try:
        # 1. Create all new tables (Batch, BonusAirdrop, AirdropAttempt, AirdropResult, PointTransaction)
        print("Creating new tables...")
        models.Base.metadata.create_all(bind=engine)
        
        # 2. Alter User table to add batch_id (if not exists)
        with engine.connect() as conn:
            try:
                print("Adding batch_id to users...")
                conn.execute(text("ALTER TABLE users ADD COLUMN batch_id INTEGER REFERENCES batches(id);"))
                conn.commit()
                print("batch_id column added successfully.")
            except Exception as e:
                print(f"Note on altering users (it might already exist): {e}")

        print("Migration complete!")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
