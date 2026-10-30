from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import traceback

from database import get_db
from dependencies import get_current_user, check_admin
import models, schemas
from services.certificate_generator import generate_certificate_pdf
from services.email_service import send_certificate_email

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get("/me", response_model=schemas.CertificateResponse)
def get_my_certificate(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cert = db.query(models.Certificate).filter(
        models.Certificate.intern_id == current_user.id
    ).order_by(models.Certificate.id.desc()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No certificate found")
    return cert


@router.post("/request", response_model=schemas.CertificateResponse)
def request_certificate(
    req: schemas.CertificateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", str(current_user.role)).lower()
    if user_role != "intern":
        raise HTTPException(status_code=403, detail="Only interns can request certificates.")

    existing = db.query(models.Certificate).filter(
        models.Certificate.intern_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Certificate request already exists.")

    cert_id = f"CERT-2026-OIP-{uuid.uuid4().hex[:8].upper()}"

    domain = ""
    if hasattr(current_user, 'domain') and current_user.domain:
        domain = current_user.domain.name if hasattr(current_user.domain, 'name') else str(current_user.domain)
    elif getattr(current_user, 'domain_name', None):
        domain = current_user.domain_name
    elif getattr(current_user, 'domain_id', None):
        d_obj = db.query(models.Domain).filter(models.Domain.id == current_user.domain_id).first()
        if d_obj:
            domain = d_obj.name

    if not domain:
        domain = "Software Engineering"

    new_cert = models.Certificate(
        intern_id=current_user.id,
        intern_name=current_user.name,
        certificate_id=cert_id,
        domain=domain,
        duration=req.duration or "1 Month",
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
def get_pending_certificates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    return db.query(models.Certificate).filter(
        models.Certificate.status == "PENDING_ADMIN_APPROVAL"
    ).all()


@router.post("/{cert_id}/approve")
def approve_certificate(
    cert_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    cert = db.query(models.Certificate).filter(
        models.Certificate.certificate_id == cert_id
    ).first()
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
        'issued_date': cert.issued_date.strftime("%Y-%m-%d"),
        'grade': cert.grade or "A"
    }
    pdf_path = generate_certificate_pdf(cert_data)
    cert.pdf_path = pdf_path

    # Also approve user credential flag
    user = db.query(models.User).filter(models.User.id == cert.intern_id).first()
    if user:
        setattr(user, "is_credential_approved", True)

    db.commit()

    if user and user.email:
        background_tasks.add_task(send_certificate_email, user.email, user.name, pdf_path)

    return {"message": "Certificate approved successfully.", "pdf_path": pdf_path}


@router.post("/{cert_id}/reject")
def reject_certificate(
    cert_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    cert = db.query(models.Certificate).filter(
        models.Certificate.certificate_id == cert_id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    cert.status = "REJECTED"
    db.commit()
    return {"message": "Certificate rejected."}


@router.get("/status/{intern_id}")
def get_certificate_status(intern_id: str, db: Session = Depends(get_db)):
    intern = None
    if intern_id.isdigit():
        intern = db.query(models.User).filter(models.User.id == int(intern_id)).first()
    if not intern:
        intern = db.query(models.User).filter(
            (models.User.intern_id == intern_id) | (models.User.email == intern_id)
        ).first()

    cert = None
    if intern:
        cert = db.query(models.Certificate).filter(
            models.Certificate.intern_id == intern.id
        ).order_by(models.Certificate.id.desc()).first()
    else:
        cert = db.query(models.Certificate).filter(
            models.Certificate.certificate_id == intern_id
        ).first()

    if not intern and not cert:
        return {
            "status": "pending",
            "is_approved": False,
            "is_credential_approved": False,
            "certificate_status": "PENDING"
        }

    intern_name = (intern.name if (intern and intern.name) else (getattr(cert, 'intern_name', None) or "INTERN")).upper()
    domain_name = (cert.domain if cert and cert.domain else (getattr(intern, 'domain_name', None) or getattr(intern, 'domain', None) or "Full Stack Web Development"))
    if hasattr(domain_name, 'name'):
        domain_name = domain_name.name

    cert_id = cert.certificate_id if cert else f"PE-2026-FSD-{(intern.id if intern else 1):04d}"
    score = cert.final_score if cert and cert.final_score is not None else 91
    grade = cert.grade if cert and cert.grade else "A+"
    pdf_url = f"/api/v1/certificates/download/{cert_id}"

    cert_status = str(cert.status if cert and cert.status else "").upper()
    is_approved = False
    if cert_status in ("GENERATED", "ISSUED", "APPROVED"):
        is_approved = True
    elif intern and getattr(intern, "is_credential_approved", False):
        is_approved = True

    return {
        "status": "success",
        "is_approved": is_approved,
        "is_credential_approved": is_approved,
        "certificate_status": "APPROVED" if is_approved else "PENDING",
        "certificate_id": cert_id,
        "certId": cert_id,
        "intern_id": str(intern.id) if intern else str(intern_id),
        "intern_name": intern_name,
        "domain": str(domain_name),
        "grade": grade,
        "score": score,
        "duration": getattr(cert, 'duration', '1 Month') if cert else "1 Month",
        "pdf_url": pdf_url,
        "public_url": pdf_url,
        "issue_date": cert.issued_date.strftime('%d %B %Y').upper() if cert and cert.issued_date else (cert.created_at.strftime('%d %B %Y').upper() if cert and cert.created_at else "")
    }


@router.post("/approve/{intern_id}")
def approve_credential_endpoint(
    intern_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    intern = None
    if intern_id.isdigit():
        intern = db.query(models.User).filter(models.User.id == int(intern_id)).first()
    if not intern:
        intern = db.query(models.User).filter(
            (models.User.intern_id == intern_id) | (models.User.email == intern_id)
        ).first()

    cert = None
    if intern:
        cert = db.query(models.Certificate).filter(
            models.Certificate.intern_id == intern.id
        ).order_by(models.Certificate.id.desc()).first()

    if not intern and not cert:
        raise HTTPException(status_code=404, detail="Intern record not found")

    if intern:
        setattr(intern, "is_credential_approved", True)
        db.add(intern)
    if cert:
        cert.status = "APPROVED"
        db.add(cert)
    elif intern:
        cert_id = f"PE-2026-FSD-{intern.id:04d}"
        safe_name = intern.name if (intern and intern.name) else "Intern"
        safe_domain = getattr(intern, "domain_name", None) or getattr(intern, "domain", None) or "Full Stack Web Development"
        if hasattr(safe_domain, 'name'):
            safe_domain = safe_domain.name
        new_cert = models.Certificate(
            certificate_id=cert_id,
            intern_id=intern.id,
            intern_name=safe_name,
            domain=str(safe_domain),
            duration="1 Month",
            status="APPROVED",
            final_score=91
        )
        db.add(new_cert)

    db.commit()
    return {
        "success": True,
        "status": "APPROVED",
        "is_approved": True,
        "is_credential_approved": True,
        "message": "Credential approved successfully. Certificate is now unlocked.",
        "intern_id": str(intern.id if intern else intern_id)
    }


@router.get("/download/{cert_identifier}")
def download_certificate_by_id(
    cert_identifier: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cert_record = db.query(models.Certificate).filter(
        models.Certificate.certificate_id == cert_identifier
    ).first()
    intern = None
    if cert_record:
        intern = db.query(models.User).filter(models.User.id == cert_record.intern_id).first()
    elif cert_identifier.isdigit():
        intern = db.query(models.User).filter(models.User.id == int(cert_identifier)).first()
        if intern:
            cert_record = db.query(models.Certificate).filter(
                models.Certificate.intern_id == intern.id
            ).first()

    if not cert_record and not intern:
        raise HTTPException(status_code=404, detail="Certificate or intern record not found")

    user_role = getattr(current_user.role, "value", str(current_user.role)).lower()
    # Check ownership or admin
    if user_role != "admin":
        if intern and intern.id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied: You may only download your own certificate.")

    # Clearance gate: Must be approved
    cert_status = str(cert_record.status if cert_record and cert_record.status else "").upper()
    is_approved = (cert_status in ("GENERATED", "ISSUED", "APPROVED")) or (intern and getattr(intern, "is_credential_approved", False))

    if not is_approved:
        raise HTTPException(
            status_code=403,
            detail="Certificate is pending admin credential approval upon internship completion."
        )

    # Score threshold gate: B3.4 & B4.7 (score < 45% is blocked)
    raw_score = cert_record.final_score if cert_record and cert_record.final_score is not None else None
    if raw_score is not None and float(raw_score) < 45.0:
        raise HTTPException(
            status_code=403,
            detail="Certificate clearance blocked: Intern final score is below the 45% minimum threshold."
        )

    try:
        intern_name = (intern.name if (intern and intern.name) else (getattr(cert_record, 'intern_name', None) or "INTERN")).upper()
        domain_name = (cert_record.domain if cert_record and cert_record.domain else (getattr(intern, 'domain_name', None) or getattr(intern, 'domain', None) or "Full Stack Web Development"))
        if hasattr(domain_name, 'name'):
            domain_name = domain_name.name

        score = float(raw_score) if raw_score is not None else 91.0
        grade = cert_record.grade if cert_record and cert_record.grade else "A"
        cert_id = cert_record.certificate_id if cert_record else cert_identifier

        start_date = getattr(cert_record, 'start_date', None) or getattr(intern, 'start_date', None) or ""
        end_date = getattr(cert_record, 'end_date', None) or getattr(intern, 'end_date', None) or ""
        issued_date = cert_record.issued_date.strftime('%d %B %Y').upper() if cert_record and cert_record.issued_date else datetime.utcnow().strftime('%d %B %Y').upper()

        cert_data = {
            'intern_name': intern_name,
            'domain': str(domain_name),
            'duration': getattr(cert_record, 'duration', '1 Month') if cert_record else '1 Month',
            'start_date': start_date.strftime('%B %d, %Y') if hasattr(start_date, 'strftime') else str(start_date),
            'end_date': end_date.strftime('%B %d, %Y') if hasattr(end_date, 'strftime') else str(end_date),
            'issued_date': issued_date,
            'certificate_id': cert_id,
            'score': score,
            'grade': grade
        }

        pdf_path = generate_certificate_pdf(cert_data)
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=Certificate_{cert_id}.pdf"}
        )
    except HTTPException:
        raise
    except Exception as e:
        err_msg = f"Certificate generation error: {str(e)}"
        print(f"Error serving certificate download for {cert_identifier}:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=err_msg)


@router.get("/verify/{certificate_id}")
def verify_certificate_endpoint(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    cert = db.query(models.Certificate).filter(models.Certificate.certificate_id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    intern = db.query(models.User).filter(models.User.id == cert.intern_id).first()
    domain_name = cert.domain or (intern.domain.name if intern and intern.domain else "Software Engineering")
    issue_year = cert.issued_date.year if cert.issued_date else datetime.utcnow().year
    issue_month = cert.issued_date.month if cert.issued_date else datetime.utcnow().month

    from urllib.parse import quote
    linkedin_url = (
        f"https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME"
        f"&name={quote(f'{domain_name} Internship')}&organizationName=ProEduvate"
        f"&issueYear={issue_year}&issueMonth={issue_month}"
        f"&certUrl={quote(f'https://proeduvate.com/verify/{cert.certificate_id}')}"
        f"&certId={quote(cert.certificate_id)}"
    )

    return {
        "is_valid": True,
        "certificate_id": cert.certificate_id,
        "intern_name": cert.intern_name or (intern.name if intern else "Intern"),
        "intern_id": intern.intern_id if intern else None,
        "college": intern.college if intern else None,
        "domain": domain_name,
        "duration": cert.duration or "1 Month",
        "grade": cert.grade or "A",
        "final_score": cert.final_score,
        "issued_date": cert.issued_date.strftime('%d %B %Y').upper() if cert.issued_date else datetime.utcnow().strftime('%d %B %Y').upper(),
        "linkedin_add_url": linkedin_url
    }
