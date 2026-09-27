import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    JSON,
)
from sqlalchemy.orm import relationship

# Safe Base import supporting both package structures
try:
    from app.db.base_class import Base
except ImportError:
    try:
        from backend.app.db.base_class import Base
    except ImportError:
        from sqlalchemy.orm import declarative_base
        Base = declarative_base()


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MENTOR = "mentor"
    INTERN = "intern"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Batch(Base):
    __tablename__ = "batches"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    domain = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="batch")


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="intern", nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def name(self):
        return self.full_name or self.username or self.email

    # Relationships
    batch = relationship("Batch", back_populates="users")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    tickets_created = relationship("Ticket", foreign_keys="[Ticket.created_by_id]", back_populates="creator")
    tickets_assigned = relationship("Ticket", foreign_keys="[Ticket.assigned_to_id]", back_populates="assignee")


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default=TicketStatus.OPEN.value)
    priority = Column(String, default=TicketPriority.MEDIUM.value)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by_id], back_populates="tickets_created")
    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="tickets_assigned")


class Certificate(Base):
    __tablename__ = "certificates"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String, unique=True, index=True, nullable=False)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    intern_name = Column(String, nullable=True)
    domain = Column(String, nullable=False)
    duration = Column(String, default="1 Month")
    achievement = Column(String, nullable=True)
    status = Column(String, default="APPROVED")
    grade = Column(String, nullable=True)
    final_score = Column(Integer, nullable=True, default=91)
    pdf_path = Column(String, nullable=True)
    issued_date = Column(DateTime, default=datetime.utcnow, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="certificates")

    @property
    def user_id(self):
        return self.intern_id

    @user_id.setter
    def user_id(self, value):
        self.intern_id = value

    @property
    def score(self):
        return float(self.final_score if self.final_score is not None else 91.0)

    @score.setter
    def score(self, value):
        self.final_score = int(value) if value is not None else 0

    @property
    def issue_date(self):
        if self.issued_date:
            if hasattr(self.issued_date, "strftime"):
                return self.issued_date.strftime("%d %B %Y").upper()
            return str(self.issued_date)
        return ""

    @issue_date.setter
    def issue_date(self, value):
        if isinstance(value, datetime):
            self.issued_date = value
        elif isinstance(value, str) and value:
            try:
                self.issued_date = datetime.strptime(value, "%d %B %Y")
            except Exception:
                try:
                    self.issued_date = datetime.strptime(value, "%Y-%m-%d")
                except Exception:
                    pass


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String, nullable=True)
    day_number = Column(Integer, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    room_code = Column(String, nullable=True)
    status = Column(String, default="Scheduled")
    scheduled_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def meeting_url(self):
        return f"/room/{self.room_code}" if self.room_code else None


class Submission(Base):
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


# Import additional models from backend.models if available
try:
    from backend.models import (
        BonusAirdrop,
        DailyScenario,
        DailyQuestionResult,
        TicketMessage,
        TicketHistory,
        AirdropAttempt,
        AirdropResult,
        PointTransaction,
        DomainFact,
        InternFactHistory,
        ScenarioHistory,
        GitHubRepositoryRequest,
        AttendanceLog,
        Announcement,
        BreakoutRoom,
        Internship,
        Application,
        OnboardingApplication,
    )
except ImportError:
    try:
        from models import (
            BonusAirdrop,
            DailyScenario,
            DailyQuestionResult,
            TicketMessage,
            TicketHistory,
            AirdropAttempt,
            AirdropResult,
            PointTransaction,
            DomainFact,
            InternFactHistory,
            ScenarioHistory,
            GitHubRepositoryRequest,
            AttendanceLog,
            Announcement,
            BreakoutRoom,
            Internship,
            Application,
            OnboardingApplication,
        )
    except ImportError:
        pass
