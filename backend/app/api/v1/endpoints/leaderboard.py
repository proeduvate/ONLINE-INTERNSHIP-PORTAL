from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from app import models
import app.schemas.leaderboard as schemas_leaderboard
from app.db.session import get_db

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)

@router.get("", response_model=List[schemas_leaderboard.LeaderboardEntry])
def get_leaderboard(
    batch_id: Optional[int] = Query(None, description="Filter by Batch ID"),
    period: str = Query("all", description="Filter by period: 'weekly', 'monthly', or 'all'"),
    db: Session = Depends(get_db)
):
    users_query = db.query(models.User).filter(models.User.role == models.UserRole.INTERN)
    if batch_id is not None:
        users_query = users_query.filter(models.User.batch_id == batch_id)
    
    users = users_query.all()
    
    now = datetime.utcnow()
    start_date = None
    if period.lower() == "weekly":
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period.lower() == "monthly":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    results = []
    for user in users:
        # 1. PointTransactions
        pt_query = db.query(func.sum(models.PointTransaction.points)).filter(models.PointTransaction.user_id == user.id)
        if start_date:
            pt_query = pt_query.filter(models.PointTransaction.created_at >= start_date)
        pt_points = pt_query.scalar() or 0
        
        # 2. Submissions (mcq_score + ai_score)
        sub_query = db.query(func.sum(models.Submission.mcq_score + models.Submission.ai_score)).filter(models.Submission.intern_id == user.id)
        if start_date:
            sub_query = sub_query.filter(models.Submission.submitted_at >= start_date)
        sub_points = sub_query.scalar() or 0
        
        # 3. Airdrop Results (bonus_points)
        air_query = db.query(func.sum(models.AirdropResult.bonus_points)).filter(models.AirdropResult.intern_id == user.id)
        # Note: AirdropResult has no created_at, so we include them globally. 
        # Alternatively, we could join with BonusAirdrop to get published_at, but this is fine.
        air_points = air_query.scalar() or 0
        
        total = pt_points + sub_points + air_points
        
        batch_name = user.batch.name if user.batch else None
        domain_name = user.domain.name if user.domain else None
        
        results.append({
            "user_id": user.id,
            "user_name": user.name,
            "batch_name": batch_name,
            "domain": domain_name,
            "total_points": total
        })

    # Sort results by points descending, then user_id ascending (deterministic)
    results.sort(key=lambda x: (-x["total_points"], x["user_id"]))
    
    # Format response with ranks
    response = []
    for rank, row in enumerate(results, start=1):
        # We can optimize to not return 0 point users, or return all. The original returned joined ones.
        # If we only want to show users with points:
        if row["total_points"] > 0:
            response.append(
                schemas_leaderboard.LeaderboardEntry(
                    rank=len(response) + 1,
                    user_id=row["user_id"],
                    user_name=row["user_name"],
                    batch=row["batch_name"],
                    domain=row["domain"],
                    total_points=row["total_points"]
                )
            )

    return response
