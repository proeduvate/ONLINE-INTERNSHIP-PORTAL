from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import User, PointTransaction, Submission, Domain, Batch
from schemas import LeaderboardEntry
from dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[LeaderboardEntry])
@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(
    period: Optional[str] = "all", # 'all', 'weekly', 'monthly'
    domain_filter: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the live leaderboard ranking based on total points accumulated in PointTransactions
    and completed task submissions.
    """
    # 1. Base query for points per user
    query = db.query(
        PointTransaction.user_id,
        func.coalesce(func.sum(PointTransaction.points), 0).label("total_points")
    )
    
    if period == "weekly":
        start_date = datetime.utcnow() - timedelta(days=7)
        query = query.filter(PointTransaction.created_at >= start_date)
    elif period == "monthly":
        start_date = datetime.utcnow() - timedelta(days=30)
        query = query.filter(PointTransaction.created_at >= start_date)

    query = query.group_by(PointTransaction.user_id).subquery()

    # 2. Join with User table to fetch intern metadata
    users_query = db.query(
        User,
        func.coalesce(query.c.total_points, 0).label("points")
    ).outerjoin(query, User.id == query.c.user_id).filter(User.role == "intern")

    if domain_filter:
        users_query = users_query.join(Domain, User.domain_id == Domain.id).filter(Domain.name == domain_filter)

    results = users_query.order_by(func.coalesce(query.c.total_points, 0).desc(), User.name.asc()).limit(limit).all()

    leaderboard = []
    for rank, (user, points) in enumerate(results, 1):
        domain_name = user.domain.name if user.domain else None
        batch_name = user.batch.name if user.batch else None
        
        # If user has no point transactions yet, calculate from mentor_score / ai_score on submissions
        if points == 0:
            sub_points = db.query(func.coalesce(func.sum(Submission.mentor_score + Submission.ai_score), 0)).filter(
                Submission.intern_id == user.id
            ).scalar() or 0
            points = sub_points

        leaderboard.append(LeaderboardEntry(
            rank=rank,
            user_id=user.id,
            user_name=user.name,
            batch=batch_name,
            domain=domain_name,
            total_points=int(points)
        ))

    return leaderboard

@router.get("/me", response_model=LeaderboardEntry)
def get_my_leaderboard_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the logged-in user's leaderboard rank and total points."""
    leaderboard = get_leaderboard(period="all", limit=500, db=db, current_user=current_user)
    
    for entry in leaderboard:
        if entry.user_id == current_user.id:
            return entry

    # Default entry if user is not in top list
    domain_name = current_user.domain.name if current_user.domain else None
    batch_name = current_user.batch.name if current_user.batch else None
    return LeaderboardEntry(
        rank=len(leaderboard) + 1,
        user_id=current_user.id,
        user_name=current_user.name,
        batch=batch_name,
        domain=domain_name,
        total_points=0
    )
