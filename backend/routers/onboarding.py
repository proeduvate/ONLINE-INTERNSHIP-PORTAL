from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from typing import List, Dict, Any
from services.n8n_service import trigger_n8n_webhook
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/onboarding",
    tags=["Onboarding"]
)

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_onboarding(application: schemas.OnboardingApplicationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == application.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Find domain
    domain = db.query(models.Domain).filter(models.Domain.name.ilike(application.domain)).first()
    domain_id = domain.id if domain else None

    # We reuse User model to represent the application without full auth setup yet
    new_user = models.User(
        name=application.name,
        email=application.email,
        role=models.UserRole.INTERN,
        college=application.college,
        domain_id=domain_id,
        onboarding_status="PENDING_REVIEW"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Save the resume somewhere if needed (not in User currently, but could be added or logged)
    
    # Trigger webhook
    payload = {
        "event": "APPLICATION_SUBMITTED",
        "timestamp": datetime.utcnow().isoformat(),
        "application_id": f"APP-{new_user.id:04d}",
        "intern": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        },
        "internship": {
            "domain": application.domain
        },
        "status": "PENDING_REVIEW"
    }
    background_tasks.add_task(trigger_n8n_webhook, "APPLICATION_SUBMITTED", payload)
    
    return {"message": "Application submitted successfully", "application_id": f"APP-{new_user.id:04d}"}

@router.get("/status")
def get_application_status(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"status": user.onboarding_status}

@router.get("/status/{application_id}")
def get_application_status_by_id(application_id: str, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return {"status": user.onboarding_status}

@router.post("/{application_id}/interview")
def interview_decision(application_id: str, decision: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Extract user ID from application_id (e.g. APP-0001)
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    is_required = decision.get("required", False)
    user.onboarding_status = "INTERVIEW_PENDING" if is_required else "PAYMENT_PENDING"
    db.commit()
    
    event = "INTERVIEW_REQUIRED" if is_required else "INTERVIEW_NOT_REQUIRED"
    payload = {
        "event": event,
        "application_id": application_id,
        "intern": {"id": user.id, "name": user.name, "email": user.email}
    }
    background_tasks.add_task(trigger_n8n_webhook, event, payload)
    
    return {"message": "Interview decision recorded", "status": user.onboarding_status}

@router.post("/{application_id}/interview/result")
def interview_result(application_id: str, result: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    passed = result.get("passed", False)
    user.onboarding_status = "PAYMENT_PENDING" if passed else "REJECTED"
    db.commit()
    
    event = "INTERVIEW_PASSED" if passed else "INTERVIEW_FAILED"
    payload = {
        "event": event,
        "application_id": application_id,
        "intern": {"id": user.id, "name": user.name, "email": user.email}
    }
    background_tasks.add_task(trigger_n8n_webhook, event, payload)
    
    return {"message": "Interview result recorded", "status": user.onboarding_status}

@router.post("/webhook/payment")
async def webhook_payment(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # This is the inbound webhook from n8n (triggered by Google Forms/Sheets)
    data = await request.json()
    application_id = data.get("application_id")
    if not application_id:
        return {"message": "Missing application_id"}
        
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        return {"message": "Invalid application_id"}
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.onboarding_status = "PAYMENT_SUBMITTED"
        db.commit()
        
        # Trigger an internal event back to n8n if needed, though n8n already knows.
        payload = {
            "event": "PAYMENT_SUBMITTED",
            "application_id": application_id,
            "intern": {"id": user.id, "name": user.name, "email": user.email}
        }
        background_tasks.add_task(trigger_n8n_webhook, "PAYMENT_SUBMITTED", payload)
        
    return {"status": "success"}

@router.post("/{application_id}/payment/verify")
def payment_verify(application_id: str, decision: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verified = decision.get("verified", False)
    user.onboarding_status = "MENTOR_ASSIGNMENT_PENDING" if verified else "PAYMENT_REJECTED"
    db.commit()
    
    event = "PAYMENT_VERIFIED" if verified else "PAYMENT_REJECTED"
    payload = {
        "event": event,
        "application_id": application_id,
        "intern": {"id": user.id, "name": user.name, "email": user.email}
    }
    background_tasks.add_task(trigger_n8n_webhook, event, payload)
    
    return {"message": "Payment verified", "status": user.onboarding_status}

@router.get("/pending-reminders")
def pending_reminders(db: Session = Depends(get_db)):
    # Return users who are pending payment, interview, documents, etc.
    pending_statuses = [
        "PAYMENT_PENDING", 
        "INTERVIEW_PENDING", 
        "DOCUMENT_PENDING", 
        "ACCOUNT_ACTIVATION_PENDING"
    ]
    users = db.query(models.User).filter(models.User.onboarding_status.in_(pending_statuses)).all()
    
    results = []
    for u in users:
        results.append({
            "application_id": f"APP-{u.id:04d}",
            "name": u.name,
            "email": u.email,
            "status": u.onboarding_status
        })
    return {"reminders": results}

@router.get("/domains")
def get_domains(db: Session = Depends(get_db)):
    domains = db.query(models.Domain).all()
    return domains
