import sys
sys.path.append('c:\\proeduvate\\ONLINE-INTERNSHIP-PORTAL\\backend')
from app.db.session import SessionLocal
from app.models import User, Submission, Task
import json

db = SessionLocal()
user = db.query(User).filter(User.email == 'p.sushmitha141@gmail.com').first()
if user:
    subs = db.query(Submission).filter(Submission.intern_id == user.id).all()
    print(f"Total submissions: {len(subs)}")
    for s in subs:
        t = db.query(Task).filter(Task.id == s.task_id).first()
        state = json.loads(s.ai_feedback) if s.ai_feedback else {}
        day_str = str(t.day_number) if t else 'Unknown'
        print(f"Task Day: {day_str}, status: {s.status}, day_completed: {state.get('day_completed')}")
