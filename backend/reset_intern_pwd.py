import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import session as database
from app import models
from app.core.security import pwd_context

def reset_pwd():
    db = next(database.get_db())
    email = "vijiselara@gmail.com"
    password = "InternPassword123!"
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        user.hashed_password = pwd_context.hash(password)
        db.commit()
        print(f"Password for {email} reset to: {password}")
    else:
        print(f"User {email} not found in DB.")

if __name__ == "__main__":
    reset_pwd()
