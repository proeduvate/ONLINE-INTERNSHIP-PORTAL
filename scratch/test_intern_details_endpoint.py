import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import SessionLocal
from routers.mentor import get_intern_details
import models

db = SessionLocal()
# Create dummy mentor user
mentor = db.query(models.User).filter(models.User.role == models.UserRole.MENTOR).first()
if not mentor:
    mentor = db.query(models.User).first()

print("Testing get_intern_details for 'INT-2026-0103':")
res1 = get_intern_details("INT-2026-0103", db=db, current_user=mentor)
print("Intern Info:", res1["intern"])
print("Total Submissions returned:", len(res1["submissions"]))
submitted1 = [s for s in res1["submissions"] if s["isSubmitted"]]
print("Submitted count:", len(submitted1))

print("\nTesting get_intern_details for '23':")
res2 = get_intern_details("23", db=db, current_user=mentor)
print("Intern Info:", res2["intern"])
print("Total Submissions returned:", len(res2["submissions"]))
submitted2 = [s for s in res2["submissions"] if s["isSubmitted"]]
print("Submitted count:", len(submitted2))

db.close()
