from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models
from app import schemas
from typing import List

router = APIRouter(
    prefix="/api/v1/onboarding",
    tags=["Onboarding"]
)

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_onboarding(application: dict, db: Session = Depends(get_db)):
    # Basic real implementation for apply if it wasn't already connected
    new_app = models.OnboardingApplication(
        name=application.get("name", "Unknown"),
        email=application.get("email", ""),
        phone=application.get("phone", ""),
        college=application.get("college", ""),
        department=application.get("department", ""),
        domain=application.get("domain", ""),
        resume_url=application.get("resume_url", ""),
        github_repo_url=application.get("github_repo_url", ""),
        status="PENDING_REVIEW"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Application submitted successfully", "application_id": str(new_app.id)}

@router.get("/status")
def get_application_status(db: Session = Depends(get_db)):
    # Ideally should use current user, for now returning pending
    return {"status": "PENDING_REVIEW"}

@router.get("/domains")
def get_domains(db: Session = Depends(get_db)):
    domains = db.query(models.Domain).all()
    return domains

@router.get("/applications")
def get_applications(db: Session = Depends(get_db)):
    apps = db.query(models.OnboardingApplication).all()
    return apps

@router.get("/applications/{id}")
def get_application_by_id(id: int, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.post("/applications/{id}/status")
def update_application_status(id: int, payload: dict, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    new_status = payload.get("status")
    if new_status:
        app.status = new_status
        db.commit()
        db.refresh(app)
    return app

@router.post("/{id}/interview")
def schedule_interview(id: int, payload: dict, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "INTERVIEW_SCHEDULED"
    db.commit()
    db.refresh(app)
    return app

@router.post("/{id}/interview/result")
def submit_interview_result(id: int, payload: dict, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "INTERVIEW_PASSED" if payload.get("passed", True) else "INTERVIEW_FAILED"
    db.commit()
    db.refresh(app)
    return app

@router.post("/{id}/payment/verify")
def verify_payment(id: int, payload: dict, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "PAYMENT_VERIFIED" if payload.get("verified", True) else "PAYMENT_REJECTED"
    db.commit()
    db.refresh(app)
    return app

@router.post("/{id}/generate-documents")
def generate_documents(id: int, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "DOCUMENTS_GENERATED"
    db.commit()
    db.refresh(app)
    return app

@router.post("/{id}/assign-mentor")
def assign_mentor(id: int, payload: dict, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "MENTOR_ASSIGNED"
    db.commit()
    db.refresh(app)
    return app

@router.post("/{id}/create-account")
def create_account(id: int, db: Session = Depends(get_db)):
    app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "ACCOUNT_CREATED"
    db.commit()
    db.refresh(app)
    return app


class SignDocumentReq(BaseModel):
    document_type: str
    signature_base64: str

@router.post("/{application_id}/sign-document-inline")
def sign_document_inline(application_id: str, req: SignDocumentReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.document_type == "offer_letter":
        # Mock saving the signed document
        db_app.signed_offer_letter_url = f"https://example.com/signed_offer_{app_id}.pdf"
    elif req.document_type == "tc":
        db_app.signed_tc_url = f"https://example.com/signed_tc_{app_id}.pdf"
        
    # If both are signed, update status
    if db_app.signed_offer_letter_url and db_app.signed_tc_url:
        db_app.status = models.ApplicationStatus.DOCUMENTS_UPLOADED
        
    db.commit()
    return {"message": "Document signed successfully"}

