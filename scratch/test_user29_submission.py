import os
import sys

backend_dir = r"h:\Interns\ProEduvate\Online Internship Portal\ONLINE-INTERNSHIP-PORTAL\backend"
sys.path.insert(0, backend_dir)

from database import SessionLocal
import models

db = SessionLocal()

user_29 = db.query(models.User).filter(models.User.id == 29).first()
print(f"BEFORE: User 29 ({user_29.name}) Progress: {user_29.progress_pct}%")

# Find Day 1 task for AIML (Domain 4)
task_day1 = db.query(models.Task).filter(models.Task.domain_id == 4, models.Task.day_number == 1).first()

# Create or update submission for User 29
sub = db.query(models.Submission).filter(
    models.Submission.intern_id == user_29.id,
    models.Submission.task_id == task_day1.id
).first()

if not sub:
    sub = models.Submission(
        intern_id=user_29.id,
        task_id=task_day1.id,
        status="submitted",
        code_submission="print('Hello AIML Day 1')",
        mcq_score=100,
        ai_score=90,
        ai_feedback="Great work!",
        attendance_marked=True
    )
    db.add(sub)
else:
    sub.status = "submitted"
    sub.mcq_score = 100
    sub.ai_score = 90

db.commit()

# Recalculate progress as backend tasks.py does:
total_domain_tasks = db.query(models.Task).filter(models.Task.domain_id == user_29.domain_id).count() or 30
user_subs = db.query(models.Submission).filter(
    models.Submission.intern_id == user_29.id,
    models.Submission.status.in_(["submitted", "approved"])
).count()

user_29.progress_pct = min(100, int((user_subs / total_domain_tasks) * 100))
db.commit()
db.refresh(user_29)

print(f"AFTER: User 29 ({user_29.name}) Progress: {user_29.progress_pct}% | Submissions Count: {user_subs}")
db.close()
