"""
Pydantic schemas for Daily Question Analytics module.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
import datetime as dt


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

