import datetime as dt
from typing import Dict, Any
from pydantic import BaseModel, EmailStr, Field
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
    start_date: Optional[str] = None  # format YYYY-MM-DD
    end_date: Optional[str] = None    # format YYYY-MM-DD

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
#           DOMAIN SCHEMAS
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
#           TASK SCHEMAS
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
    mcq_questions: Optional[str] = None   # JSON string
    coding_prompt: Optional[str] = None
    coding_solution: Optional[str] = None
    test_cases: Optional[str] = None       # JSON string
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

# ==========================================
#           SUBMISSION SCHEMAS
# ==========================================

class SubmissionCreate(BaseModel):
    task_id: int
    code_submission: Optional[str] = None
    mcq_answers: Optional[str] = None   # JSON string representing answers

class SubmissionEvaluate(BaseModel):
    mentor_score: int
    mentor_feedback: str

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
    test_case_results: List[dict]
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    successful: bool

    class Config:
        from_attributes = True

# ==========================================
#           MESSAGE SCHEMAS
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
#     MEETING & BREAKOUT ROOM SCHEMAS
# ==========================================

class BreakoutRoomBase(BaseModel):
    title: str
    max_participants: Optional[int] = 10

class BreakoutRoomCreate(BreakoutRoomBase):
    meeting_id: int

class BreakoutRoomResponse(BreakoutRoomBase):
    id: int
    meeting_id: int
    room_code: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingBase(BaseModel):
    title: str
    scheduled_time: Optional[datetime] = None
    duration_minutes: Optional[int] = 60
    room_code: Optional[str] = "main-room"
    status: Optional[str] = "active"


class MeetingCreate(MeetingBase):
    pass

class MeetingResponse(MeetingBase):
    id: int
    mentor_id: int
    room_code: str
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None
    breakout_rooms: List[BreakoutRoomResponse] = []

    class Config:
        from_attributes = True

# ==========================================
#           CERTIFICATE SCHEMAS
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
#        NOTIFICATION SCHEMAS
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
#     INTERNSHIP / APPLICATION SCHEMAS
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

# ==========================================
#     BONUS AIRDROP & DAILY SCENARIOS
# ==========================================

class Config:
        from_attributes = True

class Config:
        from_attributes = True
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BonusAirdropBase(BaseModel):
    title: str
    description: str
    claim_code: Optional[str] = None
    is_active: Optional[bool] = True

class Config:
        from_attributes = True

class DailyScenarioBase(BaseModel):
    title: str
    description: str

class Config:
        from_attributes = True


# --- CERTIFICATES ---
from datetime import datetime

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
    pdf_path: Optional[str] = None
    issued_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class SimulationChoice(BaseModel):
    id: str
    text: str

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

class SimulationScenarioResponse(BaseModel):
    day: int
    simulation_title: str
    scenario_number: int
    scenario_id: str
    total_scenarios: int
    situation: str
    question: str
    choices: List[SimulationChoice]


# ==========================================
# Appended from airdrops.py
# ==========================================


# ==========================================
#    ENUMS
# ==========================================

class TaskType(str, Enum):
    MCQ = "mcq"
    PATTERN = "pattern"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    MATCH = "match"
    ARRANGE = "arrange"
    CODE_OUTPUT_MCQ = "code_output_mcq"

class StartMode(str, Enum):
    FIXED = "fixed"
    FLEXIBLE = "flexible"

class AirdropStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    FINALIZED = "FINALIZED"

class AirdropAction(str, Enum):
    START = "start"
    SUBMIT = "submit"

# ==========================================
#    TASK CONFIG SCHEMAS (For JSON validation)
# ==========================================

class McqConfig(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class PatternConfig(BaseModel):
    question: str
    correct_answer: str

class TrueFalseConfig(BaseModel):
    statement: str
    correct_answer: bool

class MatchConfig(BaseModel):
    pairs: Dict[str, str]

class ArrangeConfig(BaseModel):
    items: List[str]
    correct_order: List[str]

class CodeOutputMcqConfig(BaseModel):
    language: str
    code: str
    options: List[str]
    correct_answer: str

# Helper to validate incoming config based on task type
# In practice, this can be handled via Pydantic Discriminated Unions if needed,
# or we just rely on Dict[str, Any] at the top level and validate dynamically.

# ==========================================
#    API SCHEMAS
# ==========================================

class AirdropCreate(BaseModel):
    title: str = Field(..., description="Title of the airdrop")
    description: Optional[str] = Field(None, description="Description")
    
    task_type: TaskType = Field(..., description="Type of task")
    task_config: Dict[str, Any] = Field(..., description="JSON config for the task")
    
    domain: Optional[str] = Field(None, description="Domain filter")
    batch_id: Optional[int] = Field(None, description="Batch filter")
    
    start_mode: StartMode = Field(..., description="fixed or flexible")
    time_limit: int = Field(..., description="Duration in seconds")
    start_time: Optional[datetime] = Field(None, description="Required for fixed start")
    bonus_points: int = Field(100, description="Deprecated, use points_distribution")
    points_distribution: str = Field(..., description="Comma separated points (e.g. 100,50,25)")
    winner_count: int = Field(..., description="Number of exact winners")

class AirdropPatchRequest(BaseModel):
    action: AirdropAction = Field(..., description="Action to perform (start or submit)")
    answer: Optional[Any] = Field(None, description="Submitted answer")

class AirdropAttemptResponse(BaseModel):
    id: int
    airdrop_id: int
    intern_id: int
    started_at: datetime
    completed_at: Optional[datetime]
    started_at_ist: Optional[str] = None
    completed_at_ist: Optional[str] = None
    is_correct: Optional[bool]
    status: str
    
    class Config:
        from_attributes = True

class AirdropResultResponse(BaseModel):
    id: int
    airdrop_id: int
    intern_id: int
    intern_name: Optional[str] = None
    rank: Optional[int]
    completion_time: Optional[int]
    bonus_points: int
    is_winner: bool
    
    class Config:
        from_attributes = True

class AirdropResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    task_type: str
    task_config: Dict[str, Any] # Will be converted from string automatically in router
    domain: Optional[str] = None
    batch_id: Optional[int] = None
    start_mode: str
    time_limit: int
    start_time: Optional[datetime] = None
    start_time_ist: Optional[str] = None
    points_distribution: str
    winner_count: int
    status: str
    created_by: int
    rejection_reason: Optional[str] = None
    published_at: Optional[datetime] = None
    finalized_at: Optional[datetime] = None
    created_at: datetime
    
    # Nested data
    attempts: List[AirdropAttemptResponse] = []
    results: List[AirdropResultResponse] = []
    
    class Config:
        from_attributes = True

# ==========================================
# Appended from analytics.py
# ==========================================

"""
Pydantic schemas for Daily Question Analytics module.
"""


# ==========================================
#    DAILY QUESTION RESULT SCHEMAS
# ==========================================

class DailyQuestionResultCreate(BaseModel):
    """Schema for recording a daily question result."""
    question_id: int
    mcq_score: float = Field(..., ge=0, le=100, description="MCQ score obtained (0-100)")
    coding_score: float = Field(..., ge=0, le=100, description="Coding score obtained (0-100)")
    date: dt.date = Field(..., description="The date of the question (YYYY-MM-DD)")


class DailyQuestionResultResponse(BaseModel):
    """Schema for a single daily question result record."""
    id: int
    intern_id: int
    question_id: int
    mcq_score: float
    coding_score: float
    final_score: float
    attempted_at: dt.datetime
    date: dt.date

    class Config:
        from_attributes = True


# ==========================================
#    DAILY ANALYTICS RESPONSE SCHEMAS
# ==========================================

class DailyMarksDataPoint(BaseModel):
    """A single data point for the daily marks line chart."""
    date: dt.date
    mcq_score: float
    coding_score: float
    final_score: float


# ==========================================
# Appended from auth.py
# ==========================================



# ==========================================
# Appended from facts.py
# ==========================================


class DomainFactResponse(BaseModel):
    id: int
    domain: str
    fact: str
    seen: bool = False
    completed: bool = False

    class Config:
        from_attributes = True

class FactCompletedResponse(BaseModel):
    message: str
    completed: bool

# ==========================================
# Appended from leaderboard.py
# ==========================================


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    user_name: str
    batch: Optional[str] = None
    domain: Optional[str] = None
    total_points: int

    class Config:
        from_attributes = True

# ==========================================
# Appended from meeting.py
# ==========================================



# ==========================================
# Appended from tickets.py
# ==========================================

"""
Pydantic schemas for the Ticket / Support System module.
"""


# ==========================================
#    TICKET ENUMS (for schema validation)
# ==========================================




class TicketStatusSchema(str, Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# ==========================================
#    TICKET CREATE / UPDATE SCHEMAS
# ==========================================

class TicketCreate(BaseModel):
    """Schema for creating a new support ticket."""
    title: str = Field(..., min_length=1, max_length=200, description="Brief summary of the issue")
    description: str = Field(..., min_length=1, description="Detailed description of the issue")
    domain: str = Field(..., min_length=1, max_length=100, description="Domain of the issue")


class TicketAction(str, Enum):
    ASSIGN = "assign"
    MESSAGE = "message"
    RESOLVE = "resolve"
    CLOSE = "close"

class TicketPatchRequest(BaseModel):
    """Unified schema for updating a ticket (assign, message, resolve, close)."""
    action: TicketAction = Field(..., description="The action to perform on the ticket")
    
    # Fields used depending on the action:
    assigned_to: Optional[int] = Field(None, description="User ID to assign the ticket to (for action='assign')")
    message: Optional[str] = Field(None, description="Message content (for action='message')")
    resolution: Optional[str] = Field(None, description="Resolution details (for action='resolve')")
    closure_reason: Optional[str] = Field(None, description="Reason for closure (for action='close')")


class TicketMessageResponse(BaseModel):
    """Schema for a ticket message in responses."""
    id: int
    ticket_id: int
    sender_id: int
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
#    TICKET RESPONSE SCHEMAS
# ==========================================

class TicketResponse(BaseModel):
    """Schema for a ticket in list responses."""
    id: int
    created_by: int
    creator_name: Optional[str] = None
    assigned_to: Optional[int] = None
    assignee_name: Optional[str] = None
    title: str
    description: str
    domain: str
    status: TicketStatusSchema
    created_at: datetime
    updated_at: datetime
    
    resolved_by: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolution: Optional[str] = None
    
    closed_by: Optional[int] = None
    closed_at: Optional[datetime] = None
    closure_reason: Optional[str] = None
    
    messages: List[TicketMessageResponse] = []

    class Config:
        from_attributes = True


class TicketHistoryResponse(BaseModel):
    """Schema for ticket history."""
    id: int
    ticket_id: int
    actor_id: int
    actor_name: Optional[str] = None
    action: str
    old_status: Optional[TicketStatusSchema] = None
    new_status: Optional[TicketStatusSchema] = None
    parsed_metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    created_at: datetime

    def __init__(self, **data):
        if "metadata_json" in data and data["metadata_json"]:
            try:
                data["parsed_metadata"] = json.loads(data["metadata_json"])
            except:
                data["parsed_metadata"] = {}
        super().__init__(**data)

    class Config:
        from_attributes = True

# ==========================================
# Appended from user.py
# ==========================================

