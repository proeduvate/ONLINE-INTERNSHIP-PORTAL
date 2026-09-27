from app.db import session as database
from app import models
from app.core.security import pwd_context
from seed import register_supabase_user

def add_admin():
    db = next(database.get_db())
    email = "admin1@gmail.com"
    password = "admin123"
    
    # Register in Supabase
    register_supabase_user(email, password)
    
    # Check if exists in local DB
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        print("Admin already exists in Postgres DB.")
        existing.hashed_password = pwd_context.hash(password)
        db.commit()
    else:
        admin = models.User(
            name="System Admin",
            email=email,
            hashed_password=pwd_context.hash(password),
            role=models.UserRole.ADMIN,
            attendance_pct=100
        )
        db.add(admin)
        db.commit()
        print("Admin successfully added to Postgres DB.")

if __name__ == "__main__":
    add_admin()
