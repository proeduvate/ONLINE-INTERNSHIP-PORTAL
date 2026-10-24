from app.db.session import SessionLocal
from models import User, UserRole

db = SessionLocal()
try:
    mentors = db.query(User).filter(User.role == UserRole.MENTOR).all()
    print(f"Number of mentors in the application: {len(mentors)}")
    for m in mentors:
        print(f" - {m.email} ({m.name})")
finally:
    db.close()
