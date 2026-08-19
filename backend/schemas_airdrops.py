from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class AirdropAction(str, Enum):
    START = "start"
    SUBMIT = "submit"

class AirdropCreate(BaseModel):
    question: str = Field(..., description="The challenge problem")
    correct_answer: str = Field(..., description="The correct answer to validate against")
    domain: str = Field(..., description="Domain e.g., AI/ML")
    batch_id: int = Field(..., description="Target batch ID")
    time_limit: int = Field(..., description="Time limit in seconds")
    bonus_points: int = Field(..., description="Bonus points for winners")
    winner_count: int = Field(..., description="Number of students that win")

class AirdropPatchRequest(BaseModel):
    action: AirdropAction = Field(..., description="Action to perform")
    # Only used when action == "submit"
    answer: Optional[str] = Field(None, description="The intern's submitted answer")

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
    rank: Optional[int]
    completion_time: Optional[int]
    bonus_points: int
    is_winner: bool
    
    class Config:
        from_attributes = True

class AirdropResponse(BaseModel):
    id: int
    question: str
    domain: str
    batch_id: int
    time_limit: int
    bonus_points: int
    winner_count: int
    start_time: datetime
    start_time_ist: Optional[str] = None
    end_time: Optional[datetime]
    end_time_ist: Optional[str] = None
    status: str
    finalized_at: Optional[datetime]
    created_at: datetime
    
    # Nested data
    attempts: List[AirdropAttemptResponse] = []
    results: List[AirdropResultResponse] = []
    
    # Optionally, we can inject calculated stats
    eligible_count: Optional[int] = None

    class Config:
        from_attributes = True
