"""
Authentication Router - Handles user registration and login
Separated from core business logic
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app import models
from app import schemas
from app.db import session as database
from app.core.security import hash_password, create_access_token

router = APIRouter(prefix="", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Register a new user (public endpoint)
    """
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email is already registered"
        )
    
    hashed_password = hash_password(user_data.password)
    
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=models.UserRole(user_data.role.value)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully", "user_id": new_user.id}


@router.post("/login")
def login_user(user_credentials: schemas.UserLoginSchema, db: Session = Depends(database.get_db)):
    """
    Login user and return JWT access token
    """
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )
    
    # Verify password using security function
    from app.core.security import verify_password
    if not verify_password(user_credentials.password, user.hashed_password):
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
