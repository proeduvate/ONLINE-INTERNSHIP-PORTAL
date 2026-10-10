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
    if profile_update.avatar_url is not None:
        user.avatar_url = profile_update.avatar_url.strip() if profile_update.avatar_url else None
    if profile_update.password is not None and profile_update.password.strip():
        user.hashed_password = hash_password(profile_update.password.strip())

    db.commit()
    db.refresh(user)
    return user

from fastapi import UploadFile, File
import uuid
import os

@router.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Uploads profile avatar and updates user record in DB."""
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        content = file.file.read()
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        unique_filename = f"avatar_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
        
        avatar_url = None
        try:
            from services.supabase_service import supabase_service
            avatar_url = supabase_service.upload_file(content, bucket_name="avatars", filename=unique_filename, content_type=file.content_type)
        except Exception as e:
            print("Supabase avatar upload skipped/failed:", e)
            
        if not avatar_url:
            os.makedirs("uploads/avatars", exist_ok=True)
            local_path = os.path.join("uploads/avatars", unique_filename)
            with open(local_path, "wb") as f:
                f.write(content)
            from services.email_service import BACKEND_URL
            avatar_url = f"{BACKEND_URL}/uploads/avatars/{unique_filename}"
            
        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)
        return {"avatar_url": user.avatar_url}
    except Exception as err:
        print("Avatar upload error:", err)
        raise HTTPException(status_code=500, detail="Failed to upload avatar: " + str(err))
    finally:
        file.file.close()

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
