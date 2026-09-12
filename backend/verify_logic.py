import sys
import json
sys.path.append('.')
from app.db.session import SessionLocal
from app.models import User, Task, DailyScenario, Submission, MCQAttempt
from datetime import datetime
from sqlalchemy import or_

def verify():
    db = SessionLocal()
    intern = db.query(User).filter(User.email == 'p.sushmitha141@gmail.com').first()
    if not intern:
        print("Intern not found.")
        return

    current_date = datetime.utcnow()
    tasks = db.query(Task).filter(Task.domain_id == intern.domain_id).order_by(Task.day_number).all()
    all_subs = db.query(Submission).filter(Submission.intern_id == intern.id).all()
    all_mcqs = db.query(MCQAttempt).filter(MCQAttempt.intern_id == intern.id).all()
    
    sub_map = {s.task_id: s for s in all_subs}
    mcq_map = {m.day: m for m in all_mcqs}
    
    completed_day_numbers = set()
    completion_dates = {}
    
    for task_item in tasks:
        s = sub_map.get(task_item.id)
        m = mcq_map.get(task_item.day_number)
        code_done = s and s.status in ["submitted", "approved"]
        mcq_done = m and m.status == "submitted"  # Note MCQAttemptStatus.SUBMITTED is used in main, string here for testing
        if code_done and mcq_done:
            completed_day_numbers.add(task_item.day_number)
            sub_date = s.submitted_at or s.started_at or current_date
            mcq_date = m.submitted_at or m.started_at or current_date
            completion_dates[task_item.day_number] = max(sub_date, mcq_date)

    max_unlocked_day = 1
    unique_days = sorted(list(set([t.day_number for t in tasks])))
    for d in unique_days:
        if d in completed_day_numbers and completion_dates[d].date() < current_date.date():
            if d >= max_unlocked_day:
                max_unlocked_day = d + 1
        else:
            if d == max_unlocked_day:
                break
                
    print("Verification Completed.")
    print("Max Unlocked Day:", max_unlocked_day)
    print("Completed Days:", completed_day_numbers)

if __name__ == "__main__":
    verify()
