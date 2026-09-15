from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    domain_name: str
    day_number: int
    title: str
    description: str
    difficulty: Optional[str] = "Medium"
    deadline_days: Optional[int] = 1

class TaskResponse(BaseModel):
    id: int
    domain_id: int
    day_number: int
    title: str
    description: str
    difficulty: Optional[str] = None
    deadline_days: Optional[int] = None
    resources: Optional[str] = None
    mcq_questions: Optional[str] = None
    coding_prompt: Optional[str] = None
    domain_name: Optional[str] = None
    task_type: Optional[str] = "curriculum"

    class Config:
        from_attributes = True
