import os
import sys
from datetime import datetime

# Add backend directory to sys.path so we can import app modules
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import SessionLocal
from app import models

db = SessionLocal()

user = db.query(models.User).filter(models.User.email == "p.sushmitha141@gmail.com").first()
if user:
    print(f"Before update: User {user.email} start_date={user.start_date}")
    if user.start_date is None:
        user.start_date = datetime(2026, 9, 11, 10, 0, 0)
        db.commit()
        print(f"After update: User {user.email} start_date={user.start_date}")
    
    print("\n--- ALL TASKS FOR DOMAIN ---")
    tasks = db.query(models.Task).filter(models.Task.domain_id == user.domain_id).order_by(models.Task.day_number).all()
    for t in tasks:
        print(f"ID: {t.id}, Day: {t.day_number}, Title: {t.title}")
else:
    print("User not found.")

db.close()
