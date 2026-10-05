from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class DailyQuestionResultCreate(BaseModel):
    question_id: Optional[int] = 1
    mcq_score: int = 0
    coding_score: int = 0
    date: date

class DailyQuestionResultResponse(BaseModel):
    id: int
    intern_id: int
    question_id: Optional[int] = None
    mcq_score: int
    coding_score: int
    final_score: int
    date: date
    attempted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DailyMarksDataPoint(BaseModel):
    date: date
    mcq_score: int
    coding_score: int
    final_score: int

    class Config:
        from_attributes = True
