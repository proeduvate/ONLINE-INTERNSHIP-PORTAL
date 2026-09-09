from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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
from routers import meetings

try:
    from app import models, schemas
    from app.db import session as database
except ImportError:
    from app import models, schemas
    from app.db import session as database

try:
    from app.utils.sandbox_runner import run_submission as sandbox_run_submission
except Exception as e:
    print(f"Warning: Could not import sandbox_runner: {e}")
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

# 2. Register the meetings router
app.include_router(meetings.router)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.security import pwd_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
========
# --- Security & Auth Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Hours
>>>>>>>> origin/srinath-frontend:backend/app.py

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Automatically generate all database tables on startup
========
# Ensure DB tables exist on startup
>>>>>>>> origin/srinath-frontend:backend/app.py
models.Base.metadata.create_all(bind=database.engine)

# Auto-seed the database if it is empty (e.g., when falling back to SQLite due to network issues)
db = database.SessionLocal()
needs_seed = False
try:
    if not db.query(models.User).first():
        needs_seed = True
finally:
    db.close()

if needs_seed:
    print("Database is empty! Auto-seeding to ensure seamless network fallback...")
    import seed
    seed.seed()

# Include modular routers for new features
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.tickets import router as tickets_router
from app.api.v1.endpoints.airdrops import router as airdrops_router
from app.api.v1.endpoints.leaderboard import router as leaderboard_router
from app.api.v1.endpoints.facts import router as facts_router
from app.api.v1.endpoints.simulation import router as simulation_router
from app.api.v1.endpoints.batch_analytics import router as batch_analytics_router
from routers import meetings

# Initialize analytics DB
from app.db.analytics_session import engine as analytics_engine
from app.models.analytics_models import Base as AnalyticsBase
AnalyticsBase.metadata.create_all(bind=analytics_engine)

app.include_router(analytics_router)
app.include_router(tickets_router)
app.include_router(airdrops_router)
app.include_router(leaderboard_router)
app.include_router(facts_router)
app.include_router(simulation_router)
app.include_router(batch_analytics_router)
app.include_router(meetings.router)


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
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not pwd_context.verify(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": schemas.UserResponse.from_orm(user)}

@app.post("/token")
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {"user_id": user.id, "role": user.role.value, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": encoded_jwt, "token_type": "bearer"}


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
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Admin can create tasks"
        )
    
    new_task = models.Task(
        domain_id=data.domain_id,
        day_number=data.day_number,
        title=data.title,
        description=data.description,
        video_url=data.video_url,
        document_url=data.document_url,
        notes=data.notes,
        resources=data.resources,
        mcq_questions=data.mcq_questions,
        coding_prompt=data.coding_prompt,
        coding_solution=data.coding_solution,
        test_cases=data.test_cases,
        deadline_days=data.deadline_days or 1,
        batch_id=data.batch_id,
        difficulty=data.difficulty,
        task_type=data.task_type,
        instructions=data.instructions,
        expected_outcome=data.expected_outcome,
        is_active=data.is_active,
        created_by=current_user.id
    )
    db.add(new_task)
========
    task = models.Task(**task_in.dict(), created_by=current_user.id)
    db.add(task)
>>>>>>>> origin/srinath-frontend:backend/app.py
    db.commit()
    db.refresh(task)
    return task


@app.get("/tasks")
def get_tasks(
    domain_id: int = None, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Interns only get tasks from their allocated domain
    if current_user.role == models.UserRole.INTERN:
        if current_user.domain_id is None:
            return []
        domain_id = current_user.domain_id
        
    query = db.query(models.Task)
    if domain_id:
        query = query.filter(models.Task.domain_id == domain_id)
        
    tasks = query.order_by(models.Task.day_number).all()
    return tasks


@app.get("/tasks/intern")
def get_intern_tasks_with_unlock_status(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")
        
    if current_user.domain_id is None:
        return {"tasks": [], "message": "No domain assigned yet"}
        
    tasks = db.query(models.Task).filter(models.Task.domain_id == current_user.domain_id).order_by(models.Task.day_number).all()
    submissions = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
    
    sub_map = {sub.task_id: sub for sub in submissions}
    
    from datetime import datetime
    current_date = datetime.utcnow()
    start_date = current_user.start_date or current_date
    internship_day = (current_date - start_date).days + 1
    if internship_day < 1:
        internship_day = 1

    # Sequential Day Locking logic:
    # Day 1 is unlocked if internship_day >= 1
    # Day N is unlocked if Day N-1 is submitted or approved AND internship_day >= N.
    results = []
    sequential_unlocked = True # True if previous day is completed
    
    for idx, t in enumerate(tasks):
        sub = sub_map.get(t.id)
        status_val = "Not started"
        score_val = 0
        ai_score_val = 0
        mentor_score_val = 0
        
        if sub:
            status_val = sub.status
            # calculate combined scores
            score_val = (sub.mcq_score or 0) + (sub.ai_score or 0) + (sub.mentor_score or 0)
            ai_score_val = sub.ai_score or 0
            mentor_score_val = sub.mentor_score or 0
            
        is_unlocked = sequential_unlocked
            
        results.append({
            "id": t.id,
            "day_number": t.day_number,
            "title": t.title,
            "description": t.description,
            "video_url": t.video_url,
            "document_url": t.document_url,
            "notes": t.notes,
            "resources": t.resources,
            "mcq_questions": t.mcq_questions,
            "coding_prompt": t.coding_prompt,
            "unlocked": is_unlocked,
            "status": status_val,
            "score": score_val,
            "ai_score": ai_score_val,
            "mentor_score": mentor_score_val,
            "mcq_score": sub.mcq_score if sub else 0,
            "ai_feedback": sub.ai_feedback if sub else None,
            "mentor_feedback": sub.mentor_feedback if sub else None,
            "submitted_at": sub.submitted_at if sub else None,
            "started_at": sub.started_at if sub else None
        })
        
        # Next task unlock status depends on whether this task was submitted/approved
        if not sub or sub.status not in ["submitted", "approved"]:
            sequential_unlocked = False
            
    return results
========
@app.get("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
>>>>>>>> origin/srinath-frontend:backend/app.py


@app.post("/tasks/{task_id}/start")
def start_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can start tasks")
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.domain_id != current_user.domain_id:
        raise HTTPException(status_code=403, detail="Task does not belong to your domain")
        
    if task.day_number > 1:
        previous_task = db.query(models.Task).filter(
            models.Task.domain_id == task.domain_id,
            models.Task.day_number == task.day_number - 1
        ).first()
        prev_sub = None
        if previous_task:
            prev_sub = db.query(models.Submission).filter(
                models.Submission.intern_id == current_user.id,
                models.Submission.task_id == previous_task.id
            ).first()
            
        if not prev_sub or prev_sub.status not in ["submitted", "approved"]:
            raise HTTPException(status_code=403, detail="Previous task not completed")
            
    existing = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.task_id == task_id
    ).first()
    
    if existing:
        if existing.status == "not_started":
            existing.status = "in_progress"
            existing.started_at = datetime.utcnow()
            db.commit()
        return {"message": "Task already started", "status": existing.status}
        
    new_sub = models.Submission(
        intern_id=current_user.id,
        task_id=task_id,
        status="in_progress",
        started_at=datetime.utcnow()
    )
    db.add(new_sub)
    db.commit()
    
    return {"message": "Task started successfully", "status": "in_progress"}

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

    if task.domain_id != current_user.domain_id:
        raise HTTPException(status_code=403, detail="Task does not belong to your assigned domain")

    result = execute_code_submission(data.code_submission, task)
    return {
        "task_id": data.task_id,
        "syntax_valid": result["syntax_valid"],
        "runtime_score": result["runtime_score"],
        "test_cases_passed": result["test_cases_passed"],
        "total_test_cases": result["total_test_cases"],
        "runtime_feedback": result["runtime_feedback"],
        "test_case_results": result["test_case_results"],
        "stdout": result["stdout"],
        "stderr": result["stderr"],
        "successful": result["successful"]
    }


# ==========================================
#           SUBMISSION MANAGEMENT
# ==========================================

@app.post("/submissions")
def create_submission(
    data: schemas.SubmissionCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can submit tasks")
        
    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.domain_id != current_user.domain_id:
        raise HTTPException(status_code=403, detail="Task does not belong to your assigned domain")

    if task.day_number > 1:
        previous_task = db.query(models.Task).filter(
            models.Task.domain_id == task.domain_id,
            models.Task.day_number == task.day_number - 1
        ).first()
        prev_submission = None
        if previous_task:
            prev_submission = db.query(models.Submission).filter(
                models.Submission.intern_id == current_user.id,
                models.Submission.task_id == previous_task.id
            ).first()

        if not prev_submission or prev_submission.status not in ["submitted", "approved"]:
            raise HTTPException(
                status_code=403,
                detail="This task is locked until the previous day's task has been completed and submitted"
            )
        
    # Check if a submission already exists
    existing = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.task_id == data.task_id
    ).first()
    
    # Calculate MCQ Score
    mcq_score = 0
    if data.mcq_answers and task.mcq_questions:
        try:
            answers = json.loads(data.mcq_answers)
            questions = json.loads(task.mcq_questions)
            # Question structure: list of {"id", "correct_option"}
            # answers structure: dict of {question_id: selected_option}
            correct = 0
            for q in questions:
                q_id = str(q.get("id"))
                if answers.get(q_id) == q.get("correct_option"):
                    correct += 1
            mcq_score = int((correct / len(questions)) * 100) if questions else 0
        except Exception:
            mcq_score = 0
            
    # Save code to filesystem
    if data.code_submission:
        domain_name = current_user.domain.name if current_user.domain else "Unknown"
        domain_name_clean = re.sub(r'[^a-zA-Z0-9]', '_', domain_name)
        
        ext_map = {
            "python": "py",
            "javascript": "js",
            "typescript": "ts",
            "java": "java",
            "c": "c",
            "c++": "cpp",
            "c#": "cs"
        }
        lang = data.language.lower() if data.language else "txt"
        ext = ext_map.get(lang, lang)
        
        base_dir = os.path.join(os.getcwd(), "submissions")
        domain_dir = os.path.join(base_dir, domain_name_clean)
        intern_dir = os.path.join(domain_dir, f"intern_{current_user.id}")
        
        try:
            os.makedirs(intern_dir, exist_ok=True)
            if data.filename:
                file_name = data.filename
            else:
                file_name = f"day{task.day_number}.{ext}"
            file_path = os.path.join(intern_dir, file_name)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(data.code_submission)
        except Exception as e:
            print(f"Error saving submission file: {e}")
            raise HTTPException(status_code=500, detail="Unable to save your submission. Please try again.")

    # Trigger AI Evaluator and secure runtime execution for code submission
    ai_eval_result = {"score": 0, "feedback": None}
    runtime_result = None
    if data.code_submission:
        ai_eval_result = run_ai_evaluation(data.code_submission, task)
        runtime_result = execute_code_submission(data.code_submission, task)
        combined_score = min(100, int((ai_eval_result["score"] * 0.6) + (runtime_result["runtime_score"] * 0.4)))
    else:
        combined_score = 0

    if existing:
        existing.code_submission = data.code_submission
        existing.mcq_answers = data.mcq_answers
        existing.mcq_score = mcq_score
        existing.ai_score = combined_score
        existing.ai_feedback = json.dumps({
            "ai_analysis": ai_eval_result,
            "runtime_evaluation": runtime_result
        }) if runtime_result else ai_eval_result["feedback"]
        existing.status = "submitted"
        existing.filename = file_name
        existing.submitted_at = datetime.utcnow()
        existing.attendance_marked = True
        db.add(existing)
        sub = existing
    else:
        new_sub = models.Submission(
            intern_id=current_user.id,
            task_id=data.task_id,
            status="submitted",
            code_submission=data.code_submission,
            mcq_answers=data.mcq_answers,
            mcq_score=mcq_score,
            ai_score=combined_score,
            ai_feedback=json.dumps({
                "ai_analysis": ai_eval_result,
                "runtime_evaluation": runtime_result
            }) if runtime_result else ai_eval_result["feedback"],
            filename=file_name,
            attendance_marked=True
        )
        db.add(new_sub)
        sub = new_sub
    
    db.commit()
    db.refresh(sub)
    
    # Update Attendance and Progress for Intern
    # Progress: total tasks submitted divided by 30 (total days)
    total_domain_tasks = db.query(models.Task).filter(models.Task.domain_id == current_user.domain_id).count() or 30
    user_subs = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.status.in_(["submitted", "approved"])
    ).count()
    
    current_user.progress_pct = min(100, int((user_subs / total_domain_tasks) * 100))
    
    # Attendance Calculation:
    # 100% attendance if submitted days match elapsed days, or mock attendance tracker:
    # Count how many days submitted out of elapsed. We can mock it to increase slightly or keep at 95%
    submitted_days = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.attendance_marked == True
    ).count()
    current_user.attendance_pct = min(100, max(60, int((submitted_days / max(1, user_subs)) * 100)))

    attendance_log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.intern_id == current_user.id,
        models.AttendanceLog.log_date >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
        models.AttendanceLog.log_date < datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
    ).first()
    if not attendance_log:
        db.add(models.AttendanceLog(intern_id=current_user.id, status="present", note="Submitted daily task"))
    
    # Streak tracking logic
    now_dt = datetime.utcnow()
    last_comp = current_user.last_task_completion_date
    if last_comp:
        # Check if difference is around 1 day (between 12 and 48 hours to be safe for "consecutive")
        diff_hours = (now_dt - last_comp).total_seconds() / 3600
        if diff_hours < 48 and now_dt.date() > last_comp.date():
            current_user.learning_streak += 1
        elif now_dt.date() > last_comp.date():
             # missed a day
            current_user.learning_streak = 1
    else:
        current_user.learning_streak = 1
        
    current_user.last_task_completion_date = now_dt
    
    db.add(current_user)
    db.commit()

    # Cancel any pending reminders for today
    today = datetime.utcnow().date()
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False,
        models.Notification.type == "daily_reminder"
    ).update({"is_read": True})
    
    # Send a motivation notification
    motivations = [
        "🎉 Excellent work! You have successfully completed today's task. Keep up the great progress!",
        "🚀 Great job! You're one step closer to completing your internship successfully.",
        "🌟 Amazing consistency! Completing tasks daily will improve your skills and increase your final score.",
        "💪 Fantastic! Today's attendance has been marked as Present. Keep your learning streak alive!",
        "🏆 You're doing great! Small daily efforts lead to big achievements."
    ]
    streak_messages = {
        7: "🔥 Amazing! You have maintained a 7-day learning streak. Keep it going!",
        15: "🏅 Congratulations! You've completed tasks for 15 consecutive days. Consistency is your strength!"
    }
    
    if current_user.learning_streak in streak_messages:
        motivational_message = streak_messages[current_user.learning_streak]
    else:
        motivational_message = random.choice(motivations)
        
    motivation_notification = models.Notification(
========
    submission = models.Submission(
        task_id=task.id,
>>>>>>>> origin/srinath-frontend:backend/app.py
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
