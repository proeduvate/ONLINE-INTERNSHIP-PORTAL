from pydantic import BaseModel
from typing import Optional, Dict

class ScoringConfigResponse(BaseModel):
    mcq_weight: float
    code_weight: float
    airdrop_weight: float
    mentor_weight: float
    grade_ranges: Dict[str, float]

class FinalEvaluationResponse(BaseModel):
    intern_id: int
    intern_name: str
    mcq_final_mark: Optional[float]
    code_final_mark: Optional[float]
    airdrop_final_mark: Optional[float]
    mentor_evaluation_mark: Optional[float]
    final_score: Optional[float]
    grade: Optional[str]
    is_completed: bool

class MentorEvaluationUpdate(BaseModel):
    mentor_evaluation_mark: float
