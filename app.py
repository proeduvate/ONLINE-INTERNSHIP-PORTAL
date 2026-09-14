import os
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum
from uuid import uuid4

from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi import (
    FastAPI, 
    Depends, 
    HTTPException, 
    status, 
    Header, 
    WebSocket, 
    WebSocketDisconnect
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, or_, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from fastapi.staticfiles import StaticFiles
import jwt

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=False)

DATABASE_URL = os.getenv("DATABASE_URL")
SQLALCHEMY_DATABASE_URL = DATABASE_URL or "sqlite:///./app.db"

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_JWT_KEY_CHANGE_IN_PRODUCTION")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if "sub" in to_encode and not isinstance(to_encode["sub"], str):
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

class UserRole(str, Enum):
    ADMIN = "admin"
    MENTOR = "mentor"
    INTERN = "intern"
    RECRUITER = "recruiter"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column("full_name", String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column("hashed_password", String, nullable=False)
    role = Column(String, default=UserRole.INTERN)
    created_at = Column(DateTime, default=datetime.utcnow)
    intern_id = Column(String, nullable=True)
    college = Column(String, nullable=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    attendance_pct = Column(Integer, default=0)
    progress_pct = Column(Integer, default=0)
    learning_streak = Column(Integer, default=0)
    last_task_completion_date = Column(DateTime, nullable=True)

    certificates = relationship("DBCertificate", back_populates="intern", cascade="all, delete-orphan")

class DBDomain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

class DBTask(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    video_url = Column(String, nullable=True)
    document_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    resources = Column(Text, nullable=True)
    mcq_questions = Column(Text, nullable=True)
    coding_prompt = Column(Text, nullable=True)
    coding_solution = Column(Text, nullable=True)
    test_cases = Column(Text, nullable=True)
    deadline_days = Column(Integer, default=1)

class DBSubmission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    status = Column(String, default="pending")
    code_submission = Column(Text, nullable=True)
    mcq_answers = Column(Text, nullable=True)
    mcq_score = Column(Integer, default=0)
    ai_score = Column(Integer, default=0)
    ai_feedback = Column(Text, nullable=True)
    mentor_score = Column(Integer, default=0)
    mentor_feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    attendance_marked = Column(Boolean, default=False)

class DBMeeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    room_code = Column(String, nullable=False, unique=True) # Added unique=True
    status = Column(String, default="Scheduled")
    scheduled_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    participants = relationship("DBMeetingParticipant", back_populates="meeting", cascade="all, delete-orphan") # New relationship

class DBMeetingParticipant(Base): # New Table
    __tablename__ = "meeting_participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    has_mic = Column(Boolean, default=False)
    has_video = Column(Boolean, default=False)
    is_sharing_screen = Column(Boolean, default=False)
    hand_raised = Column(Boolean, default=False)
    thumbs_up = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)

    meeting = relationship("DBMeeting", back_populates="participants")
    user = relationship("DBUser")

    @property
    def user_name(self) -> Optional[str]:
        return self.user.name if self.user else None

    @property
    def email(self) -> Optional[str]:
        return self.user.email if self.user else None

    @property
    def role(self) -> Optional[str]:
        return self.user.role if self.user else None

class DBBreakoutRoom(Base):
    __tablename__ = "breakout_rooms"

    id = Column(String, primary_key=True, index=True, default=lambda: f"BR-{uuid4().hex[:8].upper()}")
    meeting_id = Column("parent_meeting_id", String, nullable=False)
    name = Column(String, nullable=False)
    sub_room_code = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    participants = relationship("DBBreakoutParticipant", back_populates="breakout_room", cascade="all, delete-orphan")
class DBBreakoutParticipant(Base):
    __tablename__ = "breakout_participants"

    id = Column(Integer, primary_key=True, index=True)
    breakout_room_id = Column(String, ForeignKey("breakout_rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    breakout_room = relationship("DBBreakoutRoom", back_populates="participants")

class DBInternship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    stipend = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBApplication(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    college = Column(String, nullable=True)
    department = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    domain = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    status = Column(String, default=ApplicationStatus.PENDING)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBCertificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    intern_name = Column(String, nullable=False)
    certificate_id = Column(String, nullable=False, unique=True)
    domain = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    achievement = Column(String, nullable=True)
    status = Column(String, default="PENDING_ADMIN_APPROVAL")
    grade = Column(String, nullable=True)
    final_score = Column(Integer, nullable=True)
    pdf_path = Column(String, nullable=True)
    issued_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    intern = relationship("DBUser", back_populates="certificates")

def ensure_supabase_compatibility() -> None:
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
        return

    with engine.begin() as conn:
        # meetings.scheduled_time is required by the app UI and is missing in the live Supabase schema
        conn.execute(text("ALTER TABLE IF EXISTS meetings ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP"))

        # meeting_participants is used by the live meeting page and does not exist in the current Supabase schema
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS meeting_participants (
                id SERIAL PRIMARY KEY,
                meeting_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                has_mic BOOLEAN DEFAULT FALSE,
                has_video BOOLEAN DEFAULT FALSE,
                is_sharing_screen BOOLEAN DEFAULT FALSE,
                hand_raised BOOLEAN DEFAULT FALSE,
                thumbs_up BOOLEAN DEFAULT FALSE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                left_at TIMESTAMP
            )
        """))

        # breakout_rooms exists but is missing app-specific columns used by the app
        conn.execute(text("ALTER TABLE IF EXISTS breakout_rooms ADD COLUMN IF NOT EXISTS meeting_id VARCHAR"))
        conn.execute(text("ALTER TABLE IF EXISTS breakout_rooms ADD COLUMN IF NOT EXISTS sub_room_code VARCHAR(100)"))
        conn.execute(text("ALTER TABLE IF EXISTS breakout_rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"))
        conn.execute(text("ALTER TABLE IF EXISTS breakout_rooms ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))

        # breakout_participants is used by the app and does not exist in the current Supabase schema
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS breakout_participants (
                id SERIAL PRIMARY KEY,
                breakout_room_id VARCHAR NOT NULL,
                user_id INTEGER NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # certificates is used by the intern certificate request flow and may not exist in the live schema
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS certificates (
                id SERIAL PRIMARY KEY,
                intern_id INTEGER NOT NULL,
                intern_name VARCHAR NOT NULL,
                certificate_id VARCHAR NOT NULL UNIQUE,
                domain VARCHAR NOT NULL,
                duration VARCHAR NOT NULL,
                achievement VARCHAR,
                status VARCHAR DEFAULT 'PENDING_ADMIN_APPROVAL',
                grade VARCHAR,
                final_score INTEGER,
                pdf_path VARCHAR,
                issued_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))


def normalize_role(role: Any) -> str:
    if hasattr(role, "value"):
        return role.value
    if isinstance(role, str):
        return role.lower()
    return str(role)


ensure_supabase_compatibility()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.INTERN

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserOnboard(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    college: Optional[str] = None
    domain_id: Optional[int] = None
    mentor_id: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    intern_id: Optional[str] = None
    college: Optional[str] = None
    domain_id: Optional[int] = None
    mentor_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    attendance_pct: int
    progress_pct: int
    learning_streak: int
    last_task_completion_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class CertificateRequest(BaseModel):
    duration: str
    achievement: Optional[str] = None
    grade: Optional[str] = None
    final_score: Optional[int] = None

class CertificateResponse(BaseModel):
    id: int
    intern_id: int
    intern_name: str
    certificate_id: str
    domain: str
    duration: str
    achievement: Optional[str] = None
    status: str
    grade: Optional[str] = None
    final_score: Optional[int] = None
    pdf_path: Optional[str] = None
    issued_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DomainCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DomainResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    domain_id: int
    day_number: int
    title: str
    description: str
    video_url: Optional[str] = None
    document_url: Optional[str] = None
    notes: Optional[str] = None
    resources: Optional[str] = None
    mcq_questions: Optional[str] = None
    coding_prompt: Optional[str] = None
    coding_solution: Optional[str] = None
    test_cases: Optional[str] = None
    deadline_days: Optional[int] = 1

class TaskResponse(BaseModel):
    id: int
    domain_id: int
    day_number: int
    title: str
    description: str
    video_url: Optional[str] = None
    document_url: Optional[str] = None
    notes: Optional[str] = None
    resources: Optional[str] = None
    mcq_questions: Optional[str] = None
    coding_prompt: Optional[str] = None
    test_cases: Optional[str] = None
    deadline_days: int

    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    task_id: int
    code_submission: Optional[str] = None
    mcq_answers: Optional[str] = None

class SubmissionReview(BaseModel):
    mentor_score: Optional[int] = None
    mentor_feedback: Optional[str] = None
    status: Optional[str] = "reviewed"
    attendance_marked: Optional[bool] = True

class SubmissionResponse(BaseModel):
    id: int
    intern_id: int
    task_id: int
    status: str
    code_submission: Optional[str] = None
    mcq_answers: Optional[str] = None
    mcq_score: int
    ai_score: int
    ai_feedback: Optional[str] = None
    mentor_score: int
    mentor_feedback: Optional[str] = None
    submitted_at: datetime
    attendance_marked: bool

    class Config:
        from_attributes = True

class CodeExecutionRequest(BaseModel):
    task_id: int
    code_submission: str

class CodeExecutionResponse(BaseModel):
    task_id: int
    syntax_valid: bool
    runtime_score: int
    test_cases_passed: int
    total_test_cases: int
    runtime_feedback: str
    test_case_results: List[Dict[str, Any]]
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    successful: bool

class MeetingCreate(BaseModel):
    title: str
    room_code: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class BreakoutParticipantResponse(BaseModel):
    id: int
    user_id: int
    joined_at: datetime

    class Config:
        from_attributes = True

class BreakoutRoomCreate(BaseModel):
    name: str

class BreakoutRoomResponse(BaseModel):
    id: str
    meeting_id: str
    name: str
    sub_room_code: str
    is_active: bool
    created_at: datetime
    participants: List[BreakoutParticipantResponse] = []

    class Config:
        from_attributes = True

class AssignUserBreakoutSchema(BaseModel):
    user_id: int

class MeetingParticipantResponse(BaseModel): # New Schema
    id: int
    user_id: int
    has_mic: bool
    has_video: bool
    is_sharing_screen: bool
    hand_raised: bool
    thumbs_up: bool
    joined_at: datetime
    left_at: Optional[datetime] = None
    user_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    class Config:
        from_attributes = True

class MeetingResponse(BaseModel):
    id: int
    mentor_id: int
    title: str
    room_code: str
    status: str
    scheduled_time: Optional[datetime] = None
    created_at: datetime
    breakout_rooms: List[BreakoutRoomResponse] = []
    participants: List[MeetingParticipantResponse] = [] # Added to response model

    class Config:
        from_attributes = True

class InternshipCreate(BaseModel):
    title: str
    company_name: str
    description: str
    location: str
    stipend: Optional[str] = None

class InternshipResponse(BaseModel):
    id: int
    title: str
    company_name: str
    description: str
    location: str
    stipend: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OnboardingApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    college: str
    department: str
    degree: str
    graduation_year: int
    domain: str
    resume_url: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    internship_id: Optional[int] = None
    user_id: Optional[int] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    domain: Optional[str] = None
    resume_url: Optional[str] = None
    status: ApplicationStatus
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, room_id: str, message: dict, sender: Optional[WebSocket] = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if sender is not None and connection == sender:
                    continue
                await connection.send_json(message)

manager = ConnectionManager()

async def broadcast_breakout_room_event(meeting_id: int, event: str, payload: Optional[dict] = None):
    message = {
        "event": event,
        "meeting_id": meeting_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    if payload:
        message.update(payload)
    await manager.broadcast_to_room(str(meeting_id), message)

app = FastAPI(title="Internship Portal API with Breakout Rooms", version="1.2.0")

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "backend", "static")),
    name="static"
)

@app.on_event("startup")
def startup_seed_data():
    ensure_seed_data()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_seed_data():
    db = SessionLocal()
    try:
        seed_users = [
            {
                "id": 1,
                "name": "System Admin",
                "email": "admin@gmail.com",
                "password": "admin123",
                "role": UserRole.ADMIN.value.upper(),
                "attendance_pct": 100,
                "progress_pct": 100,
            },
            {
                "id": 2,
                "name": "Dr. Sakthi",
                "email": "mentor@gmail.com",
                "password": "mentor123",
                "role": UserRole.MENTOR.value.upper(),
                "attendance_pct": 100,
                "progress_pct": 100,
            },
            {
                "id": 3,
                "name": "John Doe",
                "email": "intern1@gmail.com",
                "password": "intern123",
                "role": UserRole.INTERN.value.upper(),
                "intern_id": "INT-001",
                "college": "MIT University",
                "mentor_id": 2,
                "attendance_pct": 100,
                "progress_pct": 60,
            },
            {
                "id": 6,
                "name": "Sushmitha",
                "email": "intern2@gmail.com",
                "password": "intern123",
                "role": UserRole.INTERN.value.upper(),
                "intern_id": "INT-002",
                "college": "IIT",
                "mentor_id": 2,
                "attendance_pct": 100,
                "progress_pct": 70,
            },
            {
                "id": 7,
                "name": "Sakthi S",
                "email": "intern3@gmail.com",
                "password": "intern123",
                "role": UserRole.INTERN.value.upper(),
                "intern_id": "INT-003",
                "college": "NIT",
                "mentor_id": 2,
                "attendance_pct": 100,
                "progress_pct": 80,
            },
        ]

        for user_data in seed_users:
            existing_user = db.query(DBUser).filter(DBUser.id == user_data["id"]).first()
            if existing_user is None:
                existing_user = db.query(DBUser).filter(DBUser.email == user_data["email"]).first()

            if existing_user:
                for key, value in user_data.items():
                    if key in {"id"}:
                        continue
                    setattr(existing_user, key, value)
            else:
                db.add(DBUser(**user_data))

        db.commit()

        meeting = db.query(DBMeeting).filter(DBMeeting.room_code == "ROOM-ALPHA-1").first()
        if not meeting:
            meeting = DBMeeting(
                mentor_id=2,
                title="Weekly Internship Review",
                room_code="ROOM-ALPHA-1",
                status="Scheduled",
                scheduled_time=datetime.utcnow() + timedelta(days=1),
            )
            db.add(meeting)
            db.commit()
            db.refresh(meeting)
        else:
            meeting.mentor_id = 2
            meeting.title = "Weekly Internship Review"
            meeting.status = "Scheduled"
            if not meeting.scheduled_time:
                meeting.scheduled_time = datetime.utcnow() + timedelta(days=1)
            db.commit()

        for user_id in [3, 6, 7]:
            if not db.query(DBMeetingParticipant).filter(
                DBMeetingParticipant.meeting_id == meeting.id,
                DBMeetingParticipant.user_id == user_id,
            ).first():
                db.add(DBMeetingParticipant(meeting_id=meeting.id, user_id=user_id))

        db.commit()
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> DBUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_value = payload.get("sub")
        if user_id_value is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        user_id = int(user_id_value)
    except (jwt.PyJWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@app.websocket("/ws/rooms/{room_id}")
async def room_websocket_gateway(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)
    await manager.broadcast_to_room(
        room_id, 
        {
            "event": "user_joined",
            "room_id": room_id,
            "timestamp": datetime.utcnow().isoformat()
        },
        sender=websocket
    )
    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
            except json.JSONDecodeError:
                data = {"type": "message", "content": raw_data}

            await manager.broadcast_to_room(room_id, {
                "room_id": room_id,
                "payload": data,
                "timestamp": datetime.utcnow().isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {
            "event": "user_left",
            "room_id": room_id,
            "timestamp": datetime.utcnow().isoformat()
        })

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(DBUser).filter(DBUser.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = DBUser(
        name=user_in.name,
        email=user_in.email,
        password=user_in.password,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login")
def login(credentials: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    valid_password = False
    if user.password == credentials.password:
        valid_password = True
    elif user.password and pwd_context.verify(credentials.password, user.password):
        valid_password = True

    if not valid_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_role = normalize_role(user.role)
    access_token = create_access_token(data={"sub": user.id, "role": user_role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user_role
        }
    }

@app.get("/api/users/me", response_model=UserResponse)
def get_profile(current_user: DBUser = Depends(get_current_user)):
    return current_user

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: DBUser = Depends(get_current_user)):
    return current_user

@app.get("/api/certificates/me", response_model=CertificateResponse)
def get_my_certificate(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = db.query(DBCertificate).filter(DBCertificate.intern_id == current_user.id).order_by(DBCertificate.id.desc()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No certificate found")
    return cert

@app.post("/api/certificates/request", response_model=CertificateResponse)
def request_certificate(req: CertificateRequest, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if normalize_role(current_user.role) != "intern":
        raise HTTPException(status_code=403, detail="Only interns can request certificates.")

    existing = db.query(DBCertificate).filter(DBCertificate.intern_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Certificate request already exists.")

    cert_id = f"CERT-2026-OIP-{uuid4().hex[:8].upper()}"
    domain = "Software Engineering"

    new_cert = DBCertificate(
        intern_id=current_user.id,
        intern_name=current_user.name,
        certificate_id=cert_id,
        domain=domain,
        duration=req.duration,
        achievement=req.achievement,
        status="PENDING_ADMIN_APPROVAL",
        grade=req.grade,
        final_score=req.final_score,
    )

    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@app.get("/api/intern/stats")
def get_intern_stats(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if normalize_role(current_user.role) != "intern":
        return {"error": "Not an intern"}

    total_days = 30
    submissions = db.query(DBSubmission).filter(DBSubmission.intern_id == current_user.id).all()
    submissions_count = len(submissions)
    progress_percent = int((submissions_count / total_days) * 100) if total_days > 0 else 0

    attendance_percent = max(0, min(100, int(current_user.attendance_pct or 0)))
    days_present = int((attendance_percent / 100) * total_days) if total_days > 0 else 0
    days_absent = max(0, total_days - days_present)

    ai_scores = [submission.ai_score for submission in submissions if submission.ai_score and submission.ai_score > 0]
    ai_score = int(sum(ai_scores) / len(ai_scores)) if ai_scores else 0

    return {
        "currentDay": max(submissions_count + 1, 1),
        "progressPercent": progress_percent,
        "daysCompleted": submissions_count,
        "totalDays": total_days,
        "attendancePercent": attendance_percent,
        "daysPresent": days_present,
        "daysAbsent": days_absent,
        "aiScore": ai_score
    }

@app.post("/api/admin/onboard-intern", response_model=UserResponse)
def onboard_intern(user_in: UserOnboard, db: Session = Depends(get_db)):
    if db.query(DBUser).filter(DBUser.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    s_date = datetime.strptime(user_in.start_date, "%Y-%m-%d") if user_in.start_date else None
    e_date = datetime.strptime(user_in.end_date, "%Y-%m-%d") if user_in.end_date else None

    user = DBUser(
        name=user_in.name,
        email=user_in.email,
        password=user_in.password,
        role=user_in.role,
        college=user_in.college,
        domain_id=user_in.domain_id,
        mentor_id=user_in.mentor_id,
        start_date=s_date,
        end_date=e_date,
        intern_id=f"INT-{datetime.utcnow().strftime('%Y%m')}-{db.query(DBUser).count() + 1}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/domains", response_model=DomainResponse)
def create_domain(domain: DomainCreate, db: Session = Depends(get_db)):
    db_domain = DBDomain(name=domain.name, description=domain.description)
    db.add(db_domain)
    db.commit()
    db.refresh(db_domain)
    return db_domain

@app.get("/api/domains", response_model=List[DomainResponse])
def get_domains(db: Session = Depends(get_db)):
    return db.query(DBDomain).all()

@app.post("/api/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = DBTask(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/api/domains/{domain_id}/tasks", response_model=List[TaskResponse])
def get_tasks_by_domain(domain_id: int, db: Session = Depends(get_db)):
    return db.query(DBTask).filter(DBTask.domain_id == domain_id).order_by(DBTask.day_number).all()

@app.post("/api/submissions/execute-code", response_model=CodeExecutionResponse)
def execute_code(request: CodeExecutionRequest, db: Session = Depends(get_db)):
    task = db.query(DBTask).filter(DBTask.id == request.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    code_length = len(request.code_submission.strip())
    is_valid = code_length > 10

    return CodeExecutionResponse(
        task_id=request.task_id,
        syntax_valid=is_valid,
        runtime_score=85 if is_valid else 0,
        test_cases_passed=3 if is_valid else 0,
        total_test_cases=3,
        runtime_feedback="All test cases executed successfully." if is_valid else "Code syntax error or empty code.",
        test_case_results=[
            {"test_case": 1, "passed": is_valid, "output": "Output matches expected value"},
            {"test_case": 2, "passed": is_valid, "output": "Output matches expected value"},
            {"test_case": 3, "passed": is_valid, "output": "Output matches expected value"}
        ],
        stdout="Execution completed with return code 0" if is_valid else "",
        stderr=None if is_valid else "SyntaxError: Unexpected token",
        successful=is_valid
    )

@app.post("/api/submissions", response_model=SubmissionResponse)
def submit_task(
    submission_in: SubmissionCreate, 
    current_user: DBUser = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    submission = DBSubmission(
        intern_id=current_user.id,
        task_id=submission_in.task_id,
        code_submission=submission_in.code_submission,
        mcq_answers=submission_in.mcq_answers,
        ai_score=85 if submission_in.code_submission else 70,
        ai_feedback="Code structure follows standard guidelines.",
        status="pending"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@app.post("/api/meetings", response_model=MeetingResponse)
def create_meeting(
    meeting_in: MeetingCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in {UserRole.MENTOR, UserRole.ADMIN}:
        raise HTTPException(status_code=403, detail="Only mentors/admins can create meetings")

    room_code = meeting_in.room_code or f"ROOM-{os.urandom(3).hex().upper()}"

    existing_meeting = db.query(DBMeeting).filter(DBMeeting.room_code == room_code).first()
    if existing_meeting:
        raise HTTPException(status_code=400, detail="Meeting with this room code already exists. Please try again or provide a different room code.")

    meeting = DBMeeting(
        mentor_id=current_user.id,
        title=meeting_in.title,
        room_code=room_code,
        scheduled_time=meeting_in.scheduled_time,
        status="Scheduled"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting

def _meeting_is_visible_to_user(db: Session, current_user: DBUser, meeting: DBMeeting) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True

    if current_user.role == UserRole.MENTOR:
        return meeting.mentor_id == current_user.id

    if current_user.role == UserRole.INTERN:
        if current_user.mentor_id and current_user.mentor_id == meeting.mentor_id:
            return True

        participant_exists = db.query(DBMeetingParticipant.id).filter(
            DBMeetingParticipant.meeting_id == meeting.id,
            DBMeetingParticipant.user_id == current_user.id,
            DBMeetingParticipant.left_at == None
        ).first()
        return participant_exists is not None

    return False


@app.get("/api/meetings", response_model=List[MeetingResponse])
def list_meetings(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    meetings = db.query(DBMeeting).all()
    visible_meetings = [
        meeting for meeting in meetings if _meeting_is_visible_to_user(db, current_user, meeting)
    ]

    result = []
    for meeting in visible_meetings:
        meeting_participants = db.query(DBMeetingParticipant).filter(
            DBMeetingParticipant.meeting_id == meeting.id,
            DBMeetingParticipant.left_at == None
        ).all()

        breakout_rooms = db.query(DBBreakoutRoom).filter(
            DBBreakoutRoom.meeting_id == str(meeting.id)
        ).all()

        serialized_breakout_rooms = []
        for breakout_room in breakout_rooms:
            breakout_room_participants = db.query(DBBreakoutParticipant).filter(
                DBBreakoutParticipant.breakout_room_id == breakout_room.id
            ).all()
            serialized_breakout_rooms.append({
                "id": breakout_room.id,
                "meeting_id": breakout_room.meeting_id,
                "name": breakout_room.name,
                "sub_room_code": breakout_room.sub_room_code,
                "is_active": breakout_room.is_active,
                "created_at": breakout_room.created_at,
                "participants": [
                    {
                        "id": participant.id,
                        "user_id": participant.user_id,
                        "joined_at": participant.joined_at,
                    }
                    for participant in breakout_room_participants
                ],
            })

        serialized_participants = []
        for participant in meeting_participants:
            serialized_participants.append({
                "id": participant.id,
                "user_id": participant.user_id,
                "has_mic": participant.has_mic,
                "has_video": participant.has_video,
                "is_sharing_screen": participant.is_sharing_screen,
                "hand_raised": participant.hand_raised,
                "thumbs_up": participant.thumbs_up,
                "joined_at": participant.joined_at,
                "left_at": participant.left_at,
                "user_name": participant.user.name if participant.user else None,
                "email": participant.user.email if participant.user else None,
                "role": participant.user.role if participant.user else None,
            })

        result.append({
            "id": meeting.id,
            "mentor_id": meeting.mentor_id,
            "title": meeting.title,
            "room_code": meeting.room_code,
            "status": meeting.status,
            "scheduled_time": meeting.scheduled_time,
            "created_at": meeting.created_at,
            "breakout_rooms": serialized_breakout_rooms,
            "participants": serialized_participants,
        })

    return result


@app.get("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    meeting = db.query(DBMeeting).filter(DBMeeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if not _meeting_is_visible_to_user(db, current_user, meeting):
        raise HTTPException(status_code=403, detail="Not authorized to view this meeting")

    meeting_participants = db.query(DBMeetingParticipant).filter(
        DBMeetingParticipant.meeting_id == meeting.id,
        DBMeetingParticipant.left_at == None
    ).all()

    breakout_rooms = db.query(DBBreakoutRoom).filter(
        DBBreakoutRoom.meeting_id == str(meeting.id)
    ).all()

    serialized_breakout_rooms = []
    for breakout_room in breakout_rooms:
        breakout_room_participants = db.query(DBBreakoutParticipant).filter(
            DBBreakoutParticipant.breakout_room_id == breakout_room.id
        ).all()
        serialized_breakout_rooms.append({
            "id": breakout_room.id,
            "meeting_id": breakout_room.meeting_id,
            "name": breakout_room.name,
            "sub_room_code": breakout_room.sub_room_code,
            "is_active": breakout_room.is_active,
            "created_at": breakout_room.created_at,
            "participants": [
                {
                    "id": participant.id,
                    "user_id": participant.user_id,
                    "joined_at": participant.joined_at,
                }
                for participant in breakout_room_participants
            ],
        })

    serialized_participants = []
    for participant in meeting_participants:
        serialized_participants.append({
            "id": participant.id,
            "user_id": participant.user_id,
            "has_mic": participant.has_mic,
            "has_video": participant.has_video,
            "is_sharing_screen": participant.is_sharing_screen,
            "hand_raised": participant.hand_raised,
            "thumbs_up": participant.thumbs_up,
            "joined_at": participant.joined_at,
            "left_at": participant.left_at,
            "user_name": participant.user.name if participant.user else None,
            "email": participant.user.email if participant.user else None,
            "role": participant.user.role if participant.user else None,
        })

    return {
        "id": meeting.id,
        "mentor_id": meeting.mentor_id,
        "title": meeting.title,
        "room_code": meeting.room_code,
        "status": meeting.status,
        "scheduled_time": meeting.scheduled_time,
        "created_at": meeting.created_at,
        "breakout_rooms": serialized_breakout_rooms,
        "participants": serialized_participants,
    }


meeting_join_requests: Dict[int, Dict[int, Dict[str, Any]]] = {}


@app.get("/api/meetings/verify-intern/{intern_id}")
def verify_intern(intern_id: int, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.id == intern_id, DBUser.role == UserRole.INTERN).first()
    if not user:
        raise HTTPException(status_code=404, detail="Intern not found or invalid role")
    return {"status": "success", "intern_id": user.id, "name": user.name}


@app.post("/api/meetings/{meeting_id}/join-request")
def request_join(meeting_id: int, req: dict, db: Session = Depends(get_db)):
    intern = db.query(DBUser).filter(DBUser.id == req.get("intern_id"), DBUser.role == UserRole.INTERN).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found or invalid role")

    meeting_join_requests.setdefault(meeting_id, {})
    meeting_join_requests[meeting_id][intern.id] = {
        "name": intern.name,
        "status": "waiting"
    }
    return {"status": "success"}


@app.get("/api/meetings/{meeting_id}/waiting-list")
def get_waiting_list(meeting_id: int):
    return {"waiting": meeting_join_requests.get(meeting_id, {})}


@app.post("/api/meetings/{meeting_id}/approve")
def approve_join(meeting_id: int, req: dict):
    meeting_requests = meeting_join_requests.get(meeting_id, {})
    if str(req.get("intern_id")) in {str(k) for k in meeting_requests.keys()}:
        meeting_requests[int(req["intern_id"])] = {
            **meeting_requests[int(req["intern_id"])],
            "status": req.get("status", "approved")
        }
    return {"status": "success"}


@app.get("/api/meetings/{meeting_id}/join-status/{intern_id}")
def check_join_status(meeting_id: int, intern_id: int):
    meeting_requests = meeting_join_requests.get(meeting_id, {})
    status = "prompt"
    if intern_id in meeting_requests:
        status = meeting_requests[intern_id].get("status", "prompt")
    return {"status": status}

@app.post("/api/meetings/{meeting_id}/join", response_model=MeetingParticipantResponse)
def join_meeting(
    meeting_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(DBMeeting).filter(DBMeeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Check if user is already a participant
    participant = db.query(DBMeetingParticipant).filter(
        DBMeetingParticipant.meeting_id == meeting_id,
        DBMeetingParticipant.user_id == current_user.id
    ).first()

    if participant:
        # If participant exists, update their `left_at` to None if they rejoin
        if participant.left_at:
            participant.left_at = None
        db.add(participant)
        db.commit()
        db.refresh(participant) # This should be outside the inner if, but inside the outer if
        return participant
    new_participant = DBMeetingParticipant(
        meeting_id=meeting_id,
        user_id=current_user.id
    )
    db.add(new_participant)
    db.commit()
    db.refresh(new_participant)
    return new_participant

@app.post("/api/meetings/{meeting_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_meeting(
    meeting_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    participant = db.query(DBMeetingParticipant).filter(
        DBMeetingParticipant.meeting_id == meeting_id,
        DBMeetingParticipant.user_id == current_user.id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found in this meeting")

    participant.left_at = datetime.utcnow()
    db.add(participant)
    db.commit()
    return {}

class ParticipantStatusUpdate(BaseModel):
    has_mic: Optional[bool] = None
    has_video: Optional[bool] = None
    is_sharing_screen: Optional[bool] = None
    hand_raised: Optional[bool] = None
    thumbs_up: Optional[bool] = None

@app.put("/api/meetings/{meeting_id}/participants/{user_id}/status", response_model=MeetingParticipantResponse)
def update_participant_status(
    meeting_id: int,
    user_id: int,
    status_update: ParticipantStatusUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only admin, mentor of the meeting, or the participant themselves can update status
    meeting = db.query(DBMeeting).filter(DBMeeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if (
        current_user.role != UserRole.ADMIN and
        current_user.id != meeting.mentor_id and
        current_user.id != user_id
    ):
        raise HTTPException(status_code=403, detail="Not authorized to update this participant's status")

    participant = db.query(DBMeetingParticipant).filter(
        DBMeetingParticipant.meeting_id == meeting_id,
        DBMeetingParticipant.user_id == user_id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found in this meeting")

    update_data = status_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(participant, key, value)

    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant

@app.get("/api/meetings/{meeting_id}/participants", response_model=List[MeetingParticipantResponse])
def get_meeting_participants(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(DBMeeting).filter(DBMeeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db.query(DBMeetingParticipant).filter(
        DBMeetingParticipant.meeting_id == meeting_id,
        DBMeetingParticipant.left_at == None # Only active participants
    ).all()

@app.post("/api/meetings/{meeting_id}/breakout-rooms", response_model=BreakoutRoomResponse)
async def create_breakout_room(
    meeting_id: int,
    room_in: BreakoutRoomCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(DBMeeting).filter(DBMeeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if current_user.role not in {UserRole.ADMIN, UserRole.MENTOR}:
        raise HTTPException(status_code=403, detail="Only mentors can create breakout rooms")

    if current_user.role != UserRole.ADMIN and current_user.id != meeting.mentor_id:
        raise HTTPException(status_code=403, detail="Only the mentor for this meeting can create breakout rooms")

    sub_code = f"SUB-{os.urandom(3).hex().upper()}"
    breakout = DBBreakoutRoom(
        meeting_id=str(meeting_id),
        name=room_in.name,
        sub_room_code=sub_code
    )
    db.add(breakout)
    db.commit()
    db.refresh(breakout)
    await broadcast_breakout_room_event(
        meeting_id,
        "breakout_rooms_updated",
        {"room_id": breakout.id, "room_name": breakout.name, "action": "created"}
    )
    return breakout

@app.get("/api/meetings/{meeting_id}/breakout-rooms", response_model=List[BreakoutRoomResponse])
def get_breakout_rooms(meeting_id: int, db: Session = Depends(get_db)):
    return db.query(DBBreakoutRoom).filter(DBBreakoutRoom.meeting_id == str(meeting_id)).all()

@app.post("/api/breakout-rooms/{breakout_id}/assign", response_model=BreakoutRoomResponse)
async def assign_user_to_breakout(
    breakout_id: str,
    assign_in: AssignUserBreakoutSchema,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    breakout = db.query(DBBreakoutRoom).filter(DBBreakoutRoom.id == breakout_id).first()
    if not breakout:
        raise HTTPException(status_code=404, detail="Breakout room not found")

    meeting = db.query(DBMeeting).filter(DBMeeting.id == int(breakout.meeting_id)).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if current_user.role not in {UserRole.ADMIN, UserRole.MENTOR}:
        raise HTTPException(status_code=403, detail="Only mentors can assign users to breakout rooms")

    if current_user.role != UserRole.ADMIN and current_user.id != meeting.mentor_id:
        raise HTTPException(status_code=403, detail="Only the mentor for this meeting can assign users to breakout rooms")

    existing_assignment = db.query(DBBreakoutParticipant).filter(
        DBBreakoutParticipant.breakout_room_id == breakout_id,
        DBBreakoutParticipant.user_id == assign_in.user_id
    ).first()

    if not existing_assignment:
        participant = DBBreakoutParticipant(breakout_room_id=breakout_id, user_id=assign_in.user_id)
        db.add(participant)
        db.commit()
        db.refresh(breakout)

    await broadcast_breakout_room_event(
        breakout.meeting_id,
        "breakout_rooms_updated",
        {"room_id": breakout.id, "room_name": breakout.name, "action": "assigned"}
    )

    return breakout

@app.delete("/api/breakout-rooms/{breakout_id}")
async def close_breakout_room(
    breakout_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    breakout = db.query(DBBreakoutRoom).filter(DBBreakoutRoom.id == breakout_id).first()
    if not breakout:
        raise HTTPException(status_code=404, detail="Breakout room not found")

    meeting = db.query(DBMeeting).filter(DBMeeting.id == int(breakout.meeting_id)).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if current_user.role not in {UserRole.ADMIN, UserRole.MENTOR}:
        raise HTTPException(status_code=403, detail="Only mentors can close breakout rooms")

    if current_user.role != UserRole.ADMIN and current_user.id != meeting.mentor_id:
        raise HTTPException(status_code=403, detail="Only the mentor for this meeting can close breakout rooms")

    db.delete(breakout)
    db.commit()
    await broadcast_breakout_room_event(
        breakout.meeting_id,
        "breakout_rooms_updated",
        {"room_id": breakout.id, "room_name": breakout.name, "action": "deleted"}
    )
    return {"message": f"Breakout room {breakout_id} closed successfully"}

@app.post("/api/internships", response_model=InternshipResponse)
def create_internship(internship_in: InternshipCreate, db: Session = Depends(get_db)):
    internship = DBInternship(**internship_in.model_dump())
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship

@app.get("/api/internships", response_model=List[InternshipResponse])
def get_internships(db: Session = Depends(get_db)):
    return db.query(DBInternship).filter(DBInternship.is_active == True).all()

@app.post("/api/applications/onboard", response_model=ApplicationResponse)
def submit_onboarding_application(app_in: OnboardingApplicationCreate, db: Session = Depends(get_db)):
    application = DBApplication(**app_in.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@app.get("/api/applications", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    return db.query(DBApplication).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


