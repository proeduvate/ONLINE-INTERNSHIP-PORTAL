import io
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel, Field
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS = BASE_DIR / "assets"
STORAGE = BASE_DIR / "storage"
STORAGE.mkdir(exist_ok=True)
DB_URL = f"sqlite:///{BASE_DIR / 'certificate.db'}"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)
    intern_id = Column(Integer, nullable=True)

class Intern(Base):
    __tablename__ = "interns"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    domain = Column(String(150), nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    final_score = Column(Float, nullable=True)
    grade = Column(String(10), nullable=True)
    eligibility = Column(String(30), default="PENDING")

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True)
    certificate_id = Column(String(80), unique=True, nullable=False)
    intern_id = Column(Integer, ForeignKey("interns.id"), nullable=False)
    score = Column(Float, nullable=False)
    grade = Column(String(10), nullable=False)
    status = Column(String(30), default="PENDING_REVIEW")
    rejection_reason = Column(Text, nullable=True)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    generated_at = Column(DateTime, nullable=True)
    pdf_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    certificate_id = Column(String(80), nullable=False)
    actor = Column(String(100), nullable=False)
    action = Column(String(80), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(engine)


def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def grade_for(score: float) -> str:
    if score >= 91:
        return "O"
    if score >= 81:
        return "A+"
    if score >= 71:
        return "A"
    if score >= 61:
        return "B+"
    if score >= 51:
        return "B"
    if score >= 45:
        return "C"
    return "FAIL"


def eligible(score: float) -> bool:
    return score >= 45


def issue_token(username: str, role: str, intern_id: Optional[int] = None):
    payload = {
        "sub": username,
        "role": role,
        "intern_id": intern_id,
        "exp": datetime.utcnow() + timedelta(hours=12),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        return jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def admin_user(user=Depends(current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def seed():
    session = SessionLocal()
    try:
        if not session.query(User).filter_by(username=ADMIN_USERNAME).first():
            session.add(User(username=ADMIN_USERNAME, password_hash=pwd.hash(ADMIN_PASSWORD), role="admin"))
        if session.query(Intern).count() == 0:
            samples = [
                ("Karan", "karan@example.com", "Full Stack Development", "2026-01-07", "2026-02-15", "karan", "Karan@123", 87),
                ("Ananya", "ananya@example.com", "AI/ML", "2026-01-10", "2026-02-09", "ananya", "Ananya@123", 94),
                ("Rahul", "rahul@example.com", "Python Development", "2026-01-05", "2026-02-04", "rahul", "Rahul@123", 42),
            ]
            for name, email, domain, sd, ed, username, password, score in samples:
                intern = Intern(
                    name=name,
                    email=email,
                    domain=domain,
                    start_date=sd,
                    end_date=ed,
                    username=username,
                    password_hash=pwd.hash(password),
                    final_score=score,
                    grade=grade_for(score),
                    eligibility="ELIGIBLE" if eligible(score) else "NOT_ELIGIBLE",
                )
                session.add(intern)
                session.flush()
                session.add(User(username=username, password_hash=pwd.hash(password), role="intern", intern_id=intern.id))
        session.commit()
    finally:
        session.close()


seed()

app = FastAPI(title="ProEduvate Certificate Portal", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class ScoreRequest(BaseModel):
    score: float = Field(ge=0, le=100)

class RejectRequest(BaseModel):
    reason: str = Field(min_length=2, max_length=500)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "certificate-portal"}

@app.post("/api/auth/login")
def login(body: LoginRequest, session: Session = Depends(db)):
    identity = (body.username or body.email or "").strip()
    if not identity:
        raise HTTPException(status_code=400, detail="Username or email is required")

    user = session.query(User).filter(or_(User.username == identity, User.email == identity)).first()
    if not user:
        user = session.query(User).filter(User.username.ilike(f"{identity}%")).first()

    if not user or not pwd.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token_val = issue_token(user.username, user.role, user.intern_id)
    return {
        "token": token_val,
        "access_token": token_val,
        "role": user.role,
        "username": user.username,
        "intern_id": user.intern_id,
    }

@app.get("/api/admin/certificates")
def admin_certificates(_: dict = Depends(admin_user), session: Session = Depends(db)):
    certificates = session.query(Certificate).order_by(Certificate.created_at.desc()).all()
    result = []
    for cert in certificates:
        intern = session.get(Intern, cert.intern_id)
        result.append({
            "id": cert.id,
            "certificate_id": cert.certificate_id,
            "intern_id": intern.id,
            "name": intern.name,
            "domain": intern.domain,
            "start_date": intern.start_date,
            "end_date": intern.end_date,
            "score": cert.score,
            "grade": cert.grade,
            "status": cert.status,
            "rejection_reason": cert.rejection_reason,
            "approved_by": cert.approved_by,
            "approved_at": cert.approved_at,
            "generated_at": cert.generated_at,
        })
    return result

@app.get("/api/admin/interns")
def admin_interns(_: dict = Depends(admin_user), session: Session = Depends(db)):
    return [
        {
            "id": intern.id,
            "name": intern.name,
            "email": intern.email,
            "domain": intern.domain,
            "start_date": intern.start_date,
            "end_date": intern.end_date,
            "score": intern.final_score,
            "grade": intern.grade,
            "eligibility": intern.eligibility,
        }
        for intern in session.query(Intern).order_by(Intern.id).all()
    ]

@app.post("/api/admin/certificates/{intern_id}/prepare")
def prepare_certificate(intern_id: int, body: ScoreRequest, user=Depends(admin_user), session: Session = Depends(db)):
    intern = session.get(Intern, intern_id)
    if not intern:
        raise HTTPException(404, "Intern not found")

    score = float(body.score)
    intern.final_score = score
    intern.grade = grade_for(score)
    intern.eligibility = "ELIGIBLE" if eligible(score) else "NOT_ELIGIBLE"

    existing = session.query(Certificate).filter_by(intern_id=intern_id).first()
    if not eligible(score):
        if existing:
            existing.status = "NOT_ELIGIBLE"
            existing.score = score
            existing.grade = intern.grade
            existing.updated_at = datetime.utcnow()
        session.commit()
        return {
            "eligible": False,
            "score": score,
            "grade": intern.grade,
            "message": "Score below 45. Certificate will not be generated.",
        }

    if existing and existing.status not in ("GENERATED",):
        existing.score = score
        existing.grade = intern.grade
        existing.status = "PENDING_REVIEW"
        existing.rejection_reason = None
        existing.updated_at = datetime.utcnow()
        cert = existing
    elif existing and existing.status == "GENERATED":
        raise HTTPException(400, "Certificate is already generated. Use a controlled regeneration process if required.")
    else:
        number = session.query(Certificate).count() + 1
        certificate_id = f"PE-CERT-{datetime.utcnow().year}-{number:06d}"
        cert = Certificate(
            certificate_id=certificate_id,
            intern_id=intern_id,
            score=score,
            grade=intern.grade,
            status="PENDING_REVIEW",
        )
        session.add(cert)
        session.flush()

    session.add(AuditLog(
        certificate_id=cert.certificate_id,
        actor=user["sub"],
        action="SCORE_UPDATED",
        details=f"Score={score:g}, Grade={intern.grade}",
    ))
    session.commit()
    return {
        "eligible": True,
        "certificate_id": cert.certificate_id,
        "score": cert.score,
        "grade": cert.grade,
        "status": cert.status,
    }

# ---------- Certificate rendering ----------
# The supplied master_template.png is the complete visual certificate background.
# The QR code is part of that image and is deliberately kept STATIC.
# Dynamic text is drawn into blank areas only. Signature/seal are overlaid ONLY after approval.

FONT_DIR = ASSETS / "fonts"
TEMPLATE_PATH = ASSETS / "master_template.png"
SIGNATURE_PATH = ASSETS / "ceo_signature_block.png"
SEAL_PATH = ASSETS / "official_seal.png"


def load_font(name: str, size: int):
    return ImageFont.truetype(str(FONT_DIR / name), size)


def text_width(draw: ImageDraw.ImageDraw, text: str, font) -> float:
    return draw.textlength(text, font=font)


def centered_text(draw: ImageDraw.ImageDraw, image_width: int, y: int, text: str, font, fill):
    width = text_width(draw, text, font)
    draw.text(((image_width - width) / 2, y), text, font=font, fill=fill)


def centered_rich_text(draw: ImageDraw.ImageDraw, image_width: int, y: int, parts):
    total = sum(text_width(draw, text, font) for text, font, _ in parts)
    x = (image_width - total) / 2
    for text, font, fill in parts:
        draw.text((x, y), text, font=font, fill=fill)
        x += text_width(draw, text, font)


def ordinal(n: int) -> str:
    if 10 <= n % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def format_date(s: str) -> str:
    try:
        dt = datetime.strptime(s, "%Y-%m-%d")
        return f"{ordinal(dt.day)} {dt.strftime('%B %Y')}"
    except Exception:
        return s


def fit_font(draw, text: str, font_name: str, start_size: int, max_width: int):
    size = start_size
    while size > 9:
        font = load_font(font_name, size)
        if text_width(draw, text, font) <= max_width:
            return font
        size -= 1
    return load_font(font_name, size)


def build_certificate_image(session: Session, cert: Certificate, include_authorization: bool) -> bytes:
    intern = session.get(Intern, cert.intern_id)
    if not intern:
        raise HTTPException(404, "Intern not found")

    image = Image.open(TEMPLATE_PATH).convert("RGBA")
    draw = ImageDraw.Draw(image)
    width, height = image.size

    dark = (42, 42, 42, 255)
    blue = (18, 94, 155, 255)

    # 1. Recipient name: exact blank area above the existing blue line.
    name_font = fit_font(draw, intern.name, "Roboto-Bold.ttf", 44, 620)
    centered_text(draw, width, 190, intern.name, name_font, (4, 4, 4, 255))

    # 2. Main certificate sentence: kept on one clean line where possible.
    domain_text = intern.domain.strip()
    prefix = "for successfully completing the "
    suffix = " Training"
    regular = load_font("Roboto-Regular.ttf", 17)
    italic_bold = load_font("Roboto-BoldItalic.ttf", 17)
    total = text_width(draw, prefix, regular) + text_width(draw, domain_text, italic_bold) + text_width(draw, suffix, regular)
    if total > 760:
        regular = fit_font(draw, prefix + domain_text + suffix, "Roboto-Regular.ttf", 17, 760)
        italic_bold = fit_font(draw, domain_text, "Roboto-BoldItalic.ttf", 17, 350)
    centered_rich_text(
        draw,
        width,
        257,
        [
            (prefix, regular, dark),
            (domain_text, italic_bold, dark),
            (suffix, regular, dark),
        ],
    )

    # 3. Dates, with the same sentence structure as the supplied certificate.
    dates = f"at ProEduvate from {format_date(intern.start_date)} to {format_date(intern.end_date)}."
    centered_text(draw, width, 282, dates, fit_font(draw, dates, "Roboto-Regular.ttf", 16, 760), dark)

    # 4. Original descriptive paragraph, constrained to the existing blank area.
    paragraph_font = load_font("Roboto-Italic.ttf", 11)
    paragraph_lines = [
        "During this period, the candidate actively participated in the training sessions and demonstrated dedication",
        f"in learning concepts related to {domain_text}. The candidate has shown good technical",
        "understanding, teamwork, and professional conduct throughout the training duration.",
    ]
    for index, line in enumerate(paragraph_lines):
        font = fit_font(draw, line, "Roboto-Italic.ttf", 11, 720)
        centered_text(draw, width, 311 + index * 18, line, font, dark)

    # 5. Appreciation text from the supplied certificate.
    appreciation = [
        "We appreciate the candidate’s commitment and efforts during the program and wish them success in",
        "their future academic and professional endeavors.",
    ]
    for index, line in enumerate(appreciation):
        font = fit_font(draw, line, "Roboto-Italic.ttf", 11, 720)
        centered_text(draw, width, 367 + index * 17, line, font, dark)

    # 6. Grade/score is added below the original wording without overlapping it.
    grade_line = f"Final Grade: {cert.grade}  |  Score: {cert.score:g}/100"
    grade_font = load_font("Roboto-Bold.ttf", 13)
    centered_text(draw, width, 404, grade_line, grade_font, blue)

    # IMPORTANT: no new QR code is created. The static QR already exists in master_template.png.

    # 7. Official signature and seal are applied ONLY after admin approval.
    if include_authorization:
        # These assets were prepared to match the bottom design of the master template.
        seal = Image.open(SEAL_PATH).convert("RGBA")
        signature = Image.open(SIGNATURE_PATH).convert("RGBA")
        image.alpha_composite(seal, (370, 417))
        image.alpha_composite(signature, (610, 409))

    # Certificate ID is metadata/audit information and is intentionally not printed
    # over the visual certificate, preserving the supplied certificate format.
    output = io.BytesIO()
    image.convert("RGB").save(output, format="PNG")
    return output.getvalue()


def build_certificate_pdf(session: Session, cert: Certificate, include_authorization: bool) -> bytes:
    png_data = build_certificate_image(session, cert, include_authorization)
    png = Image.open(io.BytesIO(png_data))
    width, height = png.size
    output = io.BytesIO()
    pdf = canvas.Canvas(output, pagesize=(width, height))
    pdf.drawImage(ImageReader(io.BytesIO(png_data)), 0, 0, width=width, height=height)
    pdf.setTitle(f"ProEduvate Certificate - {cert.certificate_id}")
    pdf.setAuthor("ProEduvate")
    pdf.showPage()
    pdf.save()
    output.seek(0)
    return output.getvalue()


@app.get("/api/admin/certificates/{certificate_id}/preview")
def preview(certificate_id: str, _: dict = Depends(admin_user), session: Session = Depends(db)):
    cert = session.query(Certificate).filter_by(certificate_id=certificate_id).first()
    if not cert:
        raise HTTPException(404, "Certificate not found")

    # Pending/review preview intentionally has NO CEO signature or official seal.
    # Generated/approved preview displays the exact final certificate.
    include_authorization = cert.status == "GENERATED"
    data = build_certificate_pdf(session, cert, include_authorization=include_authorization)
    filename = f"{certificate_id}-{'final' if include_authorization else 'preview'}.pdf"
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )

@app.post("/api/admin/certificates/{certificate_id}/approve")
def approve(certificate_id: str, user=Depends(admin_user), session: Session = Depends(db)):
    cert = session.query(Certificate).filter_by(certificate_id=certificate_id).first()
    if not cert:
        raise HTTPException(404, "Certificate not found")
    if cert.score < 45:
        raise HTTPException(400, "Certificate is not eligible")
    if cert.status not in ("PENDING_REVIEW", "REJECTED", "NOT_ELIGIBLE"):
        raise HTTPException(400, f"Cannot approve certificate in {cert.status} state")

    cert.status = "APPROVED"
    cert.approved_by = user["sub"]
    cert.approved_at = datetime.utcnow()
    cert.rejection_reason = None

    # Signature + seal are applied here, and nowhere in the draft/preview path.
    data = build_certificate_pdf(session, cert, include_authorization=True)
    filename = f"{cert.certificate_id}.pdf"
    (STORAGE / filename).write_bytes(data)

    cert.status = "GENERATED"
    cert.generated_at = datetime.utcnow()
    cert.pdf_filename = filename
    cert.updated_at = datetime.utcnow()
    session.add(AuditLog(
        certificate_id=cert.certificate_id,
        actor=user["sub"],
        action="CERTIFICATE_APPROVED_AND_GENERATED",
        details="CEO signature and official seal applied. Static QR retained from master template.",
    ))
    session.commit()
    return {"status": cert.status, "certificate_id": cert.certificate_id, "filename": filename}

@app.post("/api/admin/certificates/{certificate_id}/reject")
def reject(certificate_id: str, body: RejectRequest, user=Depends(admin_user), session: Session = Depends(db)):
    cert = session.query(Certificate).filter_by(certificate_id=certificate_id).first()
    if not cert:
        raise HTTPException(404, "Certificate not found")
    cert.status = "REJECTED"
    cert.rejection_reason = body.reason
    cert.updated_at = datetime.utcnow()
    session.add(AuditLog(certificate_id=cert.certificate_id, actor=user["sub"], action="CERTIFICATE_REJECTED", details=body.reason))
    session.commit()
    return {"status": "REJECTED"}

@app.get("/api/admin/certificates/{certificate_id}/download")
def admin_download(certificate_id: str, _: dict = Depends(admin_user), session: Session = Depends(db)):
    cert = session.query(Certificate).filter_by(certificate_id=certificate_id).first()
    if not cert or cert.status != "GENERATED" or not cert.pdf_filename:
        raise HTTPException(404, "Generated certificate not found")
    path = STORAGE / cert.pdf_filename
    if not path.exists():
        raise HTTPException(404, "PDF file missing")
    return StreamingResponse(open(path, "rb"), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{path.name}"'})

@app.get("/api/admin/certificates/{certificate_id}/audit")
def audit(certificate_id: str, _: dict = Depends(admin_user), session: Session = Depends(db)):
    return [
        {"actor": item.actor, "action": item.action, "details": item.details, "created_at": item.created_at}
        for item in session.query(AuditLog).filter_by(certificate_id=certificate_id).order_by(AuditLog.created_at.desc()).all()
    ]

@app.get("/api/intern/me")
def intern_me(user=Depends(current_user), session: Session = Depends(db)):
    if user.get("role") != "intern":
        raise HTTPException(403, "Intern access required")
    intern = session.get(Intern, user.get("intern_id"))
    if not intern:
        raise HTTPException(404, "Intern not found")
    cert = session.query(Certificate).filter_by(intern_id=intern.id).first()
    return {
        "id": intern.id,
        "name": intern.name,
        "email": intern.email,
        "domain": intern.domain,
        "start_date": intern.start_date,
        "end_date": intern.end_date,
        "score": intern.final_score,
        "grade": intern.grade,
        "eligibility": intern.eligibility,
        "certificate": None if not cert else {
            "certificate_id": cert.certificate_id,
            "status": cert.status,
            "rejection_reason": cert.rejection_reason,
        },
    }

@app.get("/api/intern/certificate/download")
def intern_download(user=Depends(current_user), session: Session = Depends(db)):
    if user.get("role") != "intern":
        raise HTTPException(403, "Intern access required")
    cert = session.query(Certificate).filter_by(intern_id=user.get("intern_id"), status="GENERATED").first()
    if not cert or not cert.pdf_filename:
        raise HTTPException(404, "Approved certificate is not available")
    path = STORAGE / cert.pdf_filename
    if not path.exists():
        raise HTTPException(404, "PDF file missing")
    session.add(AuditLog(certificate_id=cert.certificate_id, actor=user["sub"], action="CERTIFICATE_DOWNLOADED", details="Intern downloaded certificate"))
    session.commit()
    return StreamingResponse(open(path, "rb"), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{path.name}"'})

@app.get("/api/admin/stats")
def stats(_: dict = Depends(admin_user), session: Session = Depends(db)):
    return {
        "interns": session.query(Intern).count(),
        "pending": session.query(Certificate).filter_by(status="PENDING_REVIEW").count(),
        "generated": session.query(Certificate).filter_by(status="GENERATED").count(),
        "rejected": session.query(Certificate).filter_by(status="REJECTED").count(),
        "not_eligible": session.query(Certificate).filter_by(status="NOT_ELIGIBLE").count(),
    }
