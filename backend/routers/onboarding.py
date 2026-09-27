from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
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
    from services.supabase_service import supabase_service
    import uuid

    resume_url = None
    if resume:
        try:
            content = resume.file.read()
            # Generate a unique filename to avoid overwrites
            ext = resume.filename.split('.')[-1] if '.' in resume.filename else 'pdf'
            unique_filename = f"{uuid.uuid4().hex}_{name.replace(' ', '_')}.{ext}"
            uploaded_url = supabase_service.upload_file(content, bucket_name="resumes", filename=unique_filename, content_type=resume.content_type)
            if uploaded_url:
                resume_url = uploaded_url
            else:
                resume_url = resume.filename  # Fallback
        finally:
            resume.file.close()

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
        resume_url=resume_url,
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
    try:
        app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID format")
        
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
def schedule_interview(
    application_id: str, 
    req: InterviewReq, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.required:
        db_app.status = models.ApplicationStatus.INTERVIEW_SCHEDULED
        
        if not req.scheduled_time:
            raise HTTPException(status_code=400, detail="Scheduled time is required for interview")
            
        # Generate daily link based on date portion of scheduled time (e.g. YYYY-MM-DD)
        date_part = req.scheduled_time.split("T")[0]
        generated_meet_link = f"http://localhost:3000/meeting/interview-{date_part}"
        
        from services.email_service import dispatch_notification, EventType
        
        # 1. Email the Intern
        dispatch_notification(
            recipient_email=db_app.email,
            event_type=EventType.MEETING_SCHEDULED,
            title="Interview Scheduled",
            message=f"Hi {db_app.name}, your interview is scheduled at {req.scheduled_time}. Join using the link.",
            action_url=generated_meet_link,
            sender_name="ProEduvate Onboarding"
        )
        
        # 2. Email the logged-in Admin
        dispatch_notification(
            recipient_email=current_user.email,
            event_type=EventType.MEETING_SCHEDULED,
            title="Interview Scheduled (Admin Copy)",
            message=f"You scheduled an interview for {db_app.name} at {req.scheduled_time}. Link: {generated_meet_link}",
            action_url=generated_meet_link,
            sender_name="ProEduvate System"
        )
        
        # 3. Email the main ProEduvate account
        dispatch_notification(
            recipient_email="proeduvate@gmail.com",
            event_type=EventType.MEETING_SCHEDULED,
            title="Interview Scheduled (System Copy)",
            message=f"An interview for {db_app.name} was scheduled by {current_user.name} at {req.scheduled_time}. Link: {generated_meet_link}",
            action_url=generated_meet_link,
            sender_name="ProEduvate System"
        )
    else:
        db_app.status = models.ApplicationStatus.PAYMENT_PENDING
        
    db.commit()
    return {"message": "Interview decision recorded and emails sent."}

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
    from main import pwd_context
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
        
        from services.email_service import dispatch_notification, EventType
        login_url = "http://localhost:3000/login"
        dispatch_notification(
            recipient_email=new_user.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Account Activated",
            message=f"Your account has been activated. Your default password is: {default_pwd}. Please login and change your password.",
            action_url=login_url,
            sender_name="ProEduvate System"
        )
        
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
        # Generate the signed offer letter and upload it
        signed_url = document_service.process_signed_document_generation(db_app, "offer_letter", req.signature_base64)
        db_app.signed_offer_letter_url = signed_url
    elif req.document_type == "tc":
        # Generate the signed T&C and upload it
        signed_url = document_service.process_signed_document_generation(db_app, "tc", req.signature_base64)
        db_app.signed_tc_url = signed_url
        
    # If both are signed, update status
    if db_app.signed_offer_letter_url and db_app.signed_tc_url:
        db_app.status = models.ApplicationStatus.DOCUMENTS_UPLOADED
        
    db.commit()
    return {"message": "Document signed successfully", "url": signed_url}
