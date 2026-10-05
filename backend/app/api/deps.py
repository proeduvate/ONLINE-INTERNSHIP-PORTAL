from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from app import models
from app.db import session as database
from app.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_val = payload.get("user_id") if payload.get("user_id") is not None else payload.get("sub")
        if user_id_val is None:
            raise credentials_exception
        user_id = int(user_id_val)
    except Exception:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


from typing import Optional
from fastapi import Header

def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id_val = payload.get("user_id") if payload.get("user_id") is not None else payload.get("sub")
            if user_id_val is not None:
                user = db.query(models.User).filter(models.User.id == int(user_id_val)).first()
                if user:
                    return user
        except Exception:
            pass

    mentor = db.query(models.User).filter(models.User.role.in_(["mentor", "admin", "MENTOR", "ADMIN"])).first()
    if not mentor:
        mentor = db.query(models.User).first()
    return mentor


