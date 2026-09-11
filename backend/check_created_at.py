from database import SessionLocal
import models

db = SessionLocal()
email = "23cse134@act.edu.in"
user = db.query(models.User).filter(models.User.email == email).first()
if user:
    print(f"User found: {user.email}")
    print(f"created_at: {user.created_at}")
    if user.created_at is None:
        from datetime import datetime
        user.created_at = datetime.utcnow()
        db.commit()
        print("Updated created_at to current time.")
else:
    print("User not found")
db.close()
