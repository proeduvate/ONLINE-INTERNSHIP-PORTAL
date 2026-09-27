from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime, timedelta

import models
import database
from dependencies import get_current_user
from services.scoring_service import calculate_final_grade, bulk_calculate_final_grades
from scoring_schemas import FinalEvaluationResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def get_admin_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Admins can view this dashboard"
        )
        
    # Total Interns
    total_interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).count()
    
    # Active Interns (based on attendance_pct > 0 for now)
    active_interns = db.query(models.User).filter(
        models.User.role == models.UserRole.INTERN,
        models.User.attendance_pct > 0
    ).count()
    
    # Total Mentors
    total_mentors = db.query(models.User).filter(models.User.role == models.UserRole.MENTOR).count()
    
    # Active Domains
    active_domains = db.query(models.Domain).count()
    
    # Avg Performance (progress_pct)
    avg_performance_query = db.query(func.avg(models.User.progress_pct)).filter(models.User.role == models.UserRole.INTERN).scalar()
    avg_performance = int(avg_performance_query) if avg_performance_query else 0
    
    # Batch-wise Progress Trend (We'll calculate submissions over 7-day intervals by college/batch)
    submissions = db.query(models.Submission).options(joinedload(models.Submission.intern)).filter(models.Submission.submitted_at.isnot(None)).all()
    
    batch_progress = []
    
    if submissions:
        earliest_sub = min(s.submitted_at for s in submissions)
        week_buckets = defaultdict(lambda: defaultdict(int))
        
        for s in submissions:
            if s.intern and s.intern.college:
                batch_name = s.intern.college
                delta = s.submitted_at - earliest_sub
                week_idx = (delta.days // 7) + 1
                week_buckets[week_idx][batch_name] += 1
                
        for week in sorted(week_buckets.keys()):
            entry = {"name": f"Week {week}"}
            entry.update(week_buckets[week])
            batch_progress.append(entry)
    else:
        batch_progress = [
            {"name": "Week 1"}
        ]
        
    return {
        "total_interns": total_interns,
        "active_interns": active_interns,
        "total_mentors": total_mentors,
        "active_domains": active_domains,
        "avg_performance": avg_performance,
        "batch_progress": batch_progress
    }

@router.get("/final-evaluations", response_model=List[FinalEvaluationResponse])
def get_final_evaluations(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # All authenticated users (admin, mentor, intern) can view final evaluations (leaderboard data)

    
    interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
    results = []
    
    # Use the bulk calculation method to avoid N+1 queries
    evaluations = bulk_calculate_final_grades(db, interns)
    
    # Create a map for quick lookup
    evals_by_intern = {ev.intern_id: ev for ev in evaluations if ev}
    
    for intern in interns:
        evaluation = evals_by_intern.get(intern.id)
        # Show all interns so admins can see partial real data
        if evaluation:
            results.append({
                "intern_id": intern.id,
                "intern_name": intern.name,
                "mcq_final_mark": evaluation.mcq_final_mark,
                "code_final_mark": evaluation.code_final_mark,
                "airdrop_final_mark": evaluation.airdrop_final_mark,
                "mentor_evaluation_mark": evaluation.mentor_evaluation_mark,
                "final_score": evaluation.final_score,
                "grade": evaluation.grade,
                "is_completed": evaluation.is_completed
            })
            
    # Sort results by final score descending
    results.sort(key=lambda x: x.get("final_score") or 0, reverse=True)
    
    return results


@router.get("/domain-questions/mcq")
def get_domain_mcq_questions(
    domain: str = None,
    day: int = None,
    page: int = 1,
    page_size: int = 30,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return MCQ questions from domain_mcq_questions table filtered by domain and optionally day."""
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(models.DomainMCQQuestion)
    if domain:
        query = query.filter(models.DomainMCQQuestion.domain_name == domain)
    if day is not None:
        query = query.filter(models.DomainMCQQuestion.day_number == day)

    total = query.count()
    questions = (
        query.order_by(
            models.DomainMCQQuestion.domain_name,
            models.DomainMCQQuestion.day_number,
            models.DomainMCQQuestion.question_id
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    days_query = db.query(models.DomainMCQQuestion.day_number).distinct()
    if domain:
        days_query = days_query.filter(models.DomainMCQQuestion.domain_name == domain)
    available_days = sorted([r[0] for r in days_query.all()])

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "available_days": available_days,
        "questions": [
            {
                "id": q.id,
                "question_id": q.question_id,
                "domain_name": q.domain_name,
                "day_number": q.day_number,
                "topic": q.topic,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "correct_answer": q.correct_answer,
            }
            for q in questions
        ],
    }


@router.get("/domain-questions/code")
def get_domain_code_assessments_admin(
    domain: str = None,
    day: int = None,
    page: int = 1,
    page_size: int = 30,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return code assessments from domain_code_assessments table."""
    import json

    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(models.DomainCodeAssessment)
    if domain:
        query = query.filter(models.DomainCodeAssessment.domain_name == domain)
    if day is not None:
        query = query.filter(models.DomainCodeAssessment.day_number == day)

    total = query.count()
    assessments = (
        query.order_by(
            models.DomainCodeAssessment.domain_name,
            models.DomainCodeAssessment.day_number,
            models.DomainCodeAssessment.question_id
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    days_query = db.query(models.DomainCodeAssessment.day_number).distinct()
    if domain:
        days_query = days_query.filter(models.DomainCodeAssessment.domain_name == domain)
    available_days = sorted([r[0] for r in days_query.all()])

    def parse_reqs(reqs):
        if not reqs:
            return []
        try:
            parsed = json.loads(reqs)
            return parsed if isinstance(parsed, list) else [str(parsed)]
        except Exception:
            return [reqs]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "available_days": available_days,
        "assessments": [
            {
                "id": a.id,
                "question_id": a.question_id,
                "domain_name": a.domain_name,
                "day_number": a.day_number,
                "topic": a.topic,
                "title": a.title,
                "description": a.description,
                "requirements": parse_reqs(a.requirements),
            }
            for a in assessments
        ],
    }
