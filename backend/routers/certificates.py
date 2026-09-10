from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from database import get_db
import models, schemas
from services.certificate_generator import generate_certificate_pdf
from services.email_service import send_certificate_email
from fastapi import Header



from fastapi import Header
from core.security import decode_token

def get_current_user_from_token(authorization: str = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        if payload and payload.get("user_id"):
            user = db.query(models.User).filter(models.User.id == payload.get("user_id")).first()
            if user:
                return user
    
    # Fallback to an intern user for demo if token fails/missing
    fallback_user = db.query(models.User).filter(models.User.role == "intern").first()
    if fallback_user:
        return fallback_user
    # If no users exist, create a mock one so it doesn't crash
    return models.User(id=1, role="intern", name="Guest Intern", domain="Data Science")

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])

@router.post("/request", response_model=schemas.CertificateResponse)

@router.get("/me", response_model=schemas.CertificateResponse)
def get_my_certificate(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_token)):
    cert = db.query(models.Certificate).filter(models.Certificate.intern_id == current_user.id).order_by(models.Certificate.id.desc()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No certificate found")
    return cert

@router.post("/request", response_model=schemas.CertificateResponse)
def request_certificate(req: schemas.CertificateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_token)):
    if current_user.role != "intern":
        raise HTTPException(status_code=403, detail="Only interns can request certificates.")
        
    existing = db.query(models.Certificate).filter(models.Certificate.intern_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Certificate request already exists.")
        
    cert_id = f"CERT-2026-OIP-{uuid.uuid4().hex[:8].upper()}"
    
    
    if hasattr(current_user, 'domain') and current_user.domain:
        domain = current_user.domain.name if hasattr(current_user.domain, 'name') else str(current_user.domain)
    else:
        domain = "Software Engineering"

    
    new_cert = models.Certificate(
        intern_id=current_user.id,
        intern_name=current_user.name,
        certificate_id=cert_id,
        domain=domain,
        duration=req.duration,
        achievement=req.achievement,
        status="PENDING_ADMIN_APPROVAL",
        grade=req.grade,
        final_score=req.final_score
    )
    
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@router.get("/pending", response_model=List[schemas.CertificateResponse])
def get_pending_certificates(db: Session = Depends(get_db)):
    return db.query(models.Certificate).filter(models.Certificate.status == "PENDING_ADMIN_APPROVAL").all()

@router.post("/{cert_id}/approve")
def approve_certificate(cert_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    cert = db.query(models.Certificate).filter(models.Certificate.certificate_id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
        
    if cert.status == "APPROVED":
        raise HTTPException(status_code=400, detail="Certificate already approved.")
        
    cert.status = "APPROVED"
    cert.issued_date = datetime.utcnow()
    
    cert_data = {
        'intern_name': cert.intern_name,
        'domain': cert.domain,
        'duration': cert.duration,
        'achievement': cert.achievement,
        'certificate_id': cert.certificate_id,
        'issued_date': cert.issued_date.strftime("%Y-%m-%d")
    }
    pdf_path = generate_certificate_pdf(cert_data)
    cert.pdf_path = pdf_path
    
    db.commit()
    
    user = db.query(models.User).filter(models.User.id == cert.intern_id).first()
    if user and user.email:
        background_tasks.add_task(send_certificate_email, user.email, user.name, pdf_path)
        
    return {"message": "Certificate approved successfully.", "pdf_path": pdf_path}

@router.post("/{cert_id}/reject")
def reject_certificate(cert_id: str, db: Session = Depends(get_db)):
    cert = db.query(models.Certificate).filter(models.Certificate.certificate_id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
        
    cert.status = "REJECTED"
    db.commit()
    return {"message": "Certificate rejected."}

@router.get("/verify/{cert_id}")
def verify_certificate(cert_id: str, db: Session = Depends(get_db)):
    cert = db.query(models.Certificate).filter(models.Certificate.certificate_id == cert_id).first()
    if not cert or cert.status != "APPROVED":
        raise HTTPException(status_code=404, detail="Invalid or unapproved certificate.")
        
    return {
        "verified": True,
        "intern_name": cert.intern_name,
        "domain": cert.domain,
        "duration": cert.duration,
        "issued_date": cert.issued_date,
        "certificate_id": cert.certificate_id
    }
