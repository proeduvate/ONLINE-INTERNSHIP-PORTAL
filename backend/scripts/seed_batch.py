import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from database import engine
from sqlalchemy.orm import Session
import models

def seed():
    with Session(engine) as db:
        # Check if batch exists
        batch = db.query(models.Batch).filter(models.Batch.name == "Batch 2026-A").first()
        if not batch:
            batch = models.Batch(name="Batch 2026-A")
            db.add(batch)
            db.commit()
            db.refresh(batch)
            print(f"Created Batch '{batch.name}' with ID: {batch.id}")
        else:
            print(f"Batch '{batch.name}' already exists with ID: {batch.id}")

        # Assign it to a few users so we can test eligible members
        users = db.query(models.User).limit(5).all()
        for u in users:
            u.batch_id = batch.id
        db.commit()
        print(f"Assigned {len(users)} users to Batch ID {batch.id}")

if __name__ == "__main__":
    seed()
