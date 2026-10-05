import os
import io
import json
import re
import ast
import subprocess
import sys
import tempfile
import uuid
import random
import difflib
import base64
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

import jwt
import pytz
import requests
from fpdf import FPDF
from apscheduler.schedulers.background import BackgroundScheduler
from passlib.context import CryptContext

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Header,
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

# ---------------------------------------------------------------------------
# Resilient Module Imports
# ---------------------------------------------------------------------------
try:
    from app import models, schemas
    from app.db import session as database
except ImportError:
    try:
        from backend.app import models, schemas
        from backend.app.db import session as database
    except ImportError:
        import models, schemas
        import session as database

try:
    from app.core.security import pwd_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
except ImportError:
    try:
        from backend.app.core.security import pwd_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
    except ImportError:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        SECRET_KEY = os.environ.get("SECRET_KEY", "proeduvate_secret_key_2026")
        ALGORITHM = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

try:
    from app.utils.sandbox_runner import run_submission as sandbox_run_submission
except Exception:
    sandbox_run_submission = None


# ---------------------------------------------------------------------------
# Helper Helpers
# ---------------------------------------------------------------------------
def _get_user_display_name(user: Any) -> str:
    if not user:
        return "Unknown"
    return getattr(user, "name", None) or getattr(user, "full_name", None) or getattr(user, "username", "Intern")


def _infer_function_spec(code: str, task: Any) -> tuple[Optional[str], int]:
    try:
        tree = ast.parse(code)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                return node.name, len(node.args.args)
    except Exception:
        pass

    for source in (getattr(task, "coding_prompt", None), getattr(task, "coding_solution", None)):
        if source:
            match = re.search(r"def\s+(\w+)\s*\(([^)]*)\)", source)
            if match:
                func_name = match.group(1)
                arg_count = 0 if not match.group(2).strip() else len([p for p in match.group(2).split(",") if p.strip()])
                return func_name, arg_count

    return None, 0


def _parse_test_input(raw_input: str):
    if raw_input is None:
        return None
    if not isinstance(raw_input, str):
        return raw_input
    try:
        return ast.literal_eval(raw_input)
    except Exception:
        return raw_input


# ---------------------------------------------------------------------------
# Application Initialization & Middleware
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Online Internship Portal",
    description="Backend API for managing interns, mentors, curriculum, submissions, messaging, video meetings, and certificates.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

SIGNALING_ROOMS: Dict[str, Any] = {}
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Create tables if not existing
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"[DB] Initial metadata bind warning: {e}")

# Automatic mock data auto-seeding on startup disabled
# System operates strictly against database records

# Centralized API v1 Router Integration
try:
    from app.api.v1.router import api_router as api_v1_router
    app.include_router(api_v1_router, prefix="/api/v1")
    app.include_router(api_v1_router, prefix="/api")
    app.include_router(api_v1_router)
except Exception as err:
    print(f"[Router] Note: Modular router integration bypassed or already loaded: {err}")


# ==========================================
#          JWT SECURITY DEPENDENCY
# ==========================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id") or payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


@app.get("/")
def root():
    return {"message": "Welcome to the AI Internship Portal API. Head over to /docs to test endpoints!"}


# ==========================================
#          USER AUTHENTICATION ROUTES
# ==========================================
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    hashed_password = pwd_context.hash(user_data.password)
    user_kwargs = {
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": getattr(user_data.role, "value", str(user_data.role))
    }
    if hasattr(models.User, "name"):
        user_kwargs["name"] = getattr(user_data, "name", "")
    if hasattr(models.User, "full_name"):
        user_kwargs["full_name"] = getattr(user_data, "name", "")
    if hasattr(models.User, "username"):
        user_kwargs["username"] = user_data.email.split("@")[0]

    new_user = models.User(**user_kwargs)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}


@app.post("/login")
def login_user(user_credentials: schemas.UserLoginSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    import bcrypt
    from passlib.exc import UnknownHashError
    try:
        is_valid = bcrypt.checkpw(user_credentials.password.encode("utf-8"), user.hashed_password.encode("utf-8"))
    except Exception:
        try:
            is_valid = pwd_context.verify(user_credentials.password, user.hashed_password)
        except (UnknownHashError, Exception):
            is_valid = (user_credentials.password == user.hashed_password)

    if not is_valid:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    user_role = getattr(user.role, "value", str(user.role))
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {"user_id": user.id, "sub": str(user.id), "role": user_role, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "role": user_role,
        "name": _get_user_display_name(user),
        "email": user.email
    }


@app.post("/token")
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_role = getattr(user.role, "value", str(user.role))
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {"user_id": user.id, "sub": str(user.id), "role": user_role, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": encoded_jwt, "token_type": "bearer"}


# ==========================================
#          USER & ONBOARDING ROUTES
# ==========================================
@app.post("/admin/onboard", status_code=status.HTTP_201_CREATED)
def onboard_user(
    data: schemas.UserOnboard,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_role = getattr(current_user.role, "value", str(current_user.role))
    if current_role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin can onboard users")

    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = pwd_context.hash(data.password)
    target_role = getattr(data.role, "value", str(data.role))

    intern_id = None
    if target_role == "intern":
        count = db.query(models.User).count()
        intern_id = f"INT-{datetime.now().year}-{count + 101:04d}"

    start_dt = datetime.strptime(data.start_date, "%Y-%m-%d") if data.start_date else None
    end_dt = datetime.strptime(data.end_date, "%Y-%m-%d") if data.end_date else None

    user_kwargs = {
        "email": data.email,
        "hashed_password": hashed_password,
        "role": target_role
    }
    optional_fields = {
        "name": data.name,
        "full_name": data.name,
        "username": data.email.split("@")[0],
        "github_repo_url": getattr(data, "github_repo_url", None),
        "college": getattr(data, "college", None),
        "domain_id": getattr(data, "domain_id", None),
        "mentor_id": getattr(data, "mentor_id", None),
        "start_date": start_dt,
        "end_date": end_dt,
        "intern_id": intern_id,
        "attendance_pct": 100,
        "progress_pct": 0
    }
    for field, val in optional_fields.items():
        if hasattr(models.User, field):
            user_kwargs[field] = val

    new_user = models.User(**user_kwargs)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User onboarded successfully", "user_id": new_user.id, "intern_id": intern_id}


@app.get("/users")
def get_users(
    role: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_role = getattr(current_user.role, "value", str(current_user.role))
    if current_role not in ["admin", "mentor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access")

    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if current_role == "mentor" and role == "intern" and hasattr(models.User, "mentor_id"):
        query = query.filter(models.User.mentor_id == current_user.id)

    return query.all()


@app.get("/profile")
def get_current_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    current_role = getattr(current_user.role, "value", str(current_user.role))
    if current_role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin can delete users")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


# ==========================================
#          CERTIFICATE GENERATION
# ==========================================
@app.get("/api/certificates/download/{cert_identifier}")
@app.get("/api/v1/certificates/download/{cert_identifier}")
@app.get("/certificates/download/{cert_identifier}")
def download_certificate_by_id(
    cert_identifier: str,
    db: Session = Depends(database.get_db)
):
    try:
        from app.services.html_certificate_service import HTMLCertificateService
    except Exception:
        from backend.app.services.html_certificate_service import HTMLCertificateService

    service = HTMLCertificateService()

    intern = None
    cert_record = None

    if cert_identifier.isdigit():
        intern = db.query(models.User).filter(models.User.id == int(cert_identifier)).first()

    if hasattr(models, "Certificate"):
        cert_query = db.query(models.Certificate).filter(models.Certificate.certificate_id == cert_identifier).first()
        if cert_query:
            cert_record = cert_query
            user_fk = getattr(cert_record, "user_id", None) or getattr(cert_record, "intern_id", None)
            if user_fk:
                intern = db.query(models.User).filter(models.User.id == user_fk).first()

    if not intern and not cert_identifier.isdigit():
        import re
        digits = re.findall(r'\d+', cert_identifier)
        if digits:
            intern = db.query(models.User).filter(models.User.id == int(digits[-1])).first()

    if intern:
        intern_name = _get_user_display_name(intern).upper()
    elif cert_record and getattr(cert_record, "intern_name", None):
        intern_name = cert_record.intern_name.upper()
    else:
        intern_name = "INTERN"
    domain_name = getattr(cert_record, "domain", "Full Stack Development")
    score = float(getattr(cert_record, "score", None) or getattr(cert_record, "final_score", 92.0))
    grade, _ = service.get_grade_info(score)
    cert_id = cert_identifier if not cert_identifier.isdigit() else f"PE-2026-FSD-{int(cert_identifier):04d}"

    start_date = getattr(intern, "start_date", "August 18, 2026")
    end_date = getattr(intern, "end_date", "September 18, 2026")
    issued_date = getattr(cert_record, "issue_date", "September 23, 2026")

    cert_data = {
        "intern_name": intern_name,
        "domain": domain_name,
        "duration": "1 Month",
        "start_date": str(start_date),
        "end_date": str(end_date),
        "issue_date": str(issued_date),
        "certificate_id": cert_id,
        "cert_id": cert_id,
        "score": score,
        "grade": grade,
    }

    pdf_bytes = service.generate_certificate_pdf(cert_data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=Certificate_{cert_id}.pdf"}
    )


@app.get("/certificate/download")
def download_certificate(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        from app.services.html_certificate_service import HTMLCertificateService
    except Exception:
        from backend.app.services.html_certificate_service import HTMLCertificateService

    service = HTMLCertificateService()
    cert_id = f"PE-2026-INT-{current_user.id:04d}"

    cert_data = {
        "intern_name": _get_user_display_name(current_user).upper(),
        "domain": "Artificial Intelligence",
        "duration": "1 Month",
        "start_date": "August 18, 2026",
        "end_date": "September 18, 2026",
        "issue_date": "September 23, 2026",
        "certificate_id": cert_id,
        "cert_id": cert_id,
        "score": 92.0,
        "grade": "A+",
    }

    pdf_bytes = service.generate_certificate_pdf(cert_data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Certificate_{cert_id}.pdf"}
    )


# ==========================================
#          BACKGROUND SCHEDULER
# ==========================================
def send_daily_reminders(time_of_day: str):
    with database.SessionLocal() as db:
        try:
            interns = db.query(models.User).filter(models.User.role == "intern").all()
            for intern in interns:
                if hasattr(models, "Notification"):
                    reminder = models.Notification(
                        user_id=intern.id,
                        title=f"{time_of_day.capitalize()} Reminder",
                        message="Please complete your tasks before the deadline.",
                        type="daily_reminder"
                    )
                    db.add(reminder)
            db.commit()
        except Exception as e:
            print(f"[Scheduler] Daily reminder error: {e}")


@app.on_event("startup")
def start_scheduler():
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(send_daily_reminders, "cron", hour=3, minute=30, args=["morning"])
        scheduler.add_job(send_daily_reminders, "cron", hour=8, minute=30, args=["afternoon"])
        scheduler.start()
    except Exception as exc:
        print(f"[Scheduler] Init bypassed: {exc}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)