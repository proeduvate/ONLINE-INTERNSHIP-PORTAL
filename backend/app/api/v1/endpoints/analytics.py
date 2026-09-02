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

from app import models
from app.db import session as database
import app.schemas.analytics as schemas_analytics
from app.dependencies.auth import get_current_user

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

    final_score = round((data.mcq_score * 0.40) + (data.coding_score * 0.60), 2)

    # Check if a result already exists for this intern and date
    existing_result = db.query(models.DailyQuestionResult).filter(
        models.DailyQuestionResult.intern_id == current_user.id,
        models.DailyQuestionResult.date == data.date
    ).first()

    if existing_result:
        # Update existing record
        existing_result.question_id = data.question_id
        existing_result.mcq_score = data.mcq_score
        existing_result.coding_score = data.coding_score
        existing_result.final_score = final_score
        existing_result.attempted_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_result)
        return existing_result
    else:
        # Create new record
        new_result = models.DailyQuestionResult(
            intern_id=current_user.id,
            question_id=data.question_id,
            mcq_score=data.mcq_score,
            coding_score=data.coding_score,
            final_score=final_score,
            date=data.date,
            attempted_at=datetime.utcnow()
        )
        db.add(new_result)
        db.commit()
        db.refresh(new_result)
        return new_result





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
            models.DailyQuestionResult.mcq_score,
            models.DailyQuestionResult.coding_score,
            models.DailyQuestionResult.final_score
        )
        .filter(models.DailyQuestionResult.intern_id == intern_id)
        .order_by(models.DailyQuestionResult.date)
        .all()
    )

    return [
        {
            "date": r.date, 
            "mcq_score": r.mcq_score, 
            "coding_score": r.coding_score, 
            "final_score": r.final_score
        }
        for r in results
    ]

# ==========================================
#    INTERN: VIEW OWN ANALYTICS
# ==========================================

@router.get(
    "/analytics/daily-questions/me",
    response_model=List[schemas_analytics.DailyMarksDataPoint],
    summary="Get my daily question performance",
    description="Interns can view their own daily question marks."
)
def get_my_daily_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only interns can view their own analytics"
        )

    results = (
        db.query(
            models.DailyQuestionResult.date,
            models.DailyQuestionResult.mcq_score,
            models.DailyQuestionResult.coding_score,
            models.DailyQuestionResult.final_score
        )
        .filter(models.DailyQuestionResult.intern_id == current_user.id)
        .order_by(models.DailyQuestionResult.date)
        .all()
    )

    return [
        {
            "date": r.date, 
            "mcq_score": r.mcq_score, 
            "coding_score": r.coding_score, 
            "final_score": r.final_score
        }
        for r in results
    ]

