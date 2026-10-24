from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class MCQOptionSchema(BaseModel):
    A: str
    B: str
    C: str
    D: str

class MCQQuestionSchema(BaseModel):
    id: str
    question: str
    options: Dict[str, str]

class MCQStartResponse(BaseModel):
    attempt_id: int
    day: int
    topic: str
    total_questions: int
    questions: List[MCQQuestionSchema]

class MCQSubmitRequest(BaseModel):
    attempt_id: int
    answers: Dict[str, str] = Field(..., description="Map of question_id to selected option (A/B/C/D)")

class MCQResultResponse(BaseModel):
    attempt_id: int
    day: int
    topic: str
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score: int
    percentage: float
    status: str
    started_at: datetime
    submitted_at: Optional[datetime]
