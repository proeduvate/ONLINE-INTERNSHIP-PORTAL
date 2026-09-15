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

    class Config:
        from_attributes = True
