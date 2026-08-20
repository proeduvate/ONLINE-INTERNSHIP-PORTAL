import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Enum, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
try:
    from database import Base
except ImportError:
    from .database import Base

# ==========================================
#          USER ROLE ENUMERATION
# ==========================================

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MENTOR = "mentor"
    INTERN = "intern"
    RECRUITER = "recruiter"

# ==========================================
#          SQLALCHEMY DATABASE MODELS
# ==========================================

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="batch")


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column("full_name", String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.INTERN)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Intern specific profile fields
    intern_id = Column(String(50), nullable=True)
    college = Column(String(100), nullable=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    attendance_pct = Column(Integer, default=0)
    progress_pct = Column(Integer, default=0)
    learning_streak = Column(Integer, default=0)
    last_task_completion_date = Column(DateTime, nullable=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)

    # Relationships
    applications = relationship("Application", back_populates="applicant")
    domain = relationship("Domain", back_populates="users")
    batch = relationship("Batch", back_populates="users")
    
    # Self-referencing relationship for Mentor -> Interns
    interns = relationship("User", backref="mentor", remote_side=[id])
    
    submissions = relationship("Submission", back_populates="intern")
    certificates = relationship("Certificate", back_populates="intern")


class Domain(Base):
    __tablename__ = "domains"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="domain")
    tasks = relationship("Task", back_populates="domain")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    day_number = Column(Integer, nullable=False) # 1 to 30
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Learning content
    video_url = Column(String(255), nullable=True)
    document_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    resources = Column(Text, nullable=True) # comma-separated links or descriptions
    
    # Assessment
    mcq_questions = Column(Text, nullable=True) # JSON String representing questions and answers
    coding_prompt = Column(Text, nullable=True)
    coding_solution = Column(Text, nullable=True)
    test_cases = Column(Text, nullable=True) # JSON String representing inputs and expected outputs
    deadline_days = Column(Integer, default=1) # deadline in days from start date or unlock
    
    # Relationships
    domain = relationship("Domain", back_populates="tasks")
    submissions = relationship("Submission", back_populates="task")


class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    status = Column(String(50), default="submitted") # "not_started", "in_progress", "submitted", "approved"
    
    code_submission = Column(Text, nullable=True)
    mcq_answers = Column(Text, nullable=True) # JSON String of user answers
    
    # Scoring components
    mcq_score = Column(Integer, default=0)
    ai_score = Column(Integer, default=0)
    ai_feedback = Column(Text, nullable=True) # JSON string or free text
    mentor_score = Column(Integer, default=0)
    mentor_feedback = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    attendance_marked = Column(Boolean, default=False)
    
    # Relationships
    intern = relationship("User", back_populates="submissions")
    task = relationship("Task", back_populates="submissions")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    file_url = Column(String(255), nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    log_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="present")
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    target_role = Column(String(20), nullable=True, default="all")
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False) # e.g. "daily_reminder", "motivation", "attendance", "system"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="notifications")


class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    room_code = Column(String(100), nullable=False, unique=True)
    status = Column(String(50), default="active") # "active", "completed"
    created_at = Column(DateTime, default=datetime.utcnow)


class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certificate_id = Column(String(100), nullable=False, unique=True)
    grade = Column(String(5), nullable=False) # e.g. "A+", "A", "B", "C"
    final_score = Column(Integer, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    intern = relationship("User", back_populates="certificates")


# Below models are left from previous database schema for safety
class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    company_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(100), nullable=False)
    stipend = Column(String(50), nullable=True)
    posted_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="internship")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_url = Column(String(255), nullable=True)
    status = Column(String(50), default="Pending")
    applied_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    internship = relationship("Internship", back_populates="applications")
    applicant = relationship("User", back_populates="applications")
class OnboardingApplication(Base):
    __tablename__ = 'onboarding_applications'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    name = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    college = Column(String(100))
    department = Column(String(100))
    degree = Column(String(50))
    graduation_year = Column(Integer)
    domain = Column(String(100))
    resume_url = Column(String(255))
    status = Column(String(50), default='PENDING_REVIEW')
    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================================
#    TICKET / SUPPORT SYSTEM ENUMS
# ==========================================

class TicketStatus(str, enum.Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# ==========================================
#    DAILY QUESTION RESULT MODEL
# ==========================================

class DailyQuestionResult(Base):
    __tablename__ = "daily_question_results"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, nullable=False)
    marks_obtained = Column(Integer, nullable=False, default=0)
    max_marks = Column(Integer, nullable=False, default=10)
    mcq_score = Column(Float, nullable=False, default=0.0)
    coding_score = Column(Float, nullable=False, default=0.0)
    final_score = Column(Float, nullable=False, default=0.0)
    attempted_at = Column(DateTime, default=datetime.utcnow)
    date = Column(Date, nullable=False)

    # Relationship (backref adds 'daily_question_results' to User automatically)
    intern = relationship("User", backref="daily_question_results")


# ==========================================
#    TICKET MODEL
# ==========================================

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    domain = Column(String(100), nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.OPEN)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution = Column(Text, nullable=True)

    closed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    closed_at = Column(DateTime, nullable=True)
    closure_reason = Column(Text, nullable=True)

    # Relationships (backrefs add 'tickets_created' and 'tickets_assigned' to User)
    creator = relationship("User", foreign_keys=[created_by], backref="tickets_created")
    assignee = relationship("User", foreign_keys=[assigned_to], backref="tickets_assigned")
    resolver = relationship("User", foreign_keys=[resolved_by], backref="tickets_resolved")
    closer = relationship("User", foreign_keys=[closed_by], backref="tickets_closed")
    messages = relationship("TicketMessage", back_populates="ticket", order_by="TicketMessage.created_at")


# ==========================================
#    TICKET MESSAGE MODEL
# ==========================================

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User", backref="ticket_messages")

# ==========================================
#    TICKET HISTORY MODEL
# ==========================================

class TicketHistory(Base):
    __tablename__ = "ticket_history"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    old_status = Column(Enum(TicketStatus), nullable=True)
    new_status = Column(Enum(TicketStatus), nullable=True)
    metadata_json = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", backref="history")
    actor = relationship("User", backref="ticket_actions")

    @property
    def parsed_metadata(self):
        if not self.metadata_json:
            return None
        import json
        try:
            return json.loads(self.metadata_json)
        except:
            return {}


# ==========================================
#    AIRDROP / BONUS SYSTEM MODELS
# ==========================================

class BonusAirdrop(Base):
    __tablename__ = "bonus_airdrops"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    domain = Column(String(100), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    time_limit = Column(Integer, nullable=False) # in seconds
    bonus_points = Column(Integer, nullable=False)
    winner_count = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="PUBLISHED") # PUBLISHED, FINALIZED
    finalized_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AirdropAttempt(Base):
    __tablename__ = "airdrop_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    airdrop_id = Column(Integer, ForeignKey("bonus_airdrops.id"), nullable=False)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    status = Column(String(50), default="started") # started, submitted, disqualified


class AirdropResult(Base):
    __tablename__ = "airdrop_results"
    
    id = Column(Integer, primary_key=True, index=True)
    airdrop_id = Column(Integer, ForeignKey("bonus_airdrops.id"), nullable=False)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rank = Column(Integer, nullable=True)
    completion_time = Column(Integer, nullable=True) # in seconds
    bonus_points = Column(Integer, default=0)
    is_winner = Column(Boolean, default=False)


# ==========================================
#    POINT TRANSACTION MODEL
# ==========================================

class PointTransaction(Base):
    __tablename__ = "point_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False)
    source_type = Column(String(50), nullable=False) # e.g. "BONUS_AIRDROP"
    source_id = Column(Integer, nullable=True) # e.g. airdrop_id
    reason = Column(String(255), nullable=True)
    awarded_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================================
#    DOMAIN FACTS MODEL
# ==========================================

class DomainFact(Base):
    __tablename__ = "domain_facts"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(100), nullable=False, index=True)
    fact = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InternFactHistory(Base):
    __tablename__ = "intern_fact_history"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    fact_id = Column(Integer, ForeignKey("domain_facts.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
