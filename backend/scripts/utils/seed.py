from sqlalchemy.orm import Session
import json
from datetime import datetime, timedelta

try:
    from app.db import session as database
    from app import models
    from app.core.security import pwd_context
except ImportError:
    import sys
    sys.path.append('../../')
    from app.db import session as database
    from app import models
    from app.core.security import pwd_context

def seed():
    print("Seeding database...")
    db = next(database.get_db())
    
    # Check if already seeded
    if db.query(models.User).first():
        print("Database already seeded with users.")
        return

    # Clear existing domains to avoid unique constraints if any exist without users
    db.query(models.Domain).delete()
    db.commit()

    # Create Domains
    dom_react = models.Domain(name="Frontend", description="Learn components, state, context, and React Router.")
    dom_fastapi = models.Domain(name="Backend", description="Build asynchronous RESTful APIs, schemas, and database connectivity.")
    db.add(dom_react)
    db.add(dom_fastapi)
    db.commit()
    db.refresh(dom_react)
    db.refresh(dom_fastapi)
    
    # Create Admin
    admin = models.User(
        name="System Admin",
        email="admin@gmail.com",
        hashed_password=pwd_context.hash("admin123"),
        role=models.UserRole.ADMIN,
        attendance_pct=100
    )
    db.add(admin)
    
    # Create Mentor
    mentor = models.User(
        name="Sarah Connor (Senior Lead)",
        email="mentor@gmail.com",
        hashed_password=pwd_context.hash("mentor123"),
        role=models.UserRole.MENTOR,
        attendance_pct=100
    )
    db.add(mentor)
    
    # Create Intern
    intern = models.User(
        name="John Doe",
        email="intern@example.com",
        hashed_password=pwd_context.hash("password123"),
        role=models.UserRole.INTERN,
        attendance_pct=85,
        progress_pct=60,
        learning_streak=5,
        intern_id="INT-2024-001",
        domain_id=dom_react.id,
        mentor_id=2
    )
    db.add(intern)
    
    # Create Second Intern for ProEduvate
    intern2 = models.User(
        name="Jane Smith",
        email="intern@proeduvate.com",
        hashed_password=pwd_context.hash("password123"),
        role=models.UserRole.INTERN,
        attendance_pct=90,
        progress_pct=75,
        learning_streak=10,
        intern_id="INT-2024-002",
        domain_id=dom_fastapi.id,
        mentor_id=2
    )
    db.add(intern2)

    db.commit()
    print("Seeding completed successfully.")

if __name__ == '__main__':
    seed()
