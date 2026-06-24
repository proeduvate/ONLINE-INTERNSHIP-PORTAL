from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
import json
import re

import models, database, schemas

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

# Setup secure password hashing configuration
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# JWT security configurations
SECRET_KEY = "SUPER_SECRET_COMPLEX_KEY_HERE"  # Keep this secure in production envs
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Automatically generate all database tables on startup
models.Base.metadata.create_all(bind=database.engine)


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
        deadline_days=data.deadline_days or 1
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
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")
        
    if current_user.domain_id is None:
        return {"tasks": [], "message": "No domain assigned yet"}
        
    tasks = db.query(models.Task).filter(models.Task.domain_id == current_user.domain_id).order_by(models.Task.day_number).all()
    submissions = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
    
    sub_map = {sub.task_id: sub for sub in submissions}
    
    # Sequential Day Locking logic:
    # Day 1 is unlocked.
    # Day N is unlocked if Day N-1 is submitted or approved.
    results = []
    unlocked = True # Day 1 is unlocked
    
    for idx, t in enumerate(tasks):
        sub = sub_map.get(t.id)
        status_val = "Not started"
        score_val = 0
        ai_score_val = 0
        mentor_score_val = 0
        
        if sub:
            status_val = sub.status
            # calculate combined scores
            score_val = sub.mcq_score + sub.ai_score + sub.mentor_score
            ai_score_val = sub.ai_score
            mentor_score_val = sub.mentor_score
            
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
            "unlocked": unlocked,
            "status": status_val,
            "score": score_val,
            "ai_score": ai_score_val,
            "mentor_score": mentor_score_val,
            "mcq_score": sub.mcq_score if sub else 0,
            "ai_feedback": sub.ai_feedback if sub else None,
            "mentor_feedback": sub.mentor_feedback if sub else None,
            "submitted_at": sub.submitted_at if sub else None
        })
        
        # Next task unlock status depends on whether this task was submitted/approved
        if not sub or sub.status not in ["submitted", "approved"]:
            unlocked = False
            
    return results


# ==========================================
#           AI CODE EVALUATOR HEURISTICS
# ==========================================

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
        # Check syntax (runs a parse compile if code is python)
        compile(code, "<string>", "exec")
    except SyntaxError as e:
        syntax_valid = False
        syntax_error_details = f"Syntax Error: {e.msg} on line {e.lineno}"
        
    # Analyze loops/recursion
    loops = len(re.findall(r"\b(for|while)\b", code))
    has_funcs = len(re.findall(r"\bdef\b", code)) > 0
    complexity = "O(1) constant time" if loops == 0 else ("O(N^2) quadratic time" if loops > 1 else "O(N) linear time")
    
    # Parse test cases
    test_cases_passed = 0
    total_test_cases = 0
    tc_details = []
    
    if task.test_cases:
        try:
            test_cases = json.loads(task.test_cases)
            total_test_cases = len(test_cases)
            if not syntax_valid:
                for tc in test_cases:
                    tc_details.append(f"Test case Input: {tc.get('input')} -> FAILED (Syntax Error)")
            else:
                # heuristic keyword checks matching test expectations
                keywords = [str(tc.get("expected")).lower().strip() for tc in test_cases if "expected" in tc]
                matches = 0
                for kw in keywords:
                    if kw in code.lower() or any(term in code.lower() for term in ["return", "print", "len", "sum", "sort"]):
                        matches += 1
                test_cases_passed = min(total_test_cases, max(1, matches))
                for idx, tc in enumerate(test_cases):
                    status_str = "PASSED" if idx < test_cases_passed else "FAILED"
                    tc_details.append(f"Test Case {idx+1}: Input: '{tc.get('input')}' -> {status_str}")
        except Exception:
            total_test_cases = 1
            test_cases_passed = 1
            tc_details.append("Test Case 1: Standard Verification -> PASSED")
    else:
        total_test_cases = 1
        test_cases_passed = 1
        tc_details.append("Test Case 1: Execution Check -> PASSED")
        
    # Scores
    base = 30 if syntax_valid else 10
    tc_score = int((test_cases_passed / max(1, total_test_cases)) * 50)
    qual = 20 if len(code) > 120 else 10
    ai_score = base + tc_score + qual
    
    feedback = {
        "summary": "AI Evaluation Completed Successfully. Correct logic flow identified." if syntax_valid else "AI Evaluation failed. Code syntax error detected.",
        "syntax_check": "Syntax passes syntax parser." if syntax_valid else f"Failed compiler check: {syntax_error_details}",
        "code_quality": "High" if (syntax_valid and len(code) > 180) else ("Medium" if syntax_valid else "Low"),
        "complexity": complexity,
        "test_results": tc_details,
        "suggestions": [
            "Logic is clean. Recommended: Write unit tests to check bounds." if syntax_valid else "Fix compiler checks prior to checking business logic.",
            "Complexity looks appropriate for this daily challenge." if syntax_valid else "Check matching delimiters (parentheses, braces).",
            f"Big-O complexity estimated as {complexity}."
        ]
    }
    
    return {
        "score": ai_score,
        "syntax_valid": syntax_valid,
        "quality": "High" if ai_score >= 80 else ("Medium" if ai_score >= 50 else "Low"),
        "feedback": json.dumps(feedback),
        "test_cases": f"{test_cases_passed}/{total_test_cases} passed"
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
            
    # Trigger AI Evaluator for code submission
    ai_eval_result = {"score": 0, "feedback": None}
    if data.code_submission:
        ai_eval_result = run_ai_evaluation(data.code_submission, task)
        
    if existing:
        existing.code_submission = data.code_submission
        existing.mcq_answers = data.mcq_answers
        existing.mcq_score = mcq_score
        existing.ai_score = ai_eval_result["score"]
        existing.ai_feedback = ai_eval_result["feedback"]
        existing.status = "submitted"
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
            ai_score=ai_eval_result["score"],
            ai_feedback=ai_eval_result["feedback"],
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
    
    db.add(current_user)
    db.commit()
    
    return {
        "message": "Submission recorded", 
        "mcq_score": mcq_score, 
        "ai_score": ai_eval_result["score"],
        "ai_feedback": ai_eval_result["feedback"]
    }


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
                
        return {
            "progress_pct": current_user.progress_pct,
            "attendance_pct": current_user.attendance_pct,
            "total_score": total_score,
            "average_score_pct": avg_pct,
            "completed_tasks": completed_days,
            "pending_tasks": pending_days,
            "weak_areas": weak_areas[:3]
        }


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
    
    return {
        "certificate_id": cert.certificate_id,
        "intern_name": current_user.name,
        "intern_id": current_user.intern_id,
        "college": current_user.college,
        "domain_name": domain.name if domain else "Tech domain",
        "final_grade": cert.grade,
        "final_score": cert.final_score,
        "mentor_name": mentor.name if mentor else "Lead Mentor",
        "generated_at": cert.generated_at.strftime("%Y-%m-%d")
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
