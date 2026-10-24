from database import SessionLocal
import models
from app.core.security import pwd_context

db = SessionLocal()
email = "23cse134@act.edu.in"
user = db.query(models.User).filter(models.User.email == email).first()
if user:
    print(f"User found: {user.email}")
    is_valid = pwd_context.verify("TemporaryPassword123!", user.hashed_password)
    print(f"Password 'TemporaryPassword123!' is valid: {is_valid}")
    
    is_valid2 = pwd_context.verify("TemporaryPassword123", user.hashed_password)
    print(f"Password 'TemporaryPassword123' is valid: {is_valid2}")
else:
    print("User not found")
db.close()
