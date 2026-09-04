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
import uuid
from typing import Dict, Any, Optional, List
import difflib
from fpdf import FPDF
import random
from apscheduler.schedulers.background import BackgroundScheduler
import pytz

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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.security import pwd_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# In-memory WebRTC signaling room state for mentor/intern meeting negotiations.
SIGNALING_ROOMS: Dict[str, Any] = {}

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Automatically generate all database tables on startup
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
    try:
        from scripts.utils import seed
        seed.seed()
    except Exception as e:
        print("Failed to auto-seed:", e)

# Include modular routers for new features
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.tickets import router as tickets_router
from app.api.v1.endpoints.airdrops import router as airdrops_router
from app.api.v1.endpoints.leaderboard import router as leaderboard_router
from app.api.v1.endpoints.facts import router as facts_router
from app.api.v1.endpoints.simulation import router as simulation_router
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
app.include_router(meetings.router)


# ==========================================
#           JWT SECURITY DEPENDENCY
# ==========================================

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# Root route so the landing page displays a helpful status
@app.get("/")
def root():
    return {"message": "Welcome to the AI Internship Portal API. Head over to /docs to test endpoints!"}


# ==========================================
#           USER AUTHENTICATION ROUTES
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
    
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=models.UserRole(user_data.role.value)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully", "user_id": new_user.id}


@app.post("/login")
def login_user(user_credentials: schemas.UserLoginSchema, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )
    
    if not pwd_context.verify(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {"user_id": user.id, "role": user.role.value, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    # Return user details too for client routing ease
    return {
        "access_token": encoded_jwt, 
        "token_type": "bearer",
        "role": user.role.value,
        "name": user.name,
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
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {"user_id": user.id, "role": user.role.value, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": encoded_jwt, "token_type": "bearer"}


# ==========================================
#           ADMIN USER MANAGEMENT / ONBOARDING
# ==========================================

@app.post("/admin/onboard", status_code=status.HTTP_201_CREATED)
def onboard_user(
    data: schemas.UserOnboard, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can onboard users"
        )
        
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
        
    hashed_password = pwd_context.hash(data.password)
    
    # Intern ID generation
    intern_id = None
    if data.role == models.UserRole.INTERN:
        count = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).count()
        intern_id = f"INT-{datetime.now().year}-{count + 101:04d}"
        
    start_dt = datetime.strptime(data.start_date, "%Y-%m-%d") if data.start_date else None
    end_dt = datetime.strptime(data.end_date, "%Y-%m-%d") if data.end_date else None
    
    new_user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=hashed_password,
        role=models.UserRole(data.role.value),
        college=data.college,
        domain_id=data.domain_id,
        mentor_id=data.mentor_id,
        start_date=start_dt,
        end_date=end_dt,
        intern_id=intern_id,
        attendance_pct=100, # Starts with clean attendance
        progress_pct=0
    )
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
    # Admins and Mentors can query users
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access"
        )
        
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
        
    if current_user.role == models.UserRole.MENTOR and role == "intern":
        # Mentor can only view their own assigned interns
        query = query.filter(models.User.mentor_id == current_user.id)
        
    users = query.all()
    return users


@app.get("/profile", response_model=schemas.UserResponse)
def get_current_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    return current_user


@app.delete("/users/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can delete users"
        )
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


# ==========================================
#           DOMAIN MANAGEMENT
# ==========================================

@app.post("/domains", response_model=schemas.DomainResponse)
def create_domain(
    data: schemas.DomainCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Admin can create domains"
        )
    existing = db.query(models.Domain).filter(models.Domain.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Domain already exists")
        
    new_domain = models.Domain(name=data.name, description=data.description)
    db.add(new_domain)
    db.commit()
    db.refresh(new_domain)
    return new_domain


@app.get("/domains")
def get_domains(db: Session = Depends(database.get_db)):
    return db.query(models.Domain).all()


# ==========================================
#           CURRICULUM / TASK MANAGEMENT
# ==========================================

@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(
    data: schemas.TaskCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
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
    db.commit()
    db.refresh(new_task)
    return new_task


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
    print(f"DEBUG /tasks/intern: current_user.email={current_user.email}, role={current_user.role}, type={type(current_user.role)}")
    if current_user.role != models.UserRole.INTERN and getattr(current_user.role, "value", current_user.role) != "intern":
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
#           AI CODE EVALUATOR HEURISTICS
# ==========================================


def calculate_final_score_and_grade(mcq_score: int, ai_score: int, mentor_score: int) -> dict:
    final_score = mcq_score + ai_score + mentor_score
    if final_score >= 240:
        grade = "A"
    elif final_score >= 180:
        grade = "B"
    elif final_score >= 120:
        grade = "C"
    else:
        grade = "D"
    return {"final_score": final_score, "grade": grade}


def build_portfolio_payload(user: models.User, db: Session) -> dict:
    submissions = db.query(models.Submission).filter(models.Submission.intern_id == user.id).all()
    completed_tasks = []
    total_score = 0
    for sub in submissions:
        task = db.query(models.Task).filter(models.Task.id == sub.task_id).first()
        completed_tasks.append({
            "task_id": sub.task_id,
            "day": task.day_number if task else None,
            "title": task.title if task else "Unknown",
            "status": sub.status,
            "mcq_score": sub.mcq_score,
            "ai_score": sub.ai_score,
            "mentor_score": sub.mentor_score,
        })
        total_score += sub.mcq_score + sub.ai_score + sub.mentor_score

    mentor = db.query(models.User).filter(models.User.id == user.mentor_id).first() if user.mentor_id else None
    domain = db.query(models.Domain).filter(models.Domain.id == user.domain_id).first() if user.domain_id else None
    grade_summary = calculate_final_score_and_grade(0, 0, 0)
    if submissions:
        mcq_total = sum(s.mcq_score for s in submissions)
        ai_total = sum(s.ai_score for s in submissions)
        mentor_total = sum(s.mentor_score for s in submissions)
        grade_summary = calculate_final_score_and_grade(mcq_total, ai_total, mentor_total)

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "college": user.college,
        "domain": domain.name if domain else None,
        "mentor": mentor.name if mentor else None,
        "progress_pct": user.progress_pct,
        "attendance_pct": user.attendance_pct,
        "total_score": grade_summary["final_score"],
        "grade": grade_summary["grade"],
        "submissions": completed_tasks,
    }


def run_ai_evaluation(code: str, task: models.Task) -> dict:
    if not code or len(code.strip()) < 5:
        return {
            "score": 0,
            "syntax_valid": False,
            "quality": "Critical Error",
            "feedback": json.dumps({
                "summary": "AI Evaluation failed. Submission was empty or too brief.",
                "syntax_check": "No code detected.",
                "code_quality": "Critical",
                "complexity": "N/A",
                "test_results": ["Test cases: 0/0 passed"],
                "suggestions": ["Please input a complete coding block and try again."]
            })
        }

    syntax_valid = True
    syntax_error_details = ""
    try:
        compile(code, "<string>", "exec")
    except SyntaxError as e:
        syntax_valid = False
        syntax_error_details = f"Syntax Error: {e.msg} on line {e.lineno}"

    # Basic complexity heuristic
    loops = len(re.findall(r"\b(for|while)\b", code))
    has_funcs = len(re.findall(r"\bdef\b", code)) > 0
    complexity = "O(1) constant time" if loops == 0 else ("O(N^2) quadratic time" if loops > 1 else "O(N) linear time")

    # Evaluate test cases by executing code in the secure runner when possible
    total_test_cases = 0
    test_cases_passed = 0
    tc_details = []
    runtime_eval = None

    if task.test_cases:
        try:
            test_cases = json.loads(task.test_cases)
            total_test_cases = len(test_cases)
            if syntax_valid:
                # Use the secure executor to run actual test cases for more accurate scoring
                try:
                    runtime_eval = execute_code_submission(code, task)
                    test_cases_passed = runtime_eval.get("test_cases_passed", 0)
                    for tr in runtime_eval.get("test_case_results", []):
                        status_str = "PASSED" if tr.get("passed") else "FAILED"
                        tc_details.append(f"Test Case {tr.get('case_number')}: Input: {tr.get('input')} -> {status_str}")
                except Exception as e:
                    tc_details.append(f"Runtime evaluation failed: {str(e)}")
            else:
                for idx, tc in enumerate(test_cases):
                    tc_details.append(f"Test Case {idx+1}: Input: {tc.get('input')} -> FAILED (Syntax Error)")
        except Exception:
            total_test_cases = 1
            test_cases_passed = 0
            tc_details.append("Test Case 1: Could not parse test cases")
    else:
        total_test_cases = 0
        test_cases_passed = 0
        tc_details.append("No test cases provided for this task.")

    # Scoring: combine syntax, runtime test success, and code quality heuristics
    # Additional code-quality metrics
    loc = len(code.splitlines())
    func_count = len(re.findall(r"\bdef\s+\w+\s*\(", code))
    comments = len(re.findall(r"#", code))
    docstring_present = bool(re.search(r'"""|\'\'\'', code))
    list_comp = bool(re.search(r"\[.*for .* in .*=*.*\]", code))
    import_count = len(re.findall(r"\bimport\b|\bfrom\b", code))

    code_metrics = {
        "lines_of_code": loc,
        "function_count": func_count,
        "comments": comments,
        "docstring_present": docstring_present,
        "list_comprehension_used": list_comp,
        "import_count": import_count,
        "complexity_guess": complexity
    }

    base = 20 if syntax_valid else 5
    tc_score = int((test_cases_passed / max(1, total_test_cases)) * 60) if total_test_cases > 0 else 30
    # Quality score derived from length, functions, comments and docstrings
    quality_points = 0
    quality_points += min(15, int(loc / 10))
    quality_points += min(10, func_count * 2)
    quality_points += 3 if docstring_present else 0
    quality_points += 2 if list_comp else 0
    qual = min(30, quality_points)
    ai_score = min(100, base + tc_score + qual)

    feedback = {
        "summary": "AI Evaluation Completed Successfully." if syntax_valid else "AI Evaluation failed. Code syntax error detected.",
        "syntax_check": "Syntax passes syntax parser." if syntax_valid else f"Failed compiler check: {syntax_error_details}",
        "code_quality": "High" if (syntax_valid and ai_score >= 80) else ("Medium" if syntax_valid and ai_score >= 50 else "Low"),
        "complexity": complexity,
        "test_results": tc_details,
        "runtime_evaluation": runtime_eval,
        "code_metrics": code_metrics,
        "suggestions": [
            "Write unit tests for edge cases and handle invalid inputs.",
            "Refactor long functions into smaller units for readability.",
            f"Estimated complexity: {complexity}."
        ]
    }

    return {
        "score": ai_score,
        "syntax_valid": syntax_valid,
        "quality": "High" if ai_score >= 80 else ("Medium" if ai_score >= 50 else "Low"),
        "feedback": json.dumps(feedback),
        "test_cases": f"{test_cases_passed}/{total_test_cases} passed"
    }


def execute_code_submission(code: str, task: models.Task) -> dict:
    if not code or len(code.strip()) < 5:
        return {
            "syntax_valid": False,
            "runtime_score": 0,
            "test_cases_passed": 0,
            "total_test_cases": 0,
            "runtime_feedback": "Submission was empty or too brief for execution.",
            "test_case_results": [],
            "stdout": None,
            "stderr": None,
            "successful": False
        }

    syntax_valid = True
    syntax_error = None
    try:
        compile(code, "<user_code>", "exec")
    except SyntaxError as exc:
        syntax_valid = False
        syntax_error = f"Syntax Error: {exc.msg} on line {exc.lineno}"

    temp_file = None
    test_case_results = []
    passed = 0
    total = 0
    stdout_capture = ""
    stderr_capture = ""
    runtime_ok = True

    if task.test_cases:
        try:
            test_cases = json.loads(task.test_cases)
        except Exception:
            test_cases = []
    else:
        test_cases = []

    if not syntax_valid:
        return {
            "syntax_valid": False,
            "runtime_score": 0,
            "test_cases_passed": 0,
            "total_test_cases": len(test_cases),
            "runtime_feedback": syntax_error,
            "test_case_results": [],
            "stdout": None,
            "stderr": None,
            "successful": False
        }

    # If an isolated sandbox runner is available, prefer it (Docker-backed).
    if sandbox_run_submission is not None:
        try:
            return sandbox_run_submission(code, test_cases, timeout=6)
        except Exception:
            # If sandbox runner fails for any reason, fall back to local subprocess execution below
            pass

    func_name, func_arg_count = _infer_function_spec(code, task)
    try:
        if not test_cases:
            test_cases = [{"input": "", "expected": ""}]

        for idx, tc in enumerate(test_cases):
            total += 1
            tc_input = tc.get("input", "")
            expected = str(tc.get("expected", "")).strip()
            input_value = _parse_test_input(tc_input)

            if func_name:
                if isinstance(input_value, tuple):
                    args = input_value
                elif isinstance(input_value, list):
                    if func_arg_count == 1 or len(input_value) != func_arg_count:
                        args = (input_value,)
                    else:
                        args = tuple(input_value)
                else:
                    args = (input_value,)
                invocation = f"print({func_name}({', '.join(repr(a) for a in args)}))"
                wrapper_code = f"{code}\n{invocation}\n"
            else:
                wrapper_code = f"{code}\n"

            temp_file = tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8")
            temp_file.write(wrapper_code)
            temp_file.flush()
            temp_file.close()

            try:
                proc = subprocess.run(
                    [sys.executable, "-I", temp_file.name],
                    capture_output=True,
                    text=True,
                    timeout=6,
                    env={
                        "PYTHONIOENCODING": "utf-8",
                        "PYTHONUNBUFFERED": "1",
                        "PATH": os.environ.get("PATH", "")
                    }
                )
                stdout_capture = proc.stdout.strip()
                stderr_capture = proc.stderr.strip()
                success = False
                if expected == "":
                    success = proc.returncode == 0
                else:
                    success = stdout_capture.strip() == expected

                if success:
                    passed += 1

                test_case_results.append({
                    "case_number": idx + 1,
                    "input": tc_input,
                    "expected": expected,
                    "stdout": stdout_capture,
                    "stderr": stderr_capture,
                    "passed": success,
                    "return_code": proc.returncode
                })
            except subprocess.TimeoutExpired:
                runtime_ok = False
                test_case_results.append({
                    "case_number": idx + 1,
                    "input": tc_input,
                    "expected": expected,
                    "stdout": "",
                    "stderr": "TimeoutExpired: Process exceeded time limit.",
                    "passed": False,
                    "return_code": None
                })
            except Exception as runtime_exc:
                runtime_ok = False
                test_case_results.append({
                    "case_number": idx + 1,
                    "input": tc_input,
                    "expected": expected,
                    "stdout": "",
                    "stderr": str(runtime_exc),
                    "passed": False,
                    "return_code": None
                })
            finally:
                if temp_file and os.path.exists(temp_file.name):
                    try:
                        os.remove(temp_file.name)
                    except Exception:
                        pass
                    temp_file = None
    finally:
        if temp_file and temp_file.name and os.path.exists(temp_file.name):
            try:
                os.remove(temp_file.name)
            except Exception:
                pass

    pass_ratio = passed / max(1, total)
    runtime_score = int(pass_ratio * 70) + (20 if runtime_ok else 0) + (10 if len(code) > 120 else 0)
    runtime_score = min(runtime_score, 100)

    runtime_feedback = (
        "Code executed successfully across test cases." if passed == total and runtime_ok
        else "Code execution completed with issues. Review stderr and failing test cases."
    )

    return {
        "syntax_valid": True,
        "runtime_score": runtime_score,
        "test_cases_passed": passed,
        "total_test_cases": total,
        "runtime_feedback": runtime_feedback,
        "test_case_results": test_case_results,
        "stdout": stdout_capture,
        "stderr": stderr_capture,
        "successful": passed == total and runtime_ok
    }


@app.post("/code/execute", response_model=schemas.CodeExecutionResponse)
def execute_code(
    data: schemas.CodeExecutionRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can execute code submissions")

    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
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
        user_id=current_user.id,
        title="Task Completed",
        message=motivational_message,
        type="motivation"
    )
    db.add(motivation_notification)
    db.commit()
    
    response = {
        "message": "Submission recorded",
        "mcq_score": mcq_score,
        "ai_score": combined_score,
        "ai_feedback": json.dumps({
            "ai_analysis": ai_eval_result,
            "runtime_evaluation": runtime_result
        }) if runtime_result else ai_eval_result["feedback"]
    }
    if runtime_result:
        response.update({
            "runtime_score": runtime_result["runtime_score"],
            "runtime_feedback": runtime_result["runtime_feedback"],
            "test_cases_passed": runtime_result["test_cases_passed"],
            "total_test_cases": runtime_result["total_test_cases"]
        })
    return response


@app.get("/submissions")
def get_submissions(
    intern_id: int = None,
    task_id: int = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Submission)
    
    if current_user.role == models.UserRole.INTERN:
        # Intern only sees their own submissions
        query = query.filter(models.Submission.intern_id == current_user.id)
    elif current_user.role == models.UserRole.MENTOR:
        # Mentor sees assigned interns' submissions
        intern_ids = [i.id for i in current_user.interns]
        query = query.filter(models.Submission.intern_id.in_(intern_ids))
        
    if intern_id and current_user.role != models.UserRole.INTERN:
        query = query.filter(models.Submission.intern_id == intern_id)
    if task_id:
        query = query.filter(models.Submission.task_id == task_id)
        
    return query.all()


@app.post("/submissions/{submission_id}/evaluate")
def evaluate_submission(
    submission_id: int,
    eval_data: schemas.SubmissionEvaluate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Access Denied: Only Mentors can evaluate submissions")
        
    sub = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    # Check if this is an assigned intern
    intern = db.query(models.User).filter(models.User.id == sub.intern_id).first()
    if intern.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access Denied: This intern is not assigned to you")
        
    sub.mentor_score = eval_data.mentor_score
    sub.mentor_feedback = eval_data.mentor_feedback
    sub.status = "approved"
    
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    return {"message": "Mentor review updated successfully", "submission": sub}


# ==========================================
#           COMMUNICATION / CHAT
# ==========================================

@app.post("/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(
    data: schemas.AnnouncementCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(status_code=403, detail="Only admins and mentors can create announcements")

    announcement = models.Announcement(
        sender_id=current_user.id,
        title=data.title,
        content=data.content,
        target_role=data.target_role or "all"
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@app.get("/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Announcement)
    if current_user.role == models.UserRole.INTERN:
        query = query.filter(models.Announcement.target_role.in_(["all", "intern"]))
    elif current_user.role == models.UserRole.MENTOR:
        query = query.filter(models.Announcement.target_role.in_(["all", "mentor"]))
    announcements = query.order_by(models.Announcement.created_at.desc()).all()
    return announcements


@app.post("/messages", response_model=schemas.MessageResponse)
def send_message(
    data: schemas.MessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    receiver = db.query(models.User).filter(models.User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")
        
    # Restriction: Intern cannot message another intern
    if current_user.role == models.UserRole.INTERN and receiver.role == models.UserRole.INTERN:
        raise HTTPException(
            status_code=400, 
            detail="Restriction violation: Interns cannot message other interns"
        )
        
    # Check if intern is messaging their assigned mentor, or mentor messaging their assigned intern
    if current_user.role == models.UserRole.INTERN and receiver.id != current_user.mentor_id:
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: Interns can only message their assigned mentor"
        )
        
    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
        file_url=data.file_url
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg


@app.get("/messages")
def get_messages(
    contact_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    contact_user = db.query(models.User).filter(models.User.id == contact_id).first()
    if not contact_user:
        raise HTTPException(status_code=404, detail="Contact user not found")

    if current_user.role == models.UserRole.INTERN:
        if contact_id != current_user.mentor_id:
            raise HTTPException(status_code=403, detail="Access Denied: Interns may only retrieve messages with their assigned mentor")

    if current_user.role == models.UserRole.MENTOR:
        if contact_user.role != models.UserRole.INTERN or contact_user.mentor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access Denied: Mentors may only retrieve messages with assigned interns")

    # Fetch messages between current_user and contact_id
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == contact_id)) |
        ((models.Message.sender_id == contact_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.sent_at).all()
    
    return messages


# ==========================================
#           VIDEO MEETINGS / BREAKOUT
# ==========================================

@app.post("/meetings", response_model=schemas.MeetingResponse)
def create_meeting(
    data: schemas.MeetingCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can host meeting rooms")
        
    new_meet = models.Meeting(
        mentor_id=current_user.id,
        title=data.title,
        room_code=data.room_code,
        status="active"
    )
    db.add(new_meet)
    db.commit()
    db.refresh(new_meet)
    return new_meet


@app.get("/plagiarism/check/{submission_id}")
def plagiarism_check(
    submission_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only mentors and admins are allowed to run plagiarism checks
    if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only mentors or admins can run plagiarism checks")

    sub = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    others = db.query(models.Submission).filter(
        models.Submission.task_id == sub.task_id,
        models.Submission.id != submission_id,
        models.Submission.code_submission != None
    ).all()

    comparisons = []
    for o in others:
        if not o.code_submission:
            continue
        try:
            ratio = difflib.SequenceMatcher(None, str(sub.code_submission), str(o.code_submission)).ratio()
        except Exception:
            ratio = 0.0
        comparisons.append({
            "submission_id": o.id,
            "intern_id": o.intern_id,
            "similarity_pct": round(ratio * 100, 2)
        })

    comparisons = sorted(comparisons, key=lambda x: x["similarity_pct"], reverse=True)
    return {"submission_id": submission_id, "comparisons": comparisons}


@app.get("/meetings")
def get_meetings(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Meeting).filter(models.Meeting.status == "active")
    if current_user.role == models.UserRole.INTERN:
        # Intern can see meetings hosted by their mentor
        query = query.filter(models.Meeting.mentor_id == current_user.mentor_id)
    elif current_user.role == models.UserRole.MENTOR:
        # Mentor sees meetings hosted by themselves
        query = query.filter(models.Meeting.mentor_id == current_user.id)
        
    return query.all()


@app.websocket("/ws/signaling/{room_code}")
async def signaling_websocket(
    room_code: str,
    websocket: WebSocket
):
    await websocket.accept()
    room = SIGNALING_ROOMS.setdefault(room_code, {"participants": {}, "breakouts": {}})
    participant_id = None

    async def broadcast(message: dict, exclude_id: int = None):
        for pid, conn in list(room["participants"].items()):
            if pid == exclude_id:
                continue
            try:
                await conn.send_json(message)
            except Exception:
                pass

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            if action == "join":
                participant_id = data.get("user_id")
                if participant_id is None:
                    await websocket.close(code=1008)
                    return
                room["participants"][participant_id] = websocket
                await broadcast({
                    "action": "participant_joined",
                    "user_id": participant_id,
                    "role": data.get("role")
                }, exclude_id=participant_id)
                await websocket.send_json({"action": "joined", "room_code": room_code})
            elif action in ["offer", "answer", "ice_candidate"]:
                target_id = data.get("target_id")
                if target_id and target_id in room["participants"]:
                    await room["participants"][target_id].send_json(data)
            elif action == "breakout_create":
                breakout_id = data.get("breakout_id") or str(uuid.uuid4())
                room["breakouts"][breakout_id] = {"members": [participant_id]} if participant_id else {"members": []}
                await broadcast({"action": "breakout_created", "breakout_id": breakout_id})
            elif action == "breakout_join":
                breakout_id = data.get("breakout_id")
                if breakout_id in room["breakouts"] and participant_id is not None:
                    members = room["breakouts"][breakout_id].get("members", [])
                    if participant_id not in members:
                        members.append(participant_id)
                    room["breakouts"][breakout_id]["members"] = members
                    await broadcast({"action": "breakout_joined", "breakout_id": breakout_id, "user_id": participant_id})
            elif action == "breakout_leave":
                breakout_id = data.get("breakout_id")
                if breakout_id in room["breakouts"] and participant_id is not None:
                    members = room["breakouts"][breakout_id].get("members", [])
                    if participant_id in members:
                        members.remove(participant_id)
                    room["breakouts"][breakout_id]["members"] = members
                    await broadcast({"action": "breakout_left", "breakout_id": breakout_id, "user_id": participant_id})
            elif action == "leave":
                if participant_id in room["participants"]:
                    room["participants"].pop(participant_id, None)
                await websocket.close()
                return
            else:
                await broadcast(data, exclude_id=participant_id)
    except WebSocketDisconnect:
        if participant_id and participant_id in room["participants"]:
            room["participants"].pop(participant_id, None)
            await broadcast({"action": "participant_left", "user_id": participant_id})


@app.get("/meetings/{room_code}/breakouts")
def get_meeting_breakouts(
    room_code: str,
    current_user: models.User = Depends(get_current_user)
):
    room = SIGNALING_ROOMS.get(room_code)
    if not room:
        raise HTTPException(status_code=404, detail="Meeting room not found or no signaling session yet")
    return {
        "room_code": room_code,
        "participants": list(room["participants"].keys()),
        "breakouts": room["breakouts"]
    }


@app.post("/meetings/{room_code}/close")
def close_meeting(
    room_code: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can close meeting rooms")
        
    meet = db.query(models.Meeting).filter(
        models.Meeting.room_code == room_code,
        models.Meeting.mentor_id == current_user.id
    ).first()
    
    if not meet:
        raise HTTPException(status_code=404, detail="Meeting room not found")
        
    meet.status = "completed"
    db.add(meet)
    db.commit()
    return {"message": "Meeting closed"}


# ==========================================
#           ANALYTICS & PROGRESS TRACKING
# ==========================================

@app.get("/analytics/final-grade")
def get_final_grade(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")

    submissions = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
    mcq_total = sum(s.mcq_score for s in submissions)
    ai_total = sum(s.ai_score for s in submissions)
    mentor_total = sum(s.mentor_score for s in submissions)
    result = calculate_final_score_and_grade(mcq_total, ai_total, mentor_total)
    return {
        "user_id": current_user.id,
        "final_score": result["final_score"],
        "grade": result["grade"],
        "mcq_score": mcq_total,
        "ai_score": ai_total,
        "mentor_score": mentor_total,
    }


@app.get("/analytics/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.ADMIN:
        total_interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).count()
        total_mentors = db.query(models.User).filter(models.User.role == models.UserRole.MENTOR).count()
        total_domains = db.query(models.Domain).count()
        
        # Calculate system averages
        subs = db.query(models.Submission).all()
        avg_score = 0
        if subs:
            total_sum = sum(s.mcq_score + s.ai_score + s.mentor_score for s in subs)
            # max achievable score per task is 300 (100 MCQ + 100 AI + 100 Mentor)
            avg_score = int((total_sum / (len(subs) * 300)) * 100)
            
        # rank list of top interns
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        intern_ranks = []
        for i in interns:
            i_subs = [s for s in subs if s.intern_id == i.id]
            i_score = sum(s.mcq_score + s.ai_score + s.mentor_score for s in i_subs)
            intern_ranks.append({
                "id": i.id,
                "intern_id": i.intern_id,
                "name": i.name,
                "college": i.college,
                "domain": i.domain.name if i.domain else "Unassigned",
                "progress": i.progress_pct,
                "attendance": i.attendance_pct,
                "total_score": i_score
            })
        intern_ranks = sorted(intern_ranks, key=lambda x: x["total_score"], reverse=True)[:10]
        
        return {
            "total_interns": total_interns,
            "total_mentors": total_mentors,
            "total_domains": total_domains,
            "system_average_score": avg_score,
            "intern_rankings": intern_ranks
        }
        
    elif current_user.role == models.UserRole.MENTOR:
        assigned_interns = db.query(models.User).filter(models.User.mentor_id == current_user.id).all()
        intern_ids = [i.id for i in assigned_interns]
        
        pending_reviews = db.query(models.Submission).filter(
            models.Submission.intern_id.in_(intern_ids),
            models.Submission.status == "submitted"
        ).count()
        
        active_meetings = db.query(models.Meeting).filter(
            models.Meeting.mentor_id == current_user.id,
            models.Meeting.status == "active"
        ).count()
        
        intern_list = []
        for i in assigned_interns:
            i_subs = db.query(models.Submission).filter(models.Submission.intern_id == i.id).all()
            i_score = sum(s.mcq_score + s.ai_score + s.mentor_score for s in i_subs)
            intern_list.append({
                "id": i.id,
                "name": i.name,
                "progress": i.progress_pct,
                "attendance": i.attendance_pct,
                "college": i.college,
                "total_score": i_score
            })
            
        return {
            "total_assigned_interns": len(assigned_interns),
            "pending_reviews": pending_reviews,
            "active_meetings": active_meetings,
            "intern_list": intern_list
        }
        
    elif current_user.role == models.UserRole.INTERN:
        my_subs = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
        
        total_score = sum(s.mcq_score + s.ai_score + s.mentor_score for s in my_subs)
        # Average score percentage
        max_possible = len(my_subs) * 300
        avg_pct = int((total_score / max_possible) * 100) if max_possible > 0 else 0
        
        completed_days = len([s for s in my_subs if s.status == "approved"])
        pending_days = len([s for s in my_subs if s.status == "submitted"])
        
        # Weak area identification (MCQ and coding logic)
        weak_areas = []
        low_score_subs = [s for s in my_subs if (s.mcq_score + s.ai_score) < 120]
        for ls in low_score_subs:
            task = db.query(models.Task).filter(models.Task.id == ls.task_id).first()
            if task:
                weak_areas.append(f"Day {task.day_number}: {task.title}")
                
        mentor = db.query(models.User).filter(models.User.id == current_user.mentor_id).first() if current_user.mentor_id else None
        return {
            "progress_pct": current_user.progress_pct,
            "attendance_pct": current_user.attendance_pct,
            "total_score": total_score,
            "average_score_pct": avg_pct,
            "completed_tasks": completed_days,
            "pending_tasks": pending_days,
            "weak_areas": weak_areas[:3],
            "mentor_id": current_user.mentor_id,
            "mentor_name": mentor.name if mentor else None
        }


# ==========================================
#           ATTENDANCE & PORTFOLIO
# ==========================================

@app.get("/attendance", response_model=List[schemas.AttendanceLogResponse])
def get_attendance_logs(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")

    logs = db.query(models.AttendanceLog).filter(models.AttendanceLog.intern_id == current_user.id).order_by(models.AttendanceLog.log_date.desc()).all()
    return logs


@app.get("/portfolio", response_model=schemas.PortfolioResponse)
def get_portfolio(
    user_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if user_id is None:
        target_user = current_user
    else:
        if current_user.role == models.UserRole.INTERN and current_user.id != user_id:
            raise HTTPException(status_code=403, detail="You can only view your own portfolio")
        target_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

    return build_portfolio_payload(target_user, db)


# ==========================================
#           CERTIFICATE GENERATION
# ==========================================

@app.get("/certificate/generate")
def generate_certificate(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can request certificates")
        
    # Requirements Check: Must complete tasks (e.g. at least 15 tasks or progress >= 50% for demo purposes, 
    # but let's check progress_pct >= 90% or 30 tasks for standard)
    if current_user.progress_pct < 80:
        raise HTTPException(
            status_code=400, 
            detail=f"Internship incomplete. Currently at {current_user.progress_pct}%. Complete at least 80% tasks."
        )
        
    # Check if certificate already exists
    existing = db.query(models.Certificate).filter(models.Certificate.intern_id == current_user.id).first()
    if existing:
        return existing
        
    # Calculate score logic
    subs = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
    total_achieved = sum(s.mcq_score + s.ai_score + s.mentor_score for s in subs)
    max_possible = len(subs) * 300
    
    avg_pct = int((total_achieved / max_possible) * 100) if max_possible > 0 else 85
    
    # Grading Scale
    if avg_pct >= 90:
        grade = "A+"
    elif avg_pct >= 80:
        grade = "A"
    elif avg_pct >= 70:
        grade = "B"
    elif avg_pct >= 60:
        grade = "C"
    else:
        grade = "D"
        
    cert_id = f"CERT-{datetime.now().year}-{current_user.id + 1000}"
    
    new_cert = models.Certificate(
        intern_id=current_user.id,
        certificate_id=cert_id,
        grade=grade,
        final_score=avg_pct
    )
    
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    
    return new_cert


@app.get("/certificate/info")
def certificate_info(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can access certificate info")

    cert = db.query(models.Certificate).filter(models.Certificate.intern_id == current_user.id).first()
    if not cert:
        return {"generated": False}

    mentor = db.query(models.User).filter(models.User.id == current_user.mentor_id).first() if current_user.mentor_id else None
    domain = db.query(models.Domain).filter(models.Domain.id == current_user.domain_id).first() if current_user.domain_id else None

    return {
        "generated": True,
        "certificate_id": cert.certificate_id,
        "intern_name": current_user.name,
        "domain_name": domain.name if domain else "Tech domain",
        "mentor_name": mentor.name if mentor else "Lead Mentor",
        "final_grade": cert.grade,
        "generated_at": cert.generated_at.strftime("%Y-%m-%d")
    }


@app.get("/certificate/download")
def download_certificate(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can download certificates")
        
    cert = db.query(models.Certificate).filter(models.Certificate.intern_id == current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not generated yet. Go to Generate first.")
        
    mentor = db.query(models.User).filter(models.User.id == current_user.mentor_id).first()
    domain = db.query(models.Domain).filter(models.Domain.id == current_user.domain_id).first()
    
    domain_name = domain.name if domain else "Tech domain"
    verification_url = f"http://127.0.0.1:8000/certificate/verify/{cert.certificate_id}"
    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.set_font("Helvetica", "B", 28)
    pdf.cell(0, 20, "Certificate of Completion", ln=True, align="C")
    pdf.ln(10)

    pdf.set_font("Helvetica", "", 16)
    pdf.cell(0, 10, "This certificate is proudly presented to", ln=True, align="C")
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 24)
    pdf.cell(0, 12, current_user.name, ln=True, align="C")
    pdf.ln(5)

    pdf.set_font("Helvetica", "", 16)
    pdf.multi_cell(0, 10, f"For successfully completing the internship program in {domain_name} with a final score of {cert.final_score}% and a grade of {cert.grade}.", align="C")
    pdf.ln(5)

    pdf.set_font("Helvetica", "", 14)
    pdf.cell(0, 10, f"Intern ID: {current_user.intern_id}", ln=True, align="C")
    pdf.cell(0, 10, f"College: {current_user.college}", ln=True, align="C")
    pdf.cell(0, 10, f"Mentor: {mentor.name if mentor else 'Lead Mentor'}", ln=True, align="C")
    pdf.cell(0, 10, f"Certificate ID: {cert.certificate_id}", ln=True, align="C")
    pdf.cell(0, 10, f"Verification: {verification_url}", ln=True, align="C")
    pdf.ln(10)

    pdf.set_font("Helvetica", "I", 12)
    pdf.cell(0, 10, "Verified and issued by Online Internship Portal", ln=True, align="C")

    # FPDF.output with dest='S' returns the PDF as a string; convert to bytes
    pdf_data_str = pdf.output(dest='S')
    try:
        pdf_bytes = pdf_data_str.encode('latin-1')
    except Exception:
        pdf_bytes = pdf_data_str.encode('utf-8', errors='ignore')

    output = io.BytesIO(pdf_bytes)
    output.seek(0)

    filename = f"certificate_{cert.certificate_id}.pdf"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}"
    }
    html_content = ""
    return StreamingResponse(io.BytesIO(html_content.encode("utf-8")), media_type="text/html")


# ==========================================
#           NOTIFICATION SYSTEM
# ==========================================

@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications


@app.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@app.put("/notifications/read-all")
def mark_all_notifications_read(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


# ==========================================
#           SCHEDULED JOBS
# ==========================================

def send_daily_reminders(time_of_day: str):
    db = database.SessionLocal()
    try:
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        for intern in interns:
            # Check if intern completed today's task
            now = datetime.utcnow()
            completed_today = db.query(models.Submission).filter(
                models.Submission.intern_id == intern.id,
                models.Submission.attendance_marked == True,
                models.Submission.submitted_at >= now.replace(hour=0, minute=0, second=0, microsecond=0)
            ).first()

            if not completed_today:
                if time_of_day == "morning":
                    title = "Morning Reminder"
                    message = "📚 Good Morning! It's time to begin your internship tasks today. Complete your lesson, MCQ, and coding assignment to maintain your learning streak."
                elif time_of_day == "afternoon":
                    title = "Afternoon Reminder"
                    message = "⏰ Reminder! You haven't completed today's internship tasks yet. Finish your activities before the deadline to avoid being marked absent."
                elif time_of_day == "evening":
                    title = "Final Reminder"
                    message = "⚠️ Final Reminder! Today is almost over. Complete your lesson, MCQ, and coding assignment before the deadline. Otherwise, today's attendance will be marked as Absent."
                else:
                    continue

                reminder = models.Notification(
                    user_id=intern.id,
                    title=title,
                    message=message,
                    type="daily_reminder"
                )
                db.add(reminder)
        db.commit()
    except Exception as e:
        print(f"Error sending {time_of_day} reminders: {e}")
    finally:
        db.close()


def process_end_of_day_deadline():
    db = database.SessionLocal()
    try:
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        now = datetime.utcnow()
        for intern in interns:
            completed_today = db.query(models.Submission).filter(
                models.Submission.intern_id == intern.id,
                models.Submission.attendance_marked == True,
                models.Submission.submitted_at >= now.replace(hour=0, minute=0, second=0, microsecond=0)
            ).first()

            if not completed_today:
                intern.learning_streak = 0
                db.add(models.AttendanceLog(intern_id=intern.id, status="absent", note="Failed to submit daily task before deadline"))
                
                reminder = models.Notification(
                    user_id=intern.id,
                    title="Deadline Missed",
                    message="Today's deadline has passed. Your attendance has been marked as Absent and your learning streak was reset.",
                    type="system"
                )
                db.add(reminder)
        db.commit()
    except Exception as e:
        print(f"Error processing end of day deadline: {e}")
    finally:
        db.close()


@app.on_event("startup")
def start_scheduler():
    scheduler = BackgroundScheduler()
    # UTC times mapped from IST: 9 AM IST = 3:30 AM UTC, 2 PM IST = 8:30 AM UTC, 7 PM IST = 1:30 PM UTC
    scheduler.add_job(send_daily_reminders, 'cron', hour=3, minute=30, args=["morning"])
    scheduler.add_job(send_daily_reminders, 'cron', hour=8, minute=30, args=["afternoon"])
    scheduler.add_job(send_daily_reminders, 'cron', hour=13, minute=30, args=["evening"])
    # 11:59 PM IST = 6:29 PM UTC
    scheduler.add_job(process_end_of_day_deadline, 'cron', hour=18, minute=29)
    scheduler.start()


@app.get("/certificate/verify/{certificate_id}")
def verify_certificate(
    certificate_id: str,
    db: Session = Depends(database.get_db)
):
    cert = db.query(models.Certificate).filter(models.Certificate.certificate_id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    intern = db.query(models.User).filter(models.User.id == cert.intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found for certificate")

    domain = db.query(models.Domain).filter(models.Domain.id == intern.domain_id).first()
    mentor = db.query(models.User).filter(models.User.id == intern.mentor_id).first()

    return {
        "certificate_id": cert.certificate_id,
        "intern_name": intern.name,
        "intern_id": intern.intern_id,
        "college": intern.college,
        "domain": domain.name if domain else "Tech domain",
        "mentor_name": mentor.name if mentor else "Lead Mentor",
        "grade": cert.grade,
        "final_score": cert.final_score,
        "issued_at": cert.generated_at.strftime("%Y-%m-%d")
    }


# ==========================================
#      BACKWARD COMPATIBILITY ENDPOINTS
# ==========================================

@app.post("/internships", status_code=status.HTTP_201_CREATED)
def create_internship(
    internship_data: schemas.InternshipCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_internship = models.Internship(
        title=internship_data.title,
        company_name=internship_data.company_name,
        description=internship_data.description,
        location=internship_data.location,
        stipend=internship_data.stipend,
        posted_by=current_user.id
    )
    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)
    return {"message": "Internship posted", "internship_id": new_internship.id}


@app.get("/internships")
def get_all_internships(db: Session = Depends(database.get_db)):
    return db.query(models.Internship).all()


@app.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_internship(
    application_data: schemas.ApplicationCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_application = models.Application(
        internship_id=application_data.internship_id,
        user_id=current_user.id,
        resume_url=application_data.resume_url,
        status="Pending"
    )
    db.add(new_application)
    db.commit()
    return {"message": "Application submitted"}
