from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request, File, UploadFile, Form
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from typing import List, Dict, Any
from services.n8n_service import trigger_n8n_webhook
from services.onboarding_service import onboarding_service
from services.email_service import email_service
from services.supabase_service import supabase_service
import fitz
import base64
import httpx

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

    resume_url = None
    if resume and resume.filename:
        try:
            resume_bytes = await resume.read()
            resume_url = supabase_service.upload_file(
                file_content=resume_bytes,
                bucket_name="documents",
                filename=f"Resume_{name.replace(' ', '_')}.pdf",
                content_type=resume.content_type
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload resume: {str(e)}")

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
    return {
        "status": user.onboarding_status,
        "interview_meet_link": user.interview_meet_link,
        "interview_scheduled_time": str(user.interview_scheduled_time) if user.interview_scheduled_time else None
    }

@router.get("/status/{application_id}")
def get_application_status_by_id(application_id: str, db: Session = Depends(get_db)):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return {
        "status": user.onboarding_status,
        "interview_meet_link": user.interview_meet_link,
        "interview_scheduled_time": str(user.interview_scheduled_time) if user.interview_scheduled_time else None
    }

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
    await onboarding_service.handle_interview_decision(user, is_required, decision, db)
    
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
    await onboarding_service.handle_interview_result(user, passed, result, db)
    
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
        
    urls = await onboarding_service.generate_documents(user, db)
    
    return {
        "message": "Documents generated successfully", 
        "status": user.onboarding_status,
        "urls": urls
    }

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

@router.post("/{application_id}/sign-document-inline")
async def sign_document_inline(
    application_id: str,
    request: schemas.InlineSignatureRequest,
    db: Session = Depends(get_db)
):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if request.document_type == "offer_letter":
        source_url = user.offer_letter_url
        filename = f"Signed_Offer_Letter_{user.name.replace(' ', '_')}.pdf"
    elif request.document_type == "tc":
        source_url = user.tc_url
        filename = f"Signed_TC_{user.name.replace(' ', '_')}.pdf"
    else:
        raise HTTPException(status_code=400, detail="Invalid document type")
        
    if not source_url:
        raise HTTPException(status_code=400, detail=f"No generated {request.document_type} found.")

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(source_url)
            resp.raise_for_status()
            pdf_bytes = resp.content
            
        if "," in request.signature_base64:
            sig_data = request.signature_base64.split(",")[1]
        else:
            sig_data = request.signature_base64
        sig_bytes = base64.b64decode(sig_data)
        
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = doc[-1] 
        
        # Place signature at bottom left
        rect = fitz.Rect(50, 650, 250, 750)
        page.insert_image(rect, stream=sig_bytes)
        
        modified_pdf_bytes = doc.write()
        doc.close()
        
        uploaded_url = supabase_service.upload_file(
            file_content=modified_pdf_bytes,
            bucket_name="documents",
            filename=filename,
            content_type="application/pdf"
        )
        
        if request.document_type == "offer_letter":
            user.signed_offer_letter_url = uploaded_url
        else:
            user.signed_tc_url = uploaded_url
            
        if user.signed_offer_letter_url and user.signed_tc_url:
            user.onboarding_status = "DOCUMENTS_UPLOADED"
            
        db.commit()
        return {"message": f"{request.document_type} signed successfully", "url": uploaded_url, "status": user.onboarding_status}
        
    except Exception as e:
        print(f"Error signing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process signature: {str(e)}")

@router.post("/{application_id}/upload-signed-documents")
async def upload_signed_documents(
    application_id: str,
    offer_letter: UploadFile = File(...),
    terms_conditions: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(application_id.split("-")[1])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if offer_letter and offer_letter.filename:
        try:
            offer_bytes = await offer_letter.read()
            user.signed_offer_letter_url = supabase_service.upload_file(
                file_content=offer_bytes,
                bucket_name="documents",
                filename=f"Signed_Offer_Letter_{user.name.replace(' ', '_')}.pdf",
                content_type=offer_letter.content_type
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload offer letter: {str(e)}")

    if terms_conditions and terms_conditions.filename:
        try:
            tc_bytes = await terms_conditions.read()
            user.signed_tc_url = supabase_service.upload_file(
                file_content=tc_bytes,
                bucket_name="documents",
                filename=f"Signed_TC_{user.name.replace(' ', '_')}.pdf",
                content_type=terms_conditions.content_type
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload T&C: {str(e)}")

    user.onboarding_status = "DOCUMENTS_UPLOADED"
    db.commit()
    
    return {"message": "Signed documents uploaded successfully", "status": user.onboarding_status}

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
        "status": user.onboarding_status,
        "offer_letter_url": user.offer_letter_url,
        "tc_url": user.tc_url,
        "signed_offer_letter_url": user.signed_offer_letter_url,
        "signed_tc_url": user.signed_tc_url
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
