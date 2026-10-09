from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    github_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    clean_email = email.strip().lower() if email else ""
    if not clean_email:
        raise HTTPException(status_code=400, detail="Valid email address is required")

    existing_user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="An account with this email address already exists. Please log in to your dashboard."
        )

    existing_app = db.query(models.OnboardingApplication).filter(
        func.lower(models.OnboardingApplication.email) == clean_email,
        models.OnboardingApplication.status.in_([
            models.ApplicationStatus.PENDING_REVIEW,
            models.ApplicationStatus.OFFER_ISSUED,
            models.ApplicationStatus.ACTIVE
        ])
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=400, 
            detail=f"An active application (ID: APP-{existing_app.id}) already exists for this email address."
        )

    from services.supabase_service import supabase_service
    import uuid
    import os

    resume_url = None
    if resume:
        try:
            content = resume.file.read()
            ext = resume.filename.split('.')[-1] if '.' in resume.filename else 'pdf'
            unique_filename = f"{uuid.uuid4().hex}_{name.replace(' ', '_')}.{ext}"
            uploaded_url = supabase_service.upload_file(content, bucket_name="resumes", filename=unique_filename, content_type=resume.content_type)
            if uploaded_url:
                resume_url = uploaded_url
            else:
                # Save locally to uploads/resumes directory
                os.makedirs("uploads/resumes", exist_ok=True)
                local_path = os.path.join("uploads/resumes", unique_filename)
                with open(local_path, "wb") as f:
                    f.write(content)
                from services.email_service import BACKEND_URL
                resume_url = f"{BACKEND_URL}/uploads/resumes/{unique_filename}"
        except Exception as err:
            print("Error uploading/saving resume file:", err)
            os.makedirs("uploads/resumes", exist_ok=True)
            unique_filename = f"{uuid.uuid4().hex}_{name.replace(' ', '_')}.pdf"
            local_path = os.path.join("uploads/resumes", unique_filename)
            with open(local_path, "wb") as f:
                f.write(content)
            from services.email_service import BACKEND_URL
            resume_url = f"{BACKEND_URL}/uploads/resumes/{unique_filename}"
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
        github_url=github_url,
        linkedin_url=linkedin_url,
        resume_url=resume_url,
        status=models.ApplicationStatus.PENDING_REVIEW
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # Send application submission confirmation email
    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        dispatch_notification(
            recipient_email=new_app.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Application Received - ProEduvate Internship",
            message=f"Dear {new_app.name}, thank you for applying for the {new_app.domain} Internship at ProEduvate. Your Application ID is APP-{new_app.id}. We have received your details and resume, and our team is currently reviewing your application.",
            action_url=f"{FRONTEND_URL}/onboarding/status?appId=APP-{new_app.id}",
            sender_name="ProEduvate Admissions"
        )
    except Exception as e:
        print(f"[Email Exception] Failed to send submission email: {e}")

    return {"message": "Application submitted successfully", "application_id": f"APP-{new_app.id}"}

def parse_app_id(application_id: str) -> int:
    import re
    numbers = re.findall(r'\d+', str(application_id))
    if not numbers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid application ID format")
    return int(numbers[-1])

@router.get("/status/{application_id}")
def get_application_status(application_id: str, db: Session = Depends(get_db)):
    app_id = parse_app_id(application_id)
        
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    status_val = db_app.status.value if hasattr(db_app.status, 'value') else str(db_app.status)

    message = "Your application is under review."
    if status_val in ["PAYMENT_REQUIRED", "PENDING_REVIEW"]:
        message = "Your application is under review. Please proceed to payment verification when eligible."
    elif status_val == "PAYMENT_SUBMITTED":
        message = "Payment submitted! Awaiting admin verification before documents are unlocked."
    elif status_val in ["PAYMENT_VERIFIED", "DOCUMENTS_GENERATED"]:
        message = "Payment verified. Please view and sign your offer letter and terms."
    elif status_val in ["ONBOARDING_COMPLETED", "ACCOUNT_CREATED", "ACTIVE"]:
        message = "Congratulations! Your onboarding is complete and account credentials are ready."

    return {
        "applicationId": f"APP-{db_app.id}",
        "name": db_app.name,
        "track": db_app.domain,
        "status": status_val,
        "message": message
    }

@router.get("/applications")
def get_all_applications(db: Session = Depends(get_db)):
    try:
        apps = db.query(models.OnboardingApplication).all()
        result = []
        for app in apps:
            try:
                status_str = app.status.value if hasattr(app.status, 'value') else str(app.status) if app.status else "PENDING_REVIEW"
            except Exception:
                status_str = "PENDING_REVIEW"
            result.append({
                "applicationId": f"APP-{app.id}",
                "name": app.name,
                "domain": app.domain,
                "status": status_str
            })
        return result
    except Exception as err:
        print(f"[Onboarding Router Error] get_all_applications error: {err}")
        return []

@router.get("/domains")
def get_domains(db: Session = Depends(get_db)):
    domains = db.query(models.Domain).all()
    return domains

class StatusUpdate(BaseModel):
    status: str

@router.get("/applications/{application_id}")
def get_application_details(application_id: str, db: Session = Depends(get_db)):
    try:
        app_id = parse_app_id(application_id)
            
        db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
        if not db_app:
            raise HTTPException(status_code=404, detail="Application not found")
        mentor_name = None
        if getattr(db_app, 'assigned_mentor_id', None):
            mentor_user = db.query(models.User).filter(models.User.id == db_app.assigned_mentor_id).first()
            if mentor_user:
                mentor_name = mentor_user.name

        try:
            status_str = db_app.status.value if hasattr(db_app.status, 'value') else str(db_app.status) if db_app.status else "PENDING_REVIEW"
        except Exception:
            status_str = "PENDING_REVIEW"

        return {
            "applicationId": f"APP-{db_app.id}",
            "name": db_app.name,
            "email": db_app.email,
            "phone": db_app.phone,
            "college": db_app.college,
            "department": db_app.department,
            "domain": db_app.domain,
            "github_url": getattr(db_app, 'github_url', None),
            "linkedin_url": getattr(db_app, 'linkedin_url', None),
            "status": status_str,
            "resume": db_app.resume_url,
            "assigned_mentor_id": getattr(db_app, 'assigned_mentor_id', None),
            "assigned_mentor_name": mentor_name,
            "offer_letter_url": getattr(db_app, 'offer_letter_url', None),
            "tc_url": getattr(db_app, 'tc_url', None),
            "signed_offer_letter_url": getattr(db_app, 'signed_offer_letter_url', None),
            "signed_tc_url": getattr(db_app, 'signed_tc_url', None)
        }
    except HTTPException:
        raise
    except Exception as err:
        print(f"[Onboarding Router Error] get_application_details error: {err}")
        raise HTTPException(status_code=500, detail=str(err))

@router.post("/applications/{application_id}/status")
def update_application_status(application_id: str, update: StatusUpdate, db: Session = Depends(get_db)):
    app_id = parse_app_id(application_id)
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
    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.required:
        db_app.status = models.ApplicationStatus.INTERVIEW_SCHEDULED
        
        if not req.scheduled_time:
            raise HTTPException(status_code=400, detail="Scheduled time is required for interview")
            
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        
        # Generate daily link based on date portion of scheduled time (e.g. YYYY-MM-DD)
        date_part = req.scheduled_time.split("T")[0]
        generated_meet_link = f"{FRONTEND_URL}/meeting/interview-{date_part}"
        
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
        try:
            from services.email_service import dispatch_notification, EventType
            payment_url = req.payment_form_link or "https://docs.google.com/forms/d/e/1FAIpQLSc-ZEaOZTekZKlJgivqgC3EHsyJBY2gHqOgGzSHTDQTKq8tJg/viewform?usp=publish-editor"
            dispatch_notification(
                recipient_email=db_app.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Congratulations! Application Selected",
                message=f"Dear {db_app.name}, your application for the {db_app.domain} Internship at ProEduvate has been selected! Please complete your fee payment to proceed with onboarding.",
                action_url=payment_url,
                sender_name="ProEduvate Admissions"
            )
        except Exception as e:
            print(f"[Email Exception] Failed to send direct selection email: {e}")
        
    db.commit()
    return {"message": "Interview decision recorded and emails sent."}

class InterviewRes(BaseModel):
    passed: bool
    payment_form_link: Optional[str] = None

@router.post("/{application_id}/interview/result")
def interview_result(application_id: str, res: InterviewRes, db: Session = Depends(get_db)):
    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    from services.email_service import dispatch_notification, EventType
    if res.passed:
        db_app.status = models.ApplicationStatus.INTERVIEW_PASSED
        try:
            payment_url = res.payment_form_link or "https://docs.google.com/forms/d/e/1FAIpQLSc-ZEaOZTekZKlJgivqgC3EHsyJBY2gHqOgGzSHTDQTKq8tJg/viewform?usp=publish-editor"
            dispatch_notification(
                recipient_email=db_app.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Interview Cleared - ProEduvate Internship",
                message=f"Congratulations {db_app.name}! You have successfully cleared your interview for the {db_app.domain} Internship. Please complete your fee payment to unlock your onboarding documents.",
                action_url=payment_url,
                sender_name="ProEduvate Admissions"
            )
        except Exception as e:
            print(f"[Email Exception] Failed to send interview pass email: {e}")
    else:
        db_app.status = models.ApplicationStatus.INTERVIEW_FAILED
        try:
            dispatch_notification(
                recipient_email=db_app.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Update on your ProEduvate Internship Application",
                message=f"Dear {db_app.name}, thank you for attending the interview. Unfortunately, we are unable to proceed with your application at this time.",
                action_url=f"{FRONTEND_URL}/onboarding/status?appId=APP-{db_app.id}",
                sender_name="ProEduvate Admissions"
            )
        except Exception as e:
            print(f"[Email Exception] Failed to send interview failed email: {e}")
        
    db.commit()
    return {"message": "Interview result recorded and email sent"}

class PaymentVerifyReq(BaseModel):
    verified: bool

@router.post("/{application_id}/payment/verify")
def verify_payment(application_id: str, req: PaymentVerifyReq, db: Session = Depends(get_db)):
    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    from services.email_service import dispatch_notification, EventType, FRONTEND_URL
    if req.verified:
        db_app.status = models.ApplicationStatus.DOCUMENTS_PENDING
        try:
            dispatch_notification(
                recipient_email=db_app.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Payment Verified - Documents Ready for Signing",
                message=f"Dear {db_app.name}, your payment for the {db_app.domain} Internship has been verified by our team! Your Offer Letter and Terms & Conditions are ready for you to review and sign.",
                action_url=f"{FRONTEND_URL}/onboarding/documents?appId=APP-{db_app.id}",
                sender_name="ProEduvate Admissions"
            )
        except Exception as e:
            print(f"[Email Exception] Failed to send payment verified email: {e}")
    else:
        db_app.status = models.ApplicationStatus.PAYMENT_REJECTED
        try:
            dispatch_notification(
                recipient_email=db_app.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Payment Verification Notice",
                message=f"Dear {db_app.name}, we could not verify your payment submission. Please check your transaction details or contact support.",
                action_url=f"{FRONTEND_URL}/onboarding/payment?appId=APP-{db_app.id}",
                sender_name="ProEduvate Finance"
            )
        except Exception as e:
            print(f"[Email Exception] Failed to send payment rejected email: {e}")
        
    db.commit()
    return {"message": "Payment verification recorded and email sent"}

@router.post("/{application_id}/generate-documents")
def generate_documents(application_id: str, db: Session = Depends(get_db)):
    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.status = models.ApplicationStatus.ACCOUNT_CREATION_PENDING
    
    # Generate REAL documents using DocumentService
    urls = document_service.process_document_generation(db_app)
    
    db_app.offer_letter_url = urls.get('offer_letter_url')
    db_app.tc_url = urls.get('terms_url')
    db.commit()

    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        dispatch_notification(
            recipient_email=db_app.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Onboarding Documents Generated",
            message=f"Dear {db_app.name}, your Offer Letter and Terms & Conditions are ready for review and digital signature.",
            action_url=f"{FRONTEND_URL}/onboarding/documents?appId=APP-{db_app.id}",
            sender_name="ProEduvate Onboarding"
        )
    except Exception as e:
        print(f"[Email Exception] Failed to send document generation notification: {e}")
    
    return {"urls": urls}

class AssignMentorReq(BaseModel):
    mentor_id: int

@router.post("/{application_id}/assign-mentor")
def assign_mentor(application_id: str, req: AssignMentorReq, db: Session = Depends(get_db)):
    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.assigned_mentor_id = req.mentor_id
    db.commit()

    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        mentor_user = db.query(models.User).filter(models.User.id == req.mentor_id).first()
        mentor_name = mentor_user.name if mentor_user else "Assigned Mentor"
        
        # Email Intern
        dispatch_notification(
            recipient_email=db_app.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Mentor Assigned - ProEduvate Internship",
            message=f"Dear {db_app.name}, mentor {mentor_name} has been assigned to guide you during your {db_app.domain} Internship.",
            action_url=f"{FRONTEND_URL}/login",
            sender_name="ProEduvate Team"
        )
        
        # Email Mentor if mentor email exists
        if mentor_user and mentor_user.email:
            dispatch_notification(
                recipient_email=mentor_user.email,
                event_type=EventType.TASK_ASSIGNED,
                title="New Intern Assigned",
                message=f"Hello {mentor_name}, intern {db_app.name} ({db_app.domain}) has been assigned to you.",
                action_url=f"{FRONTEND_URL}/admin/onboarding",
                sender_name="ProEduvate System"
            )
    except Exception as e:
        print(f"[Email Exception] Failed to send mentor assignment emails: {e}")

    return {"message": "Mentor assigned"}

@router.post("/{application_id}/create-account")
def create_account(application_id: str, db: Session = Depends(get_db)):
    from main import pwd_context
    from datetime import datetime

    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Generate account if not exists
    if not db_app.user_id:
        clean_app_email = db_app.email.strip().lower() if db_app.email else ""
        existing_user = db.query(models.User).filter(func.lower(models.User.email) == clean_app_email).first()
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
        
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        login_url = f"{FRONTEND_URL}/login"
        dispatch_notification(
            recipient_email=new_user.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Account Activated - Credentials Enclosed",
            message=f"Welcome {new_user.name}! Your account has been activated. Your Intern ID is {intern_id}. Your default password is: {default_pwd}. Please login and change your password.",
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
    app_id = parse_app_id(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    doc_name = "Offer Letter" if req.document_type == "offer_letter" else "Terms & Conditions"
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

    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        dispatch_notification(
            recipient_email=db_app.email,
            event_type=EventType.SYSTEM_ALERT,
            title=f"Signed Document Received ({doc_name})",
            message=f"Dear {db_app.name}, we have successfully recorded your digital signature for your {doc_name}.",
            action_url=signed_url or f"{FRONTEND_URL}/onboarding/documents",
            sender_name="ProEduvate Onboarding"
        )
    except Exception as e:
        print(f"[Email Exception] Failed to send document signed email: {e}")

    return {"message": "Document signed successfully", "url": signed_url}
