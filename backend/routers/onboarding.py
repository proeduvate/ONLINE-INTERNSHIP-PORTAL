from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from typing import List

router = APIRouter(
    prefix="/api/v1/onboarding",
    tags=["Onboarding"]
)

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_onboarding(application: dict, db: Session = Depends(get_db)):
    # Mock implementation
    return {"message": "Application submitted successfully", "application_id": "APP-99999"}

@router.get("/status")
def get_application_status(db: Session = Depends(get_db)):
    # Mock status
    return {"status": "PENDING_REVIEW"}

@router.get("/domains")
def get_domains(db: Session = Depends(get_db)):
    domains = db.query(models.Domain).all()
    return domains
