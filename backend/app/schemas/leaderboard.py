from pydantic import BaseModel
from typing import Optional

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    user_name: str
    batch: Optional[str] = None
    domain: Optional[str] = None
    total_points: int

    class Config:
        from_attributes = True
