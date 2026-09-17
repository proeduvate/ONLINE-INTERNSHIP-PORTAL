from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta

from app import models
from app.db import session as database
from app.dependencies.auth import get_current_user

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
