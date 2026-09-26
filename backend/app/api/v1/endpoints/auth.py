"""
Authentication Router - Supabase Auth & public.users Integration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app import models, schemas
from app.db import session as database
from app.core.security import hash_password, verify_password, create_access_token
from app.core.supabase_client import get_supabase_client, get_supabase_admin

router = APIRouter(prefix="", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Register a new user (Admin, Mentor, Intern) into Supabase Auth & sync 1:1 with public.users
    """
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email is already registered"
        )
    
    hashed_pwd = hash_password(user_data.password)

    # 1. Register with Supabase Auth
    supabase = get_supabase_client()
    supabase_auth_id = None
    if supabase is not None:
        try:
            res = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "name": user_data.name,
                        "role": user_data.role.value
                    }
                }
            })
            if res and res.user:
                supabase_auth_id = res.user.id
        except Exception as e:
            print(f"Note: Supabase Auth sign_up fallback: {e}")

    # 2. Insert into public.users table
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pwd,
        github_repo_url=user_data.github_repo_url,
        role=models.UserRole(user_data.role.value)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "User registered successfully", 
        "user_id": new_user.id,
        "supabase_auth_id": supabase_auth_id
    }


@router.post("/login")
def login_user(user_credentials: schemas.UserLoginSchema, db: Session = Depends(database.get_db)):
    """
    Login user via Supabase Auth or database credentials fallback and return JWT session token
    """
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    supabase_access_token = None
    supabase = get_supabase_client()
    
    if supabase is not None:
        try:
            auth_res = supabase.auth.sign_in_with_password({
                "email": user_credentials.email,
                "password": user_credentials.password
            })
            if auth_res and auth_res.session:
                supabase_access_token = auth_res.session.access_token
        except Exception as e:
            print(f"Supabase Auth sign-in note/fallback: {e}")

    # Verify against database if Supabase token not issued or fallback required
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )
    
    if not supabase_access_token:
        if not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Invalid Credentials"
            )
        access_token = create_access_token(user.id, user.role.value)
    else:
        access_token = supabase_access_token

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role.value,
        "name": user.name,
        "email": user.email,
        "user_id": user.id
    }
