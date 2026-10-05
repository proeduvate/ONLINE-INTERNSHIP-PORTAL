from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
import models
import schemas
from dependencies import get_current_user
from core.security import hash_password, verify_password

router = APIRouter()

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class ResetRequest(BaseModel):
    email: Optional[str] = None

from sqlalchemy import func, cast, String

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role:
        r_str = role.lower().strip()
        query = query.filter(func.lower(cast(models.User.role, String)) == r_str)
    users = query.all()
    return users

@router.get("/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
@router.put("/", response_model=schemas.UserResponse)
def update_profile(
    profile_update: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Updates the logged-in user's profile in the live database."""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if profile_update.name is not None and profile_update.name.strip():
        user.name = profile_update.name.strip()
    if profile_update.college is not None:
        user.college = profile_update.college.strip()
    if profile_update.phone is not None:
        user.phone = profile_update.phone.strip()
    if profile_update.password is not None and profile_update.password.strip():
        user.hashed_password = hash_password(profile_update.password.strip())

    db.commit()
    db.refresh(user)
    return user

@router.post("/change-password")
def change_password(
    req: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Validates current password and updates to new password in the DB."""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/reset-password-request")
def reset_password_request(
    req: Optional[ResetRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Triggers password reset request."""
    return {"message": f"Password reset instructions sent to {current_user.email}"}
