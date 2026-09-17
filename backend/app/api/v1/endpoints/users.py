from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app import models
from app import schemas

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    users = query.all()
    return users
