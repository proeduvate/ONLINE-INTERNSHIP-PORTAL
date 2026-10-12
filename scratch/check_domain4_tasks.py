import os
import sys

backend_dir = r"h:\Interns\ProEduvate\Online Internship Portal\ONLINE-INTERNSHIP-PORTAL\backend"
sys.path.insert(0, backend_dir)

from database import SessionLocal
import models

db = SessionLocal()

user_29 = db.query(models.User).filter(models.User.id == 29).first()
print(f"User 29 Domain ID: {user_29.domain_id}")

domain_4_tasks = db.query(models.Task).filter(models.Task.domain_id == user_29.domain_id).all()
print(f"Domain {user_29.domain_id} Tasks Count: {len(domain_4_tasks)}")
for t in domain_4_tasks:
    print(f"Task ID: {t.id} | Day: {t.day_number} | Title: {t.title}")

db.close()
