import os
import sys

# Ensure backend root is always in sys.path regardless of execution CWD
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from pydantic import BaseModel
from services.email_service import dispatch_notification, EventType

from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
import io
import json
import re
import ast
import subprocess
import sys
import tempfile
from typing import Dict, Any, Optional, List
from fpdf import FPDF
from apscheduler.schedulers.background import BackgroundScheduler
import pytz

# 1. Import router modules
from routers import (
    auth, meetings, airdrops, onboarding, tasks, analytics, submissions,
    users, certificates, batch_analytics, facts, leaderboard, simulation,
    tickets, admin, mcq, mentor, questions, interactive_learning, normal_learning, health
)


import importlib.util

try:
    import models, database, schemas
except ImportError:
    from backend import models, database, schemas  # type: ignore


# Initialize FastAPI application
app = FastAPI(
    title="Online Internship Portal",
    description="Backend API for managing interns, mentors, curriculum, submissions, messaging, video meetings, and certificates.",
    version="1.0.0"
)

# Fail-safe CORS Middleware - Dynamically reflects request Origin on all responses (including 404, 500, OPTIONS)
@app.middleware("http")
async def add_cors_headers(request, call_next):
    origin = request.headers.get("origin") or "*"
    if request.method == "OPTIONS":
        from fastapi.responses import Response
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = origin
        if origin != "*":
            response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

    try:
        response = await call_next(request)
    except Exception as exc:
        from fastapi.responses import JSONResponse
        response = JSONResponse(status_code=500, content={"detail": str(exc)})

    response.headers["Access-Control-Allow-Origin"] = origin
    if origin != "*":
        response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/resumes", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("static", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Auto-migrate database schema columns if necessary
try:
    from database import engine
    from sqlalchemy import text
    if engine.dialect.name == "postgresql":
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_credential_approved BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Database migration: PostgreSQL users table columns auto-migrated successfully.")
except Exception as e:
    print("Database migration notice:", e)

# 2. Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(auth.router, prefix="", tags=["Auth"])

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(users.router, prefix="/users", tags=["Users"])

app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(submissions.router, prefix="/api/v1/submissions", tags=["Submissions"])

app.include_router(airdrops.router, tags=["Airdrops"])
app.include_router(airdrops.router, prefix="/api/v1", tags=["Airdrops"])


app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

app.include_router(onboarding.router, prefix="/api/v1/onboarding", tags=["Onboarding"])
app.include_router(onboarding.router, prefix="/api/v1", tags=["Onboarding"])
app.include_router(onboarding.router, prefix="/api", tags=["Onboarding"])
app.include_router(onboarding.router, prefix="", tags=["Onboarding"])

app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(meetings.router, prefix="/api/v1/meetings", tags=["Meetings"])
app.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])

app.include_router(certificates.router)
app.include_router(certificates.router, prefix="/api/v1")

app.include_router(tasks.router)
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api")

from routers import notifications
app.include_router(notifications.router)
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api")

app.include_router(batch_analytics.router, prefix="/api/batch-analytics", tags=["Batch Analytics"])
app.include_router(batch_analytics.router, prefix="/api/v1/batch-analytics", tags=["Batch Analytics"])

app.include_router(facts.router, prefix="/api/facts", tags=["Facts"])
app.include_router(facts.router, prefix="/api/v1/facts", tags=["Facts"])

app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard", tags=["Leaderboard"])

app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(simulation.router, prefix="/api/v1/simulation", tags=["Simulation"])

app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(tickets.router, prefix="/api/v1/tickets", tags=["Tickets"])

app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])
app.include_router(mcq.router, prefix="/api/v1", tags=["MCQ Assessment"])
app.include_router(mentor.router, prefix="/api/v1", tags=["Mentor Dashboard"])

app.include_router(questions.router, prefix="/api/v1", tags=["Questions"])
app.include_router(questions.router, prefix="/api", tags=["Questions"])

app.include_router(interactive_learning.router, prefix="/api/v1/learning/interactive", tags=["Interactive Learning"])
app.include_router(interactive_learning.router, prefix="/api/learning/interactive", tags=["Interactive Learning"])

app.include_router(normal_learning.router, prefix="/api/v1/learning/normal", tags=["Normal Learning"])
app.include_router(normal_learning.router, prefix="/api/learning/normal", tags=["Normal Learning"])
app.include_router(health.router)

# --- Security & Auth Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Hours

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Ensure DB tables exist on startup
models.Base.metadata.create_all(bind=database.engine)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub") or payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def require_role(roles: List[str]):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have sufficient permissions for this operation"
            )
        return current_user
    return role_checker


@app.get("/api/v1/airdrops", include_in_schema=False)
@app.get("/api/airdrops", include_in_schema=False)
def redirect_airdrops_alias(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return airdrops.get_airdrops(db=db, current_user=current_user)


# --- Real-Time Messaging Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)


manager = ConnectionManager()

# --- Background Scheduler Setup ---
from services.scheduler_service import start_scheduler
scheduler = start_scheduler()


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
@app.post("/api/v1/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower() if user_in.email else ""
    if not clean_email:
        raise HTTPException(status_code=400, detail="Valid email address is required")
        
    existing = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role_val = user_in.role.value if hasattr(user_in.role, 'value') else user_in.role
    hashed_password = pwd_context.hash(user_in.password)
    user = models.User(
        email=clean_email,
        name=user_in.name.strip(),
        hashed_password=hashed_password,
        role=models.UserRole(role_val)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        dispatch_notification(
            recipient_email=user.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Welcome to ProEduvate - Account Created Successfully",
            message=f"Hello {user.name}! Your account has been registered successfully on ProEduvate Portal. Your login email is: {user.email}.",
            action_url=f"{FRONTEND_URL}/login",
            sender_name="ProEduvate System"
        )
    except Exception as e:
        print(f"[Email Exception] Failed to send registration email: {e}")

    return user


from sqlalchemy import func

@app.post("/api/auth/login")
@app.post("/api/v1/auth/login")
@app.post("/api/login")
def login(login_in: schemas.UserLoginSchema, db: Session = Depends(get_db)):
    clean_email = login_in.email.strip().lower() if login_in.email else ""
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    is_valid = False
    if user.hashed_password == login_in.password:
        is_valid = True
    else:
        try:
            is_valid = pwd_context.verify(login_in.password, user.hashed_password)
        except Exception:
            is_valid = (user.hashed_password == login_in.password)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token = create_access_token({"sub": str(user.id), "role": user_role_str})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user_role_str,
        "user": schemas.UserResponse.from_orm(user)
    }


@app.get("/api/auth/me", response_model=schemas.UserResponse)
@app.get("/api/v1/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# Tasks, submissions, and code execution are handled via tasks.router mounted above


# ==========================================
# ==========================================
# CERTIFICATE GENERATION (DELEGATED TO CERTIFICATES ROUTER)
# ==========================================

@app.get('/api/certificates/download/{intern_id}')
@app.get('/api/v1/certificates/download/{intern_id}')
def generate_certificate(
    intern_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return certificates.download_certificate_by_id(
        cert_identifier=str(intern_id),
        db=db,
        current_user=current_user
    )


# ==========================================
# REAL-TIME MESSAGING & WEBSOCKETS
# ==========================================

@app.websocket('/ws/chat/{user_id}')
async def websocket_chat_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            recipient_id = data.get('recipient_id')
            message_text = data.get('message')

            if recipient_id and message_text:
                db_message = models.Message(
                    sender_id=user_id,
                    receiver_id=recipient_id,
                    content=message_text,
                    sent_at=datetime.utcnow()
                )
                db.add(db_message)
                db.commit()

                payload = json.dumps({
                    'sender_id': user_id,
                    'content': message_text,
                    'timestamp': db_message.sent_at.isoformat()
                })
                await manager.send_personal_message(payload, recipient_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)


# ==========================================
# INTERN STATS & NOTIFICATIONS
# ==========================================

@app.get('/api/intern/stats')
def get_intern_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_role = getattr(current_user.role, 'value', str(current_user.role)).lower()
    if user_role != 'intern':
        return {'error': 'Not an intern'}
    
    total_days = 30
    submissions_count = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id
    ).count()
    progress_percent = int((submissions_count / total_days) * 100) if total_days > 0 else 0
    
    attendance_records = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.intern_id == current_user.id
    ).all()
    
    days_present = sum(1 for a in attendance_records if a.status == 'present')
    days_absent = sum(1 for a in attendance_records if a.status == 'absent')
    total_attendance = days_present + days_absent
    attendance_percent = int((days_present / total_attendance) * 100) if total_attendance > 0 else 0
    
    from sqlalchemy.sql import func
    avg_ai_score = db.query(func.avg(models.Submission.ai_score)).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.ai_score > 0
    ).scalar()
    
    ai_score = int(avg_ai_score) if avg_ai_score else 0
    
    return {
        'currentDay': submissions_count + 1,
        'progressPercent': progress_percent,
        'daysCompleted': submissions_count,
        'totalDays': total_days,
        'attendancePercent': attendance_percent,
        'daysPresent': days_present,
        'daysAbsent': days_absent,
        'aiScore': ai_score
    }


class NotificationTrigger(BaseModel):
    recipient_email: str
    event_type: str
    title: str
    message: str
    action_url: str


@app.post('/api/notifications/trigger')
def trigger_notification(data: NotificationTrigger, bg_tasks: BackgroundTasks):
    try:
        e_type = EventType(data.event_type)
    except ValueError:
        e_type = EventType.SYSTEM_ALERT

    bg_tasks.add_task(
        dispatch_notification,
        recipient_email=data.recipient_email,
        event_type=e_type,
        title=data.title,
        message=data.message,
        action_url=data.action_url
    )
    return {'status': 'dispatched'}


# Health check is served via health.router mounted above
health_check = health.health_check


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
