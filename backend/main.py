from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
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

# 1. Import the meetings router module
from routers import auth, meetings, airdrops, onboarding, tasks, analytics, submissions, users


try:
    import models, database, schemas
except ImportError:
    from . import models, database, schemas

# Optional sandbox runner using Docker; falls back to local subprocess if unavailable
try:
    from sandbox_runner import run_submission as sandbox_run_submission
except Exception:
    try:
        from .sandbox_runner import run_submission as sandbox_run_submission
    except Exception:
        sandbox_run_submission = None


def _infer_function_spec(code: str, task: models.Task) -> tuple[Optional[str], int]:
    """Infer the primary function name and its positional argument count."""
    try:
        tree = ast.parse(code)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                return node.name, len(node.args.args)
    except Exception:
        pass

    for source in (task.coding_prompt, task.coding_solution):
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


# Initialize FastAPI application
app = FastAPI(
    title="Online Internship Portal",
    description="Backend API for managing interns, mentors, curriculum, submissions, messaging, video meetings, and certificates.",
    version="1.0.0"
)

# 2. Register routers

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(airdrops.router, prefix="/api/airdrops", tags=["Airdrops"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["Onboarding"])
# Meetings uses a custom prefix internally for WS, but we'll register the router
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security & Auth Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
        user_id: str = payload.get("sub")
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
scheduler = BackgroundScheduler(timezone=pytz.UTC)


def scheduled_daily_cleanup():
    db = database.SessionLocal()
    try:
        pass
    finally:
        db.close()


scheduler.add_job(scheduled_daily_cleanup, 'cron', hour=0, minute=0)
scheduler.start()


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user_in.password)
    user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        role=user_in.role or "intern"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login")
def login(login_in: schemas.UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not pwd_context.verify(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": schemas.UserResponse.from_orm(user)}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ==========================================
# CURRICULUM & TASK ENDPOINTS
# ==========================================

@app.get("/api/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Task).all()


@app.post("/api/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.TaskCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role(["mentor", "admin"]))
):
    task = models.Task(**task_in.dict(), created_by=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# ==========================================
# SUBMISSIONS & AUTO-EVALUATION
# ==========================================

@app.post("/api/tasks/{task_id}/submit", response_model=schemas.SubmissionResponse)
def submit_task(
    task_id: int,
    submission_in: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["intern"]))
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    submission = models.Submission(
        task_id=task.id,
        user_id=current_user.id,
        submitted_code=submission_in.submitted_code,
        status="pending"
    )
    db.add(submission)
    db.commit()

    if task.is_coding_task and submission_in.submitted_code:
        if sandbox_run_submission:
            results = sandbox_run_submission(submission_in.submitted_code, task)
            submission.score = results.get("score", 0)
            submission.status = "evaluated"
            submission.feedback = json.dumps(results.get("test_results", []))
        else:
            func_name, arg_count = _infer_function_spec(submission_in.submitted_code, task)
            passed_tests = 0
            test_cases = task.test_cases or []

            if func_name and test_cases:
                with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as tmp:
                    tmp.write(submission_in.submitted_code)
                    tmp_path = tmp.name

                try:
                    for test in test_cases:
                        inp = _parse_test_input(test.get("input"))
                        expected = str(test.get("output")).strip()
                        run_script = f"import sys, json\nfrom {os.path.basename(tmp_path)[:-3]} import {func_name}\nprint({func_name}(*{inp if isinstance(inp, list) else [inp]}))\n"
                        
                        proc = subprocess.run(
                            [sys.executable, "-c", run_script],
                            cwd=os.path.dirname(tmp_path),
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                        if proc.stdout.strip() == expected:
                            passed_tests += 1

                    score = int((passed_tests / len(test_cases)) * 100) if test_cases else 100
                    submission.score = score
                    submission.status = "evaluated"
                    submission.feedback = f"Passed {passed_tests}/{len(test_cases)} automated test cases."
                except Exception as ex:
                    submission.status = "failed"
                    submission.feedback = f"Execution error: {str(ex)}"
                finally:
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
            else:
                submission.status = "evaluated"
                submission.score = 100
                submission.feedback = "Submitted successfully. Manual review pending."

    db.commit()
    db.refresh(submission)
    return submission


# ==========================================
# CERTIFICATE GENERATION
# ==========================================

@app.get("/api/certificates/download/{intern_id}")
def generate_certificate(
    intern_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    intern = db.query(models.User).filter(models.User.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern record not found")

    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.add_page()
    pdf.set_font("Arial", "B", 24)
    pdf.cell(0, 20, "CERTIFICATE OF COMPLETION", ln=True, align="C")
    
    pdf.ln(10)
    pdf.set_font("Arial", "", 14)
    pdf.cell(0, 10, "This is proudly presented to", ln=True, align="C")
    
    pdf.set_font("Arial", "B", 20)
    pdf.cell(0, 15, intern.full_name, ln=True, align="C")
    
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, "for successfully completing the Software Engineering Internship Program.", ln=True, align="C")
    
    pdf.ln(20)
    pdf.cell(0, 10, f"Issued Date: {datetime.utcnow().strftime('%B %d, %Y')}", ln=True, align="C")
    
    pdf_output = io.BytesIO()
    pdf_bytes = pdf.output(dest='S').encode('latin1')
    pdf_output.write(pdf_bytes)
    pdf_output.seek(0)

    headers = {'Content-Disposition': f'attachment; filename="Certificate_{intern.full_name.replace(" ", "_")}.pdf"'}
    return StreamingResponse(pdf_output, headers=headers, media_type="application/pdf")


# ==========================================
# REAL-TIME MESSAGING & WEBSOCKETS
# ==========================================

@app.websocket("/ws/chat/{user_id}")
async def websocket_chat_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            recipient_id = data.get("recipient_id")
            message_text = data.get("message")

            if recipient_id and message_text:
                db_message = models.Message(
                    sender_id=user_id,
                    recipient_id=recipient_id,
                    content=message_text,
                    timestamp=datetime.utcnow()
                )
                db.add(db_message)
                db.commit()

                payload = json.dumps({
                    "sender_id": user_id,
                    "content": message_text,
                    "timestamp": db_message.timestamp.isoformat()
                })
                await manager.send_personal_message(payload, recipient_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)


# ==========================================
# HEALTH & APPLICATION ENTRYPOINT
# ==========================================

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
