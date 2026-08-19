from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

import models
import schemas_leaderboard
from database import get_db

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
    query = db.query(
        models.User.id.label("user_id"),
        models.User.name.label("user_name"),
        models.Batch.name.label("batch_name"),
        func.sum(models.PointTransaction.points).label("total_points")
    ).join(
        models.PointTransaction, models.PointTransaction.user_id == models.User.id
    ).outerjoin(
        models.Batch, models.Batch.id == models.User.batch_id
    )

    # 1. Apply Batch Filter
    if batch_id is not None:
        query = query.filter(models.User.batch_id == batch_id)

    # 2. Apply Period Filter
    now = datetime.utcnow()
    if period.lower() == "weekly":
        # Start of current week (Monday)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(models.PointTransaction.created_at >= start_of_week)
    elif period.lower() == "monthly":
        # Start of current month
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(models.PointTransaction.created_at >= start_of_month)

    # Grouping and Ordering
    query = query.group_by(
        models.User.id,
        models.User.name,
        models.Batch.name
    ).order_by(
        func.sum(models.PointTransaction.points).desc(),
        models.User.id.asc() # Deterministic tie-breaker
    )

    results = query.all()

    # Format response with ranks
    response = []
    for rank, row in enumerate(results, start=1):
        response.append(
            schemas_leaderboard.LeaderboardEntry(
                rank=rank,
                user_id=row.user_id,
                user_name=row.user_name,
                batch=row.batch_name,
                total_points=row.total_points or 0
            )
        )

    return response
