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
    marks_obtained: int = Field(..., ge=0, description="Marks scored by the intern")
    max_marks: int = Field(..., ge=1, description="Maximum possible marks for this question")
    date: dt.date = Field(..., description="The date of the question (YYYY-MM-DD)")


class DailyQuestionResultResponse(BaseModel):
    """Schema for a single daily question result record."""
    id: int
    intern_id: int
    question_id: int
    marks_obtained: int
    max_marks: int
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
    marks: int
    max_marks: int


class DailyAnalyticsSummary(BaseModel):
    """Summary statistics for an intern's daily question performance."""
    intern_id: int
    total_days: int
    total_marks: int
    total_max_marks: int
    average_marks: float
    highest_daily_marks: int
    lowest_daily_marks: int
    data: List[DailyMarksDataPoint]
