from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from services.document_service import document_service
import models
import schemas
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(
    tags=["Onboarding"]
)

@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_onboarding(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    college: str = Form(...),
    department: str = Form(...),
    degree: str = Form(...),
    graduation_year: int = Form(...),
    domain: str = Form(...),
    resume: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Create the new application object
    new_app = models.OnboardingApplication(
        name=name,
        email=email,
        phone=phone,
        college=college,
        department=department,
        degree=degree,
        graduation_year=graduation_year,
        domain=domain,
        resume_url=resume.filename if resume else None,
        status=models.ApplicationStatus.PENDING_REVIEW
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    return {"message": "Application submitted successfully", "application_id": f"APP-{new_app.id}"}

@router.get("/status/{application_id}")
def get_application_status(application_id: str, db: Session = Depends(get_db)):
    if not application_id.startswith("APP-"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid application ID format")
    
    try:
        app_id = int(application_id.replace("APP-", ""))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid application ID format")
        
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    return {"status": db_app.status.value}

@router.get("/applications")
def get_all_applications(db: Session = Depends(get_db)):
    apps = db.query(models.OnboardingApplication).all()
    # Format for the frontend table
    result = []
    for app in apps:
        result.append({
            "applicationId": f"APP-{app.id}",
            "name": app.name,
            "domain": app.domain,
            "status": app.status.value
        })
    return result

@router.get("/domains")
def get_domains(db: Session = Depends(get_db)):
    domains = db.query(models.Domain).all()
    return domains
from pydantic import BaseModel

class StatusUpdate(BaseModel):
    status: str

@router.get("/applications/{application_id}")
def get_application_details(application_id: str, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    return {
        "applicationId": f"APP-{db_app.id}",
        "name": db_app.name,
        "email": db_app.email,
        "phone": db_app.phone,
        "college": db_app.college,
        "department": db_app.department,
        "domain": db_app.domain,
        "status": db_app.status.value,
        "resume": db_app.resume_url,
        "offer_letter_url": getattr(db_app, 'offer_letter_url', None),
        "tc_url": getattr(db_app, 'tc_url', None),
        "signed_offer_letter_url": getattr(db_app, 'signed_offer_letter_url', None),
        "signed_tc_url": getattr(db_app, 'signed_tc_url', None)
    }

@router.post("/applications/{application_id}/status")
def update_application_status(application_id: str, update: StatusUpdate, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    db_app.status = update.status
    db.commit()
    return {"message": "Status updated"}

class InterviewReq(BaseModel):
    required: bool
    meet_link: Optional[str] = None
    scheduled_time: Optional[str] = None
    payment_form_link: Optional[str] = None

@router.post("/{application_id}/interview")
def schedule_interview(application_id: str, req: InterviewReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.required:
        db_app.status = models.ApplicationStatus.INTERVIEW_SCHEDULED
    else:
        db_app.status = models.ApplicationStatus.PAYMENT_PENDING
        
    db.commit()
    return {"message": "Interview decision recorded"}

class InterviewRes(BaseModel):
    passed: bool
    payment_form_link: Optional[str] = None

@router.post("/{application_id}/interview/result")
def interview_result(application_id: str, res: InterviewRes, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if res.passed:
        db_app.status = models.ApplicationStatus.INTERVIEW_PASSED
    else:
        db_app.status = models.ApplicationStatus.INTERVIEW_FAILED
        
    db.commit()
    return {"message": "Interview result recorded"}

class PaymentVerifyReq(BaseModel):
    verified: bool

@router.post("/{application_id}/payment/verify")
def verify_payment(application_id: str, req: PaymentVerifyReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.verified:
        db_app.status = models.ApplicationStatus.DOCUMENTS_PENDING
    else:
        db_app.status = models.ApplicationStatus.PAYMENT_REJECTED
        
    db.commit()
    return {"message": "Payment verification recorded"}

@router.post("/{application_id}/generate-documents")
def generate_documents(application_id: str, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.status = models.ApplicationStatus.ACCOUNT_CREATION_PENDING
    
    # Generate REAL documents using DocumentService
    urls = document_service.process_document_generation(db_app)
    
    db_app.offer_letter_url = urls.get('offer_letter_url')
    db_app.tc_url = urls.get('terms_url')
    db.commit()
    
    return {"urls": urls}

class AssignMentorReq(BaseModel):
    mentor_id: int

@router.post("/{application_id}/assign-mentor")
def assign_mentor(application_id: str, req: AssignMentorReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.assigned_mentor_id = req.mentor_id
    db.commit()
    return {"message": "Mentor assigned"}

@router.post("/{application_id}/create-account")
def create_account(application_id: str, db: Session = Depends(get_db)):
    from app.core.security import pwd_context
    from datetime import datetime

    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Generate account if not exists
    if not db_app.user_id:
        existing_user = db.query(models.User).filter(models.User.email == db_app.email).first()
        if existing_user:
            db_app.user_id = existing_user.id
            db_app.status = models.ApplicationStatus.ACTIVE
            db.commit()
            return {"message": "Linked to existing account", "password": "User already has a password"}
        
        # Determine Domain ID
        domain_obj = db.query(models.Domain).filter(models.Domain.name == db_app.domain).first()
        domain_id = domain_obj.id if domain_obj else None
        
        # Determine Intern ID
        count = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).count()
        intern_id = f"INT-{datetime.now().year}-{count + 101:04d}"
        
        # Default password
        default_pwd = "ProEduvate@123"
        hashed_password = pwd_context.hash(default_pwd)
        
        new_user = models.User(
            name=db_app.name,
            email=db_app.email,
            hashed_password=hashed_password,
            role=models.UserRole.INTERN,
            college=db_app.college,
            domain_id=domain_id,
            mentor_id=db_app.assigned_mentor_id,
            start_date=datetime.now(),
            intern_id=intern_id,
            attendance_pct=100,
            progress_pct=0
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Update app link
        db_app.user_id = new_user.id
        db_app.status = models.ApplicationStatus.ACTIVE
        db.commit()
        
        return {"message": "Account created successfully", "password": default_pwd}
        
    db_app.status = models.ApplicationStatus.ACTIVE
    db.commit()
    return {"message": "Account activated", "password": "User already has a password"}
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
