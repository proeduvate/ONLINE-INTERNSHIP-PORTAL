from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.analytics_session import Base

class AnalyticsBatch(Base):
    __tablename__ = "analytics_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InternAnalytics(Base):
    __tablename__ = "intern_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(String(50), index=True) # e.g., "INT001"
    name = Column(String(100), nullable=False)
    college = Column(String(100), nullable=True) # Matches Batch
    domain = Column(String(100), nullable=True)
    mentor = Column(String(100), nullable=True)
    progress_pct = Column(Float, default=0.0)
    attendance_pct = Column(Float, default=0.0)
    status = Column(String(50), default="Active")
