"""
Authentication dependencies (FastAPI dependency functions)
Separated from core business logic
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> models.User:
    """
    Get current authenticated user from JWT token.
    Raises HTTPException if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user


def check_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Dependency to check if user is admin"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Admin role required"
        )
    return current_user


def check_mentor(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Dependency to check if user is mentor"""
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Mentor role required"
        )
    return current_user


def check_intern(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Dependency to check if user is intern"""
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Intern role required"
        )
    return current_user
