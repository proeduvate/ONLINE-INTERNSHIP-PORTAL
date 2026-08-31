from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum

# ==========================================
#    ENUMS
# ==========================================

class TaskType(str, Enum):
    MCQ = "mcq"
    PATTERN = "pattern"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    MATCH = "match"
    ARRANGE = "arrange"
    CODE_OUTPUT_MCQ = "code_output_mcq"

class StartMode(str, Enum):
    FIXED = "fixed"
    FLEXIBLE = "flexible"

class AirdropStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    FINALIZED = "FINALIZED"

class AirdropAction(str, Enum):
    START = "start"
    SUBMIT = "submit"

# ==========================================
#    TASK CONFIG SCHEMAS (For JSON validation)
# ==========================================

class McqConfig(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class PatternConfig(BaseModel):
    question: str
    correct_answer: str

class TrueFalseConfig(BaseModel):
    statement: str
    correct_answer: bool

class MatchConfig(BaseModel):
    pairs: Dict[str, str]

class ArrangeConfig(BaseModel):
    items: List[str]
    correct_order: List[str]

class CodeOutputMcqConfig(BaseModel):
    language: str
    code: str
    options: List[str]
    correct_answer: str

# Helper to validate incoming config based on task type
# In practice, this can be handled via Pydantic Discriminated Unions if needed,
# or we just rely on Dict[str, Any] at the top level and validate dynamically.

# ==========================================
#    API SCHEMAS
# ==========================================

class AirdropCreate(BaseModel):
    title: str = Field(..., description="Title of the airdrop")
    description: Optional[str] = Field(None, description="Description")
    
    task_type: TaskType = Field(..., description="Type of task")
    task_config: Dict[str, Any] = Field(..., description="JSON config for the task")
    
    domain: Optional[str] = Field(None, description="Domain filter")
    batch_id: Optional[int] = Field(None, description="Batch filter")
    
    start_mode: StartMode = Field(..., description="fixed or flexible")
    time_limit: int = Field(..., description="Duration in seconds")
    start_time: Optional[datetime] = Field(None, description="Required for fixed start")
    bonus_points: int = Field(100, description="Deprecated, use points_distribution")
    points_distribution: str = Field(..., description="Comma separated points (e.g. 100,50,25)")
    winner_count: int = Field(..., description="Number of exact winners")

class AirdropPatchRequest(BaseModel):
    action: AirdropAction = Field(..., description="Action to perform (start or submit)")
    answer: Optional[Any] = Field(None, description="Submitted answer")

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
    intern_name: Optional[str] = None
    rank: Optional[int]
    completion_time: Optional[int]
    bonus_points: int
    is_winner: bool
    
    class Config:
        from_attributes = True

class AirdropResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    task_type: str
    task_config: Dict[str, Any] # Will be converted from string automatically in router
    domain: Optional[str] = None
    batch_id: Optional[int] = None
    start_mode: str
    time_limit: int
    start_time: Optional[datetime] = None
    start_time_ist: Optional[str] = None
    points_distribution: str
    winner_count: int
    status: str
    created_by: int
    rejection_reason: Optional[str] = None
    published_at: Optional[datetime] = None
    finalized_at: Optional[datetime] = None
    created_at: datetime
    
    # Nested data
    attempts: List[AirdropAttemptResponse] = []
    results: List[AirdropResultResponse] = []
    
    class Config:
        from_attributes = True
