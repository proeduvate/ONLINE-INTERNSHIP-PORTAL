from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class DomainFactResponse(BaseModel):
    id: int
    domain: str
    fact: str
    seen: bool = False

    class Config:
        from_attributes = True

class FactCompletedResponse(BaseModel):
    message: str
    completed: bool
