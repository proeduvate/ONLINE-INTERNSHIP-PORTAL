"""
Authentication Router - Handles user registration and login
Separated from core business logic
"""
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import models
import schemas
import database
from core.security import hash_password, create_access_token

router = APIRouter(prefix="", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Register a new user (public endpoint)
    """
    clean_email = user_data.email.strip().lower() if user_data.email else ""
    if not clean_email:
        raise HTTPException(status_code=400, detail="Valid email address is required")
        
    existing_user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email is already registered"
        )
    
    hashed_password = hash_password(user_data.password)
    
    new_user = models.User(
        name=user_data.name.strip(),
        email=clean_email,
        hashed_password=hashed_password,
        role=models.UserRole(user_data.role.value)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Dispatch registration notification email
    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        dispatch_notification(
            recipient_email=new_user.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Welcome to ProEduvate - Account Created Successfully",
            message=f"Hello {new_user.name}! Your account has been registered successfully on ProEduvate Portal. Your login email is: {new_user.email}.",
            action_url=f"{FRONTEND_URL}/login",
            sender_name="ProEduvate System"
        )
    except Exception as e:
        print(f"[Email Exception] Failed to send registration email: {e}")
    
    return {"message": "User registered successfully", "user_id": new_user.id}


from sqlalchemy import func

@router.post("/login")
def login_user(user_credentials: schemas.UserLoginSchema, db: Session = Depends(database.get_db)):
    """
    Login user and return JWT access token
    """
    clean_email = user_credentials.email.strip().lower() if user_credentials.email else ""
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )
    
    # Verify password using security function
    from core.security import verify_password
    is_valid = False
    try:
        is_valid = verify_password(user_credentials.password, user.hashed_password)
    except Exception:
        is_valid = (user.hashed_password == user_credentials.password)

    if not is_valid and user.hashed_password == user_credentials.password:
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )
    
    access_token = create_access_token(user.id, user.role.value)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role.value,
        "name": user.name,
        "email": user.email
    }
