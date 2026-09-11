from database import SessionLocal
import models
from app.core.security import pwd_context
from services.supabase_service import supabase_service

db = SessionLocal()
try:
    email = "23cse134@act.edu.in"
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        temp_password = "TemporaryPassword123!"
        user.hashed_password = pwd_context.hash(temp_password)
        user.onboarding_status = "ACCOUNT_ACTIVATION_PENDING"
        
        # Try to register in supabase, ignore if already exists
        supabase_id = supabase_service.register_user(email, temp_password)
        if supabase_id:
            user.supabase_id = supabase_id
            
        db.commit()
        print(f"Success! Password for {email} has been set to: {temp_password}")
    else:
        print("User not found.")
finally:
    db.close()
