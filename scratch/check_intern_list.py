import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import SessionLocal
import models

db = SessionLocal()
interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
print(f"Total Interns in DB: {len(interns)}")
for i in interns:
    subs_count = db.query(models.Submission).filter(models.Submission.intern_id == i.id).count()
    print(f"ID: {i.id}, intern_id: '{i.intern_id}', Name: '{i.name}', Email: '{i.email}', Domain: '{i.domain_name}', Progress: {i.progress_pct}%, Submissions: {subs_count}")
db.close()
