from typing import Any, Dict, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

# ---------------------------------------------------------------------------
# Safe Imports (prevents dual-namespace circular import loop)
# ---------------------------------------------------------------------------
try:
    from app.api import deps
except ImportError:
    from backend.app.api import deps

try:
    from app.models import User
except ImportError:
    from backend.app.models import User

try:
    from app.models.certificate import Certificate
except ImportError:
    try:
        from app.models import Certificate
    except ImportError:
        try:
            from backend.app.models.certificate import Certificate
        except ImportError:
            Certificate = None

from backend.app.services.html_certificate_service import HTMLCertificateService

router = APIRouter()
cert_service = HTMLCertificateService()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class CertificateGenerateRequest(BaseModel):
    user_id: int
    domain: str
    score: float
    duration: Optional[str] = "1 Month"
    start_date: Optional[str] = "August 18, 2026"
    end_date: Optional[str] = "September 18, 2026"
    issue_date: Optional[str] = "September 23, 2026"


class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    certificate_id: str
    intern_name: Optional[str] = None
    domain: Optional[str] = None
    grade: Optional[str] = None
    issue_date: Optional[str] = None
    status: str


get_db = deps.get_db

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

def resolve_cert_and_user(certificate_id: str, db: Session):
    cert_record = None
    user = None

    if Certificate is not None:
        cert_record = db.query(Certificate).filter(Certificate.certificate_id == certificate_id).first()

    if cert_record:
        user = db.query(User).filter(User.id == cert_record.intern_id).first()

    if not user:
        if certificate_id.isdigit():
            user = db.query(User).filter(User.id == int(certificate_id)).first()
        else:
            import re
            digits = re.findall(r'\d+', certificate_id)
            if digits:
                user = db.query(User).filter(User.id == int(digits[-1])).first()

        if user and not cert_record and Certificate is not None:
            cert_record = db.query(Certificate).filter(Certificate.intern_id == user.id).first()

    return cert_record, user


def get_intern_leaderboard_score(user_id: Optional[int], db: Session) -> float:
    """
    Queries cumulative progress points from Leaderboard models (PointTransaction, Submission, MCQAttempt, AirdropResult)
    for the specified intern and converts to a standardized percentage score (0-100).
    """
    if not user_id:
        return 91.0

    total_points = 0.0

    try:
        from sqlalchemy import func
        # 1. PointTransactions
        try:
            from app.models import PointTransaction
            pt = db.query(func.sum(PointTransaction.points)).filter(PointTransaction.user_id == user_id).scalar()
            if pt:
                total_points += float(pt)
        except Exception:
            pass

        # 2. Submissions (ai_score)
        try:
            from app.models import Submission
            sub = db.query(func.sum(Submission.ai_score)).filter(Submission.intern_id == user_id).scalar()
            if sub:
                total_points += float(sub)
        except Exception:
            pass

        # 3. MCQAttempt
        try:
            from app.models import MCQAttempt
            mcq = db.query(func.sum(MCQAttempt.score)).filter(MCQAttempt.intern_id == user_id).scalar()
            if mcq:
                total_points += float(mcq)
        except Exception:
            pass

        # 4. AirdropResult
        try:
            from app.models import AirdropResult
            air = db.query(func.sum(AirdropResult.bonus_points)).filter(AirdropResult.intern_id == user_id).scalar()
            if air:
                total_points += float(air)
        except Exception:
            pass

    except Exception:
        pass

    if total_points > 0:
        return min(100.0, float(total_points))

    # Fallback to User.attendance_pct or default mock score if no points recorded yet
    user = db.query(User).filter(User.id == user_id).first() if User else None
    if user and getattr(user, "attendance_pct", None):
        return float(user.attendance_pct)

    return 91.0


@router.get("/download/{certificate_id}", summary="Download or preview certificate PDF")
def download_certificate(
    certificate_id: str,
    disposition: str = Query("inline", pattern="^(inline|attachment)$"),
    db: Session = Depends(deps.get_db)
):
    """
    Renders the certificate PDF dynamically via PIL/ReportLab
    and streams it with headers for inline viewing or direct downloading.
    """
    cert_record, user = resolve_cert_and_user(certificate_id, db)
    if not cert_record and not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate or intern record not found"
        )
    user_id = user.id if user else (cert_record.intern_id if cert_record else None)

    if cert_record and cert_record.final_score is not None and cert_record.final_score > 0:
        score = float(cert_record.final_score)
    else:
        score = get_intern_leaderboard_score(user_id, db)

    if score < 45:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score below 45. Certificate will not be generated."
        )

    intern_name = (getattr(user, "full_name", None) or getattr(user, "username", None) or getattr(cert_record, "intern_name", None) or "INTERN").strip().upper()
    domain = getattr(cert_record, "domain", None) or getattr(user, "domain", None) or "Full Stack Web Development"
    if hasattr(domain, 'name'):
        domain = domain.name
    domain = str(domain)

    duration = getattr(cert_record, "duration", "1 Month") or "1 Month"
    start_date = getattr(cert_record, "start_date", "") or "August 18, 2026"
    end_date = getattr(cert_record, "end_date", "") or "September 18, 2026"
    issue_date = getattr(cert_record, "issue_date", "") or datetime.utcnow().strftime("%d %B %Y").upper()

    cert_status = str(getattr(cert_record, "status", "APPROVED")).upper()
    is_approved = cert_status in ("GENERATED", "ISSUED", "APPROVED")

    try:
        payload = {
            "intern_name": intern_name,
            "domain": domain,
            "score": score,
            "duration": duration,
            "start_date": start_date,
            "end_date": end_date,
            "cert_id": cert_record.certificate_id if cert_record else certificate_id,
            "issue_date": issue_date,
        }
        pdf_bytes = cert_service.generate_certificate_pdf(payload, include_authorization=is_approved)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate certificate PDF: {str(exc)}"
        )

    filename = f"Certificate_{certificate_id}.pdf"
    content_disposition = f'{disposition}; filename="{filename}"'

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": content_disposition,
            "Content-Type": "application/pdf",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )


@router.get("/preview/{certificate_id}", summary="Preview certificate PDF in browser tab")
def preview_certificate(certificate_id: str, db: Session = Depends(deps.get_db)):
    """
    Direct alias to stream PDF inline for browser viewing (previews hide signature/seal).
    """
    cert_record, user = resolve_cert_and_user(certificate_id, db)
    if not cert_record and not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate or intern record not found"
        )
    user_id = user.id if user else (cert_record.intern_id if cert_record else None)

    if cert_record and cert_record.final_score is not None and cert_record.final_score > 0:
        score = float(cert_record.final_score)
    else:
        score = get_intern_leaderboard_score(user_id, db)

    if score < 45:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score below 45. Certificate will not be generated."
        )

    intern_name = (getattr(user, "full_name", None) or getattr(user, "username", None) or getattr(cert_record, "intern_name", None) or "INTERN").strip().upper()
    domain = getattr(cert_record, "domain", None) or getattr(user, "domain", None) or "Full Stack Web Development"
    if hasattr(domain, 'name'):
        domain = domain.name
    domain = str(domain)

    duration = getattr(cert_record, "duration", "1 Month") or "1 Month"
    start_date = getattr(cert_record, "start_date", "") or "August 18, 2026"
    end_date = getattr(cert_record, "end_date", "") or "September 18, 2026"
    issue_date = getattr(cert_record, "issue_date", "") or datetime.utcnow().strftime("%d %B %Y").upper()

    try:
        payload = {
            "intern_name": intern_name,
            "domain": domain,
            "score": score,
            "duration": duration,
            "start_date": start_date,
            "end_date": end_date,
            "cert_id": cert_record.certificate_id if cert_record else certificate_id,
            "issue_date": issue_date,
        }
        # Previews hide signatures/seals (include_authorization=False)
        pdf_bytes = cert_service.generate_certificate_pdf(payload, include_authorization=False)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate certificate PDF: {str(exc)}"
        )

    filename = f"Preview_Certificate_{certificate_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Content-Type": "application/pdf",
        }
    )


@router.get("/intern/{intern_id}", summary="Get certificate metadata for an intern")
def get_intern_certificate(intern_id: str, db: Session = Depends(deps.get_db)):
    cert_record, user = resolve_cert_and_user(intern_id, db)
    if not cert_record and not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate or intern record not found"
        )

    cert_id = cert_record.certificate_id if cert_record else f"CERT-{user.id if user else intern_id}"
    intern_name = (getattr(user, "full_name", None) or getattr(user, "username", None) or getattr(cert_record, "intern_name", None) or "INTERN").strip().upper()
    domain = getattr(cert_record, "domain", None) or getattr(user, "domain", None) or "Full Stack Web Development"
    if hasattr(domain, 'name'):
        domain = domain.name
    domain = str(domain)

    user_id = user.id if user else (cert_record.intern_id if cert_record else None)
    if cert_record and cert_record.final_score is not None and cert_record.final_score > 0:
        score = float(cert_record.final_score)
    else:
        score = get_intern_leaderboard_score(user_id, db)

    grade, _ = cert_service.get_grade_info(score)
    pdf_url = f"/api/v1/certificates/download/{cert_id}"
    issue_date = getattr(cert_record, "issue_date", "") or datetime.utcnow().strftime("%d %B %Y").upper()

    return {
        "status": "success",
        "certificate_id": cert_id,
        "certId": cert_id,
        "intern_id": str(user.id) if user else str(intern_id),
        "intern_name": intern_name,
        "domain": str(domain),
        "grade": grade,
        "score": score,
        "duration": getattr(cert_record, "duration", "1 Month") or "1 Month",
        "pdf_url": pdf_url,
        "public_url": pdf_url,
        "issue_date": issue_date
    }


@router.post("/generate", summary="Generate and store new certificate record")
def generate_certificate(
    data: CertificateGenerateRequest,
    db: Session = Depends(deps.get_db)
):
    """
    Creates a new certificate ID, computes the grade, and records it in the database.
    """
    target_user = db.query(User).filter(User.id == data.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    grade, _ = cert_service.get_grade_info(data.score)
    cert_id = f"PE-2026-{data.domain[:3].upper()}-{data.user_id:04d}"

    if Certificate is not None:
        new_cert = Certificate(
            certificate_id=cert_id,
            user_id=data.user_id,
            domain=data.domain,
            score=data.score,
            duration=data.duration,
            start_date=data.start_date,
            end_date=data.end_date,
            issue_date=data.issue_date,
            status="Issued"
        )
        db.add(new_cert)
        db.commit()
        db.refresh(new_cert)

    return {
        "success": True,
        "certificate_id": cert_id,
        "grade": grade,
        "download_url": f"/api/v1/certificates/download/{cert_id}?disposition=attachment",
        "preview_url": f"/api/v1/certificates/download/{cert_id}?disposition=inline"
    }


@router.get("/verify/{certificate_id}", response_model=CertificateVerifyResponse, summary="Public verification endpoint")
def verify_certificate(certificate_id: str, db: Session = Depends(deps.get_db)):
    """
    Public validation endpoint scanned via QR Code.
    """
    if Certificate is not None:
        cert = db.query(Certificate).filter(Certificate.certificate_id == certificate_id).first()
        if cert:
            user = db.query(User).filter(User.id == cert.user_id).first()
            grade, _ = cert_service.get_grade_info(getattr(cert, "score", 0.0))
            return CertificateVerifyResponse(
                is_valid=True,
                certificate_id=cert.certificate_id,
                intern_name=getattr(user, "full_name", user.username) if user else "Verified Intern",
                domain=getattr(cert, "domain", ""),
                grade=grade,
                issue_date=getattr(cert, "issue_date", ""),
                status="Active / Officially Issued"
            )

    raise HTTPException(status_code=404, detail="Certificate or intern record not found")