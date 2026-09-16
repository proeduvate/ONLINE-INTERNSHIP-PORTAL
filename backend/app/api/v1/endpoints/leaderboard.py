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

from sqlalchemy.orm import Session, joinedload

@router.get("", response_model=List[schemas_leaderboard.LeaderboardEntry])
def get_leaderboard(
    batch_id: Optional[int] = Query(None, description="Filter by Batch ID"),
    period: str = Query("all", description="Filter by period: 'weekly', 'monthly', or 'all'"),
    db: Session = Depends(get_db)
):
    users_query = db.query(models.User).options(joinedload(models.User.batch), joinedload(models.User.domain)).filter(models.User.role == models.UserRole.INTERN)
    if batch_id is not None:
        users_query = users_query.filter(models.User.batch_id == batch_id)
    
    users = users_query.all()
    user_ids = [u.id for u in users]

    now = datetime.utcnow()
    start_date = None
    if period.lower() == "weekly":
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period.lower() == "monthly":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if not user_ids:
        return []

    # 1. PointTransactions
    pt_query = db.query(models.PointTransaction.user_id, func.sum(models.PointTransaction.points)).filter(models.PointTransaction.user_id.in_(user_ids))
    if start_date:
        pt_query = pt_query.filter(models.PointTransaction.created_at >= start_date)
    pt_data = {row[0]: row[1] or 0 for row in pt_query.group_by(models.PointTransaction.user_id).all()}

    # 2. Submissions (ai_score for code assessment/scenario)
    sub_query = db.query(models.Submission.intern_id, func.sum(models.Submission.ai_score)).filter(models.Submission.intern_id.in_(user_ids))
    if start_date:
        sub_query = sub_query.filter(models.Submission.submitted_at >= start_date)
    sub_data = {row[0]: row[1] or 0 for row in sub_query.group_by(models.Submission.intern_id).all()}

    # 2b. MCQ Assessment (score)
    mcq_query = db.query(models.MCQAttempt.intern_id, func.sum(models.MCQAttempt.score)).filter(models.MCQAttempt.intern_id.in_(user_ids))
    if start_date:
        mcq_query = mcq_query.filter(models.MCQAttempt.submitted_at >= start_date)
    mcq_data = {row[0]: row[1] or 0 for row in mcq_query.group_by(models.MCQAttempt.intern_id).all()}

    # 3. Airdrop Results (bonus_points)
    air_query = db.query(models.AirdropResult.intern_id, func.sum(models.AirdropResult.bonus_points)).filter(models.AirdropResult.intern_id.in_(user_ids))
    air_data = {row[0]: row[1] or 0 for row in air_query.group_by(models.AirdropResult.intern_id).all()}

    results = []
    for user in users:
        pt_points = pt_data.get(user.id, 0)
        sub_points = sub_data.get(user.id, 0)
        mcq_points = mcq_data.get(user.id, 0)
        air_points = air_data.get(user.id, 0)
        
        total = pt_points + sub_points + air_points + mcq_points
        
        batch_name = user.batch.name if getattr(user, 'batch', None) else None
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
        if len(response) >= 50:
            break
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
