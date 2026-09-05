from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request, File, UploadFile, Form
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from typing import List, Dict, Any
from services.n8n_service import trigger_n8n_webhook
from services.onboarding_service import onboarding_service
from services.email_service import email_service
from services.google_drive_service import GoogleDriveService
from datetime import datetime
import asyncio
import tempfile
import shutil
import os

drive_service = GoogleDriveService()

router = APIRouter(
    prefix="",
    tags=["Onboarding"]
)

@router.post("/apply", status_code=status.HTTP_201_CREATED)
async def apply_for_onboarding(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    college: str = Form(...),
    department: str = Form(...),
    degree: str = Form(...),
    graduation_year: int = Form(...),
    domain: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Find domain
    db_domain = db.query(models.Domain).filter(models.Domain.name.ilike(domain)).first()
    domain_id = db_domain.id if db_domain else None

    # Upload resume to Google Drive
    resume_url = None
    if resume and resume.filename:
        # Create temp file
        temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        os.close(temp_fd)
        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(resume.file, buffer)
            
            resume_url = drive_service.upload_file(
                file_path=temp_path,
                filename=f"Resume_{name.replace(' ', '_')}.pdf",
                mime_type=resume.content_type
            )
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    new_user = models.User(
        name=name,
        email=email,
        phone=phone,
        role=models.UserRole.INTERN,
        college=college,
        domain_id=domain_id,
        onboarding_status="PENDING_REVIEW",
        resume_url=resume_url
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    await email_service.send_email(
        new_user.email,
        "Application Received",
        {"message": f"Hi {new_user.name}, your application has been received and is under review. Your resume has been uploaded successfully."}
    )
    
    return {"message": "Application submitted successfully", "application_id": f"APP-{new_user.id:04d}", "resume_url": resume_url}

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
async def interview_decision(application_id: str, decision: dict, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    is_required = decision.get("required", False)
    await onboarding_service.handle_interview_decision(user, is_required, db)
    
    return {"message": "Interview decision recorded", "status": user.onboarding_status}

@router.post("/{application_id}/interview/result")
async def interview_result(application_id: str, result: dict, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    passed = result.get("passed", False)
    await onboarding_service.handle_interview_result(user, passed, db)
    
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
        
        # We keep this as it was in the original file
        payload = {
            "event": "PAYMENT_SUBMITTED",
            "application_id": application_id,
            "intern": {"id": user.id, "name": user.name, "email": user.email}
        }
        background_tasks.add_task(trigger_n8n_webhook, "PAYMENT_SUBMITTED", payload)
        
    return {"status": "success"}

@router.post("/{application_id}/payment/verify")
async def payment_verify(application_id: str, decision: dict, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    verified = decision.get("verified", False)
    await onboarding_service.handle_payment_verify(user, verified, db)
    
    return {"message": "Payment verified", "status": user.onboarding_status}

@router.post("/{application_id}/assign-mentor")
async def assign_mentor(application_id: str, request: schemas.MentorAssignRequest, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    try:
        await onboarding_service.assign_mentor(user, request.mentor_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Mentor assigned successfully", "status": user.onboarding_status}

@router.post("/{application_id}/generate-documents")
async def generate_documents(application_id: str, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    await onboarding_service.generate_documents(user, db)
    
    return {"message": "Documents generated and sent", "status": user.onboarding_status}

@router.post("/{application_id}/create-account")
async def create_account(application_id: str, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    await onboarding_service.create_account(user, db)
    
    return {"message": "Account created, activation email sent", "status": user.onboarding_status}

@router.post("/activate-account")
async def activate_account(request: schemas.AccountActivationRequest, db: Session = Depends(get_db)):
    # In a real implementation, we would verify the token
    # For now we'll just mock it and assume token format contains the user_id or similar
    # Assuming token validation passes:
    
    # Let's say the user is found (we'd decode token here, but mocking for now)
    # user = db.query(models.User).filter...
    # user.hashed_password = pwd_context.hash(request.password)
    # user.onboarding_status = "ACTIVE"
    # db.commit()
    
    return {"message": "Account activated successfully", "status": "ACTIVE"}

@router.get("/pending-reminders")
def pending_reminders(db: Session = Depends(get_db)):
    pending_statuses = [
        "PAYMENT_PENDING", 
        "INTERVIEW_PENDING",
        "ACCOUNT_ACTIVATION_PENDING",
        "DOCUMENTS_PENDING"
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

@router.get("/applications")
def get_all_applications(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(
        models.User.onboarding_status.isnot(None),
        models.User.onboarding_status != "ACTIVE"
    ).all()
    
    results = []
    for u in users:
        stage = "Resume"
        if u.onboarding_status in ["INTERVIEW_PENDING", "INTERVIEW_PASSED", "INTERVIEW_FAILED"]:
            stage = "Interview"
        elif u.onboarding_status in ["PAYMENT_PENDING", "PAYMENT_SUBMITTED", "PAYMENT_REJECTED", "PAYMENT_VERIFIED", "MENTOR_ASSIGNMENT_PENDING"]:
            stage = "Payment"
        elif u.onboarding_status in ["DOCUMENTS_PENDING", "ACCOUNT_CREATION_PENDING", "ACCOUNT_ACTIVATION_PENDING"]:
            stage = "Onboarding"
            
        results.append({
            "id": f"APP-{u.id:04d}",
            "name": u.name,
            "domain": u.domain.name if u.domain else "Unknown",
            "stage": stage,
            "resumeLink": u.resume_url or "#", 
            "status": u.onboarding_status
        })
    return results

@router.get("/applications/{application_id}")
def get_application_details(application_id: str, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return {
        "applicationId": f"APP-{user.id:04d}",
        "name": user.name,
        "email": user.email,
        "phone": user.phone or "N/A",
        "college": user.college or "N/A",
        "domain": user.domain.name if user.domain else "Unknown",
        "resume": user.resume_url or "#",
        "status": user.onboarding_status
    }

@router.post("/applications/{application_id}/status")
def update_application_status(application_id: str, data: dict, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    new_status = data.get("status")
    if new_status:
        user.onboarding_status = new_status
        db.commit()
        
    return {"message": "Status updated successfully", "status": user.onboarding_status}
