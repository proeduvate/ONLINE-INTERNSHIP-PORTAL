import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

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

    # Relationships
    applications = relationship("Application", back_populates="applicant")
    domain = relationship("Domain", back_populates="users")
    
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