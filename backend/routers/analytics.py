"""
Daily Question Analytics Router
Provides endpoints for recording daily question results and retrieving
analytics data suitable for line chart visualization.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List

import models
import database
import schemas_analytics
from core.dependencies import get_current_user

router = APIRouter(tags=["Daily Question Analytics"])


# ==========================================
#    RECORD DAILY QUESTION RESULT
# ==========================================

@router.post(
    "/daily-questions/results",
    response_model=schemas_analytics.DailyQuestionResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a daily question result",
    description="Intern records their marks for a daily question attempt."
)
def record_daily_question_result(
    data: schemas_analytics.DailyQuestionResultCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only interns can record daily question results"
        )

    if data.marks_obtained > data.max_marks:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="marks_obtained cannot exceed max_marks"
        )

    new_result = models.DailyQuestionResult(
        intern_id=current_user.id,
        question_id=data.question_id,
        marks_obtained=data.marks_obtained,
        max_marks=data.max_marks,
        date=data.date,
        attempted_at=datetime.utcnow()
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return new_result


# ==========================================
#    INTERN: VIEW OWN ANALYTICS
# ==========================================

@router.get(
    "/analytics/daily-questions/me",
    response_model=List[schemas_analytics.DailyMarksDataPoint],
    summary="Get my daily question performance",
    description=(
        "Returns the intern's daily question marks aggregated by date. "
        "If multiple questions were answered on the same day, marks are summed. "
        "Response is suitable for rendering as a line chart (X=date, Y=marks)."
    )
)
def get_my_daily_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Intern role required"
        )

    results = (
        db.query(
            models.DailyQuestionResult.date,
            func.sum(models.DailyQuestionResult.marks_obtained).label("marks"),
            func.sum(models.DailyQuestionResult.max_marks).label("max_marks")
        )
        .filter(models.DailyQuestionResult.intern_id == current_user.id)
        .group_by(models.DailyQuestionResult.date)
        .order_by(models.DailyQuestionResult.date)
        .all()
    )

    return [
        {"date": r.date, "marks": r.marks, "max_marks": r.max_marks}
        for r in results
    ]


# ==========================================
#    INTERN: VIEW OWN SUMMARY
# ==========================================

@router.get(
    "/analytics/daily-questions/summary/me",
    response_model=schemas_analytics.DailyAnalyticsSummary,
    summary="Get my daily question analytics summary",
    description="Returns summary statistics (average, highest, lowest, total) for the intern's daily question performance."
)
def get_my_daily_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Intern role required"
        )

    return _build_daily_summary(db, current_user.id)


# ==========================================
#    MENTOR/ADMIN: VIEW INTERN ANALYTICS
# ==========================================

@router.get(
    "/analytics/daily-questions/intern/{intern_id}",
    response_model=List[schemas_analytics.DailyMarksDataPoint],
    summary="Get an intern's daily question performance",
    description=(
        "Mentors can view daily question marks for interns assigned to them. "
        "Admins can view any intern's data. "
        "Response is suitable for rendering as a line chart."
    )
)
def get_intern_daily_analytics(
    intern_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify the intern exists and has intern role
    intern = db.query(models.User).filter(
        models.User.id == intern_id,
        models.User.role == models.UserRole.INTERN
    ).first()
    if not intern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intern not found"
        )

    # Permission check
    if current_user.role == models.UserRole.MENTOR:
        if intern.mentor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: This intern is not assigned to you"
            )
    elif current_user.role == models.UserRole.ADMIN:
        pass  # Admin can view any intern
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Mentor or Admin role required"
        )

    results = (
        db.query(
            models.DailyQuestionResult.date,
            func.sum(models.DailyQuestionResult.marks_obtained).label("marks"),
            func.sum(models.DailyQuestionResult.max_marks).label("max_marks")
        )
        .filter(models.DailyQuestionResult.intern_id == intern_id)
        .group_by(models.DailyQuestionResult.date)
        .order_by(models.DailyQuestionResult.date)
        .all()
    )

    return [
        {"date": r.date, "marks": r.marks, "max_marks": r.max_marks}
        for r in results
    ]


# ==========================================
#    HELPER FUNCTION
# ==========================================

def _build_daily_summary(db: Session, intern_id: int) -> dict:
    """Build a summary of daily question analytics for an intern."""
    results = (
        db.query(
            models.DailyQuestionResult.date,
            func.sum(models.DailyQuestionResult.marks_obtained).label("marks"),
            func.sum(models.DailyQuestionResult.max_marks).label("max_marks")
        )
        .filter(models.DailyQuestionResult.intern_id == intern_id)
        .group_by(models.DailyQuestionResult.date)
        .order_by(models.DailyQuestionResult.date)
        .all()
    )

    data_points = [
        {"date": r.date, "marks": r.marks, "max_marks": r.max_marks}
        for r in results
    ]

    if not data_points:
        return {
            "intern_id": intern_id,
            "total_days": 0,
            "total_marks": 0,
            "total_max_marks": 0,
            "average_marks": 0.0,
            "highest_daily_marks": 0,
            "lowest_daily_marks": 0,
            "data": []
        }

    marks_list = [dp["marks"] for dp in data_points]
    total_marks = sum(marks_list)
    total_max = sum(dp["max_marks"] for dp in data_points)

    return {
        "intern_id": intern_id,
        "total_days": len(data_points),
        "total_marks": total_marks,
        "total_max_marks": total_max,
        "average_marks": round(total_marks / len(data_points), 2),
        "highest_daily_marks": max(marks_list),
        "lowest_daily_marks": min(marks_list),
        "data": data_points
    }
