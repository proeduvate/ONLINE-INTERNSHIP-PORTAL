import sys
sys.path.append('.')
from app.db.session import SessionLocal
from app.models import MCQAttempt

db = SessionLocal()
attempts = db.query(MCQAttempt).filter(MCQAttempt.status == 'in_progress').all()
print(f"Found {len(attempts)} in_progress attempts.")

deleted = 0
for a in attempts:
    if a.total_questions < 10:
        print(f"Deleting Attempt {a.id} (Day {a.day}) with {a.total_questions} questions.")
        db.delete(a)
        deleted += 1

if deleted > 0:
    db.commit()
    print(f"Deleted {deleted} attempts.")
else:
    print("No attempts needed deletion.")
