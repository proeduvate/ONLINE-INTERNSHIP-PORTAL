import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
from app.db.session import engine
from sqlalchemy import text

def migrate_pg():
    print("Creating new tables...")
    models.Base.metadata.create_all(bind=engine)
    
    print("Migrating tasks and submissions table...")
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS batch_id INTEGER REFERENCES batches(id);"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'medium';"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'coding';"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS instructions TEXT;"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS expected_outcome TEXT;"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
        
        conn.execute(text("ALTER TABLE submissions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;"))
        conn.commit()
        
    print("PostgreSQL Migration successful.")

if __name__ == "__main__":
    migrate_pg()
