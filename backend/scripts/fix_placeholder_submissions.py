"""
Fix incorrectly submitted records:
- Find submissions where code_submission is the placeholder or empty
- Reset their status to 'in_progress' and clear attendance_marked
"""
import sys
sys.path.insert(0, r"c:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend")

from app.db.session import SessionLocal
from app import models

PLACEHOLDER_SNIPPETS = [
    "function sum(a, b)",
    "# write code",
    "// write code",
]

def is_placeholder(code) -> bool:
    if not code or not str(code).strip():
        return True
    for s in PLACEHOLDER_SNIPPETS:
        if s in str(code):
            return True
    return False

db = SessionLocal()

try:
    subs = db.query(models.Submission).filter(
        models.Submission.status == "submitted"
    ).all()

    fixed = 0
    for sub in subs:
        if is_placeholder(sub.code_submission):
            print(f"Resetting submission ID={sub.id} intern={sub.intern_id} task={sub.task_id}")
            sub.status = "in_progress"
            sub.attendance_marked = False
            sub.ai_score = 0
            fixed += 1

    db.commit()
    print(f"\nFixed {fixed} incorrect submissions.")
finally:
    db.close()
