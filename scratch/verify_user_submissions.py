import os
import sys

backend_dir = r"h:\Interns\ProEduvate\Online Internship Portal\ONLINE-INTERNSHIP-PORTAL\backend"
sys.path.insert(0, backend_dir)

from database import SessionLocal
import models

db = SessionLocal()

print("=== USERS IN DATABASE ===")
users = db.query(models.User).all()
for u in users:
    print(f"User ID: {u.id} | Name: {u.name} | Email: {u.email} | Role: {u.role} | DomainID: {u.domain_id} | Progress: {u.progress_pct}%")

print("\n=== SUBMISSIONS IN DATABASE ===")
subs = db.query(models.Submission).all()
print(f"Total Submissions Count: {len(subs)}")
for s in subs:
    task = db.query(models.Task).filter(models.Task.id == s.task_id).first()
    task_info = f"Day {task.day_number} ({task.title})" if task else f"Task #{s.task_id}"
    print(f"Sub ID: {s.id} | InternID: {s.intern_id} | Task: {task_info} | Status: {s.status} | MCQ: {s.mcq_score} | AI: {s.ai_score}")

db.close()
