from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime

# Role alignment matching the model
class UserRole(str, Enum):
    ADMIN = "admin"
    MENTOR = "mentor"
    INTERN = "intern"
    RECRUITER = "recruiter"

# ==========================================
#        USER / AUTHENTICATION SCHEMAS
# ==========================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    github_repo_url: Optional[str] = None
    role: UserRole = UserRole.INTERN

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserOnboard(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    github_repo_url: Optional[str] = None
    college: Optional[str] = None
    domain_id: Optional[int] = None
    mentor_id: Optional[int] = None
    start_date: Optional[str] = None # format YYYY-MM-DD
    end_date: Optional[str] = None   # format YYYY-MM-DD

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime
    intern_id: Optional[str] = None
    github_repo_url: Optional[str] = None
    college: Optional[str] = None
    domain_id: Optional[int] = None
    mentor_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    attendance_pct: int
    progress_pct: int
    learning_streak: int = 0
    last_task_completion_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==========================================
#          DOMAIN SCHEMAS
# ==========================================

class DomainCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DomainResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# ==========================================
#          TASK SCHEMAS
# ==========================================

class TaskCreate(BaseModel):
    domain_id: int
    day_number: int
    title: str
    description: str
    video_url: Optional[str] = None
    document_url: Optional[str] = None
    notes: Optional[str] = None
    resources: Optional[str] = None
    mcq_questions: Optional[str] = None  # JSON string
    coding_prompt: Optional[str] = None
    coding_solution: Optional[str] = None
    test_cases: Optional[str] = None      # JSON string
    deadline_days: Optional[int] = 1
    batch_id: Optional[int] = None
    difficulty: Optional[str] = "medium"
    task_type: Optional[str] = "coding"
    instructions: Optional[str] = None
    expected_outcome: Optional[str] = None
    is_active: Optional[bool] = True

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
    batch_id: Optional[int] = None
    difficulty: str
    task_type: str
    instructions: Optional[str] = None
    expected_outcome: Optional[str] = None
    created_by: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True

# ==========================================
#          SUBMISSION SCHEMAS
# ==========================================

class SubmissionCreate(BaseModel):
    task_id: int
    code_submission: Optional[str] = None
    mcq_answers: Optional[str] = None  # JSON string representing answers
    language: Optional[str] = None
    filename: Optional[str] = None

class SubmissionEvaluate(BaseModel):
    mentor_score: int
    mentor_feedback: str

class SubmissionResponse(BaseModel):
    id: int
    intern_id: int
    task_id: int
    status: str
    filename: Optional[str] = None
    code_submission: Optional[str] = None
    mcq_answers: Optional[str] = None
    mcq_score: int
    ai_score: int
    ai_feedback: Optional[str] = None
    mentor_score: int
    mentor_feedback: Optional[str] = None
    submitted_at: datetime
    started_at: Optional[datetime] = None
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
    test_case_results: List[dict]
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    successful: bool

    class Config:
        from_attributes = True

# ==========================================
#          MESSAGE SCHEMAS
# ==========================================

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    file_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    file_url: Optional[str] = None
    sent_at: datetime

    class Config:
        from_attributes = True

# ==========================================
#          MEETING SCHEMAS
# ==========================================

class MeetingCreate(BaseModel):
    title: str
    room_code: str

class MeetingResponse(BaseModel):
    id: int
    mentor_id: int
    title: str
    room_code: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
#          CERTIFICATE SCHEMAS
# ==========================================

class CertificateResponse(BaseModel):
    id: int
    intern_id: int
    certificate_id: str
    grade: str
    final_score: int
    generated_at: datetime

    class Config:
        from_attributes = True


class CertificateInfoResponse(BaseModel):
    generated: bool
    certificate_id: Optional[str] = None
    intern_name: Optional[str] = None
    domain_name: Optional[str] = None
    mentor_name: Optional[str] = None
    final_grade: Optional[str] = None
    generated_at: Optional[str] = None

    class Config:
        from_attributes = True


class AttendanceLogResponse(BaseModel):
    id: int
    intern_id: int
    log_date: datetime
    status: str
    note: Optional[str] = None

    class Config:
        from_attributes = True


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_role: Optional[str] = "all"


class AnnouncementResponse(BaseModel):
    id: int
    sender_id: int
    title: str
    content: str
    target_role: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
#          NOTIFICATION SCHEMAS
# ==========================================

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: str

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioResponse(BaseModel):
    user_id: int
    name: str
    email: str
    college: Optional[str] = None
    domain: Optional[str] = None
    mentor: Optional[str] = None
    progress_pct: int
    attendance_pct: int
    total_score: int
    grade: str
    submissions: List[dict]

    class Config:
        from_attributes = True

# ==========================================
#          INTERNSHIP / APPLICATION SCHEMAS
# ==========================================

class InternshipCreate(BaseModel):
    title: str
    company_name: str
    description: str
    location: str
    stipend: Optional[str] = None

class ApplicationCreate(BaseModel):
    internship_id: int
    user_id: int
    resume_url: Optional[str] = None

class OnboardingApplicationCreate(BaseModel):
    name: str
    email: str
    phone: str
    college: str
    department: str
    degree: str
    graduation_year: int
    domain: str
    resume_url: Optional[str] = None
    github_repo_url: Optional[str] = None


# ==========================================
#          SIMULATION SCHEMAS
# ==========================================

class SimulationChoice(BaseModel):
    id: str
    text: str

class SimulationScenarioResponse(BaseModel):
    day: int
    simulation_title: str
    scenario_number: int
    scenario_id: str
    total_scenarios: int
    situation: str
    question: str
    choices: List[SimulationChoice]

class SimulationDecision(BaseModel):
    scenario_id: str
    choice_id: str

class SimulationDecisionResponse(BaseModel):
    selected_choice: str
    feedback_type: Optional[str] = None
    feedback: Optional[str] = None
    consequence: str
    next_scenario: Optional[str] = None
    day_completed: bool


