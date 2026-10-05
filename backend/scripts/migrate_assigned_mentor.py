import os
from sqlalchemy import create_engine, text
from database import DATABASE_URL

print("Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("Executing ALTER TABLE...")
        conn.execute(text("ALTER TABLE onboarding_applications ADD COLUMN assigned_mentor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;"))
        conn.commit()
        print("Column added successfully!")
except Exception as e:
    print(f"Error (might already exist?): {e}")
