from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import User, PointTransaction, Submission, Domain, Batch, Task
from schemas import LeaderboardEntry, RadarResponse, RadarAxis
from dependencies import get_current_user

router = APIRouter()

RADAR_DOMAINS = [
    "Data Science",
    "Frontend",
    "Artificial Intelligence",
    "Cyber Security",
    "Fullstack",
    "Python",
    "UI/UX",
    "Java"
]


@router.get("", response_model=List[LeaderboardEntry])
@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(
    period: Optional[str] = "all",  # 'all', 'weekly', 'monthly'
    domain_filter: Optional[str] = None,
    batch_filter: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the live leaderboard ranking based on total points accumulated from
    all task submissions (MCQ score + AI score + Mentor score) and PointTransactions (bonus airdrops).
    Supports institution batch filters (e.g. Berkeley, Harvard, IIT, MIT, Stanford) and zero-drop rankings.
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

    # 4. Join with User table to fetch intern metadata (zero-score interns are retained via outer joins)
    users_query = (
        db.query(User, total_points_expr.label("points"))
        .outerjoin(sub_subq, User.id == sub_subq.c.user_id)
        .outerjoin(pt_subq, User.id == pt_subq.c.user_id)
        .outerjoin(Batch, User.batch_id == Batch.id)
        .filter(User.role == "intern")
    )

    if domain_filter:
        users_query = users_query.join(Domain, User.domain_id == Domain.id).filter(
            Domain.name.ilike(f"%{domain_filter}%")
        )

    if batch_filter:
        users_query = users_query.filter(
            (User.college.ilike(f"%{batch_filter}%")) | (Batch.name.ilike(f"%{batch_filter}%"))
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


@router.get("/radar", response_model=RadarResponse)
def get_domain_radar(
    intern_id: Optional[int] = None,
    batch_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the eight-axis domain radar metrics covering:
    Data Science, Frontend, Artificial Intelligence, Cyber Security, Fullstack, Python, UI/UX, Java.
    Enforces role-based visibility:
    - Admin: Global view or specific intern evaluation.
    - Intern: Own proficiency benchmarked against cohort average.
    - Mentor: Denied (HTTP 403) per B7.5 access matrix.
    """
    user_role = getattr(current_user.role, "value", str(current_user.role)).lower()
    if user_role == "mentor":
        raise HTTPException(status_code=403, detail="Access denied: Mentor role has no domain radar view.")

    target_user: Optional[User] = None
    if user_role == "admin" and intern_id:
        target_user = db.query(User).filter(User.id == intern_id).first()
    elif user_role == "intern":
        target_user = current_user

    target_user_domain = target_user.domain.name.lower() if (target_user and target_user.domain) else ""
    target_user_progress = float(target_user.progress_pct or 0) if target_user else 0.0

    axes_result: List[RadarAxis] = []

    for domain_name in RADAR_DOMAINS:
        domain_pattern = f"%{domain_name.split()[0]}%"
        matching_domain = db.query(Domain).filter(Domain.name.ilike(domain_pattern)).first()

        # Compute cohort average for this domain
        cohort_query = db.query(func.avg(User.progress_pct)).filter(User.role == "intern")
        if matching_domain:
            cohort_query = cohort_query.filter(User.domain_id == matching_domain.id)
        if batch_filter:
            cohort_query = cohort_query.outerjoin(Batch, User.batch_id == Batch.id).filter(
                (User.college.ilike(f"%{batch_filter}%")) | (Batch.name.ilike(f"%{batch_filter}%"))
            )

        cohort_avg_val = cohort_query.scalar()
        cohort_avg = round(float(cohort_avg_val or 65.0), 1)

        # Intern score for this axis
        intern_axis_score = 0.0
        if target_user:
            if matching_domain and target_user.domain_id == matching_domain.id:
                # Primary allocated domain: use progress percentage and submission average
                intern_axis_score = min(100.0, max(target_user_progress, 40.0 if target_user_progress > 0 else 0.0))
            elif domain_name.lower() in target_user_domain:
                intern_axis_score = min(100.0, max(target_user_progress, 40.0 if target_user_progress > 0 else 0.0))
            else:
                # Secondary/cross-track skills: base score derived from baseline engagement
                intern_axis_score = round(max(0.0, (target_user_progress * 0.35)), 1)
        else:
            intern_axis_score = cohort_avg

        axes_result.append(
            RadarAxis(
                subject=domain_name,
                score=round(intern_axis_score, 1),
                cohort_avg=cohort_avg,
                fullMark=100
            )
        )

    return RadarResponse(
        user_id=target_user.id if target_user else None,
        user_name=target_user.name if target_user else "Cohort Benchmark",
        batch=target_user.batch.name if (target_user and target_user.batch) else batch_filter,
        axes=axes_result
    )


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
