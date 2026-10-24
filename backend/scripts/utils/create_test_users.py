import os
import sys

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

try:
    from app.db import session as database
    from app import models
    import app
    from sqlalchemy.orm import Session
except ImportError:
    print("Could not import backend modules")
    sys.exit(1)

def create_users():
    db = next(database.get_db())
    
    # Create Admin
    admin_email = "admin@gmail.com"
    admin = db.query(models.User).filter(models.User.email == admin_email).first()
    if not admin:
        admin = models.User(
            name="System Admin",
            email=admin_email,
            hashed_password=app.pwd_context.hash("admin123"),
            role=models.UserRole.ADMIN,
            attendance_pct=100
        )
        db.add(admin)
        print(f"Created {admin_email} / admin123")
    else:
        print(f"{admin_email} already exists")

    # Create Mentor
    mentor_email = "mentor@gmail.com"
    mentor = db.query(models.User).filter(models.User.email == mentor_email).first()
    if not mentor:
        mentor = models.User(
            name="Sarah Connor",
            email=mentor_email,
            hashed_password=app.pwd_context.hash("mentor123"),
            role=models.UserRole.MENTOR,
            attendance_pct=100
        )
        db.add(mentor)
        db.commit()
        db.refresh(mentor)
        print(f"Created {mentor_email} / mentor123")
    else:
        print(f"{mentor_email} already exists")
        
    # Create Intern
    intern_email = "intern@gmail.com"
    intern = db.query(models.User).filter(models.User.email == intern_email).first()
    if not intern:
        intern = models.User(
            name="John Doe",
            email=intern_email,
            hashed_password=app.pwd_context.hash("intern123"),
            role=models.UserRole.INTERN,
            intern_id="INT-2026-0101",
            mentor_id=mentor.id,
            attendance_pct=100,
            progress_pct=0
        )
        db.add(intern)
        print(f"Created {intern_email} / intern123")
    else:
        print(f"{intern_email} already exists")

    db.commit()
    print("Test users ready!")

if __name__ == "__main__":
    create_users()
