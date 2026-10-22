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
    period: Optional[str] = "all",  # 'all', 'weekly', 'monthly'
    domain_filter: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the live leaderboard ranking based on total points accumulated from
    all task submissions (MCQ score + AI score + Mentor score) and PointTransactions (bonus airdrops).
    """
    # 1. Base subquery for submission scores (MCQ + AI + Mentor)
    sub_query = db.query(
        Submission.intern_id.label("user_id"),
        func.sum(
            func.coalesce(Submission.mcq_score, 0)
            + func.coalesce(Submission.ai_score, 0)
            + func.coalesce(Submission.mentor_score, 0)
        ).label("sub_points"),
    )
    if period == "weekly":
        start_date = datetime.utcnow() - timedelta(days=7)
        sub_query = sub_query.filter(Submission.submitted_at >= start_date)
    elif period == "monthly":
        start_date = datetime.utcnow() - timedelta(days=30)
        sub_query = sub_query.filter(Submission.submitted_at >= start_date)
    sub_subq = sub_query.group_by(Submission.intern_id).subquery()

    # 2. Base subquery for bonus point transactions
    pt_query = db.query(
        PointTransaction.user_id.label("user_id"),
        func.sum(func.coalesce(PointTransaction.points, 0)).label("pt_points"),
    )
    if period == "weekly":
        start_date = datetime.utcnow() - timedelta(days=7)
        pt_query = pt_query.filter(PointTransaction.created_at >= start_date)
    elif period == "monthly":
        start_date = datetime.utcnow() - timedelta(days=30)
        pt_query = pt_query.filter(PointTransaction.created_at >= start_date)
    pt_subq = pt_query.group_by(PointTransaction.user_id).subquery()

    # 3. Calculate total points expression
    total_points_expr = func.coalesce(sub_subq.c.sub_points, 0) + func.coalesce(
        pt_subq.c.pt_points, 0
    )

    # 4. Join with User table to fetch intern metadata
    users_query = (
        db.query(User, total_points_expr.label("points"))
        .outerjoin(sub_subq, User.id == sub_subq.c.user_id)
        .outerjoin(pt_subq, User.id == pt_subq.c.user_id)
        .filter(User.role == "intern")
    )

    if domain_filter:
        users_query = users_query.join(Domain, User.domain_id == Domain.id).filter(
            Domain.name.ilike(f"%{domain_filter}%")
        )

    results = users_query.order_by(total_points_expr.desc(), User.name.asc()).limit(limit).all()

    leaderboard = []
    for rank, (user, points) in enumerate(results, 1):
        domain_name = user.domain.name if user.domain else None
        batch_name = user.batch.name if user.batch else None
        college_name = user.college or batch_name or "-"
        pts = int(points or 0)

        leaderboard.append(
            LeaderboardEntry(
                rank=rank,
                user_id=user.id,
                user_name=user.name,
                name=user.name,
                intern_id=user.intern_id or f"INT-{user.id:04d}",
                batch=batch_name,
                college=college_name,
                domain=domain_name,
                total_points=pts,
                points=pts,
            )
        )

    return leaderboard


@router.get("/me", response_model=LeaderboardEntry)
def get_my_leaderboard_rank(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Returns the logged-in user's accurate leaderboard rank and total points."""
    leaderboard = get_leaderboard(period="all", limit=1000, db=db, current_user=current_user)

    for entry in leaderboard:
        if entry.user_id == current_user.id:
            return entry

    # Fallback if user is not in top 1000 or not yet an intern
    domain_name = current_user.domain.name if current_user.domain else None
    batch_name = current_user.batch.name if current_user.batch else None
    college_name = current_user.college or batch_name or "-"

    # Calculate user's individual points
    sub_points = (
        db.query(
            func.coalesce(
                func.sum(
                    func.coalesce(Submission.mcq_score, 0)
                    + func.coalesce(Submission.ai_score, 0)
                    + func.coalesce(Submission.mentor_score, 0)
                ),
                0,
            )
        )
        .filter(Submission.intern_id == current_user.id)
        .scalar()
        or 0
    )

    pt_points = (
        db.query(func.coalesce(func.sum(PointTransaction.points), 0))
        .filter(PointTransaction.user_id == current_user.id)
        .scalar()
        or 0
    )

    user_total = int(sub_points + pt_points)

    return LeaderboardEntry(
        rank=len(leaderboard) + 1,
        user_id=current_user.id,
        user_name=current_user.name,
        name=current_user.name,
        intern_id=current_user.intern_id or f"INT-{current_user.id:04d}",
        batch=batch_name,
        college=college_name,
        domain=domain_name,
        total_points=user_total,
        points=user_total,
    )
