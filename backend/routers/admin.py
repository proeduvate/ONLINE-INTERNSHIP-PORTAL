from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta

import models
import database
import schemas
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
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Admins and Mentors can view final evaluations"
        )
    
    interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
    results = []
    
    # Use the bulk calculation method to avoid N+1 queries
    evaluations = bulk_calculate_final_grades(db, interns)
    
    # Create a map for quick lookup
    evals_by_intern = {ev.intern_id: ev for ev in evaluations if ev}
    
    for intern in interns:
        evaluation = evals_by_intern.get(intern.id)
        # Only show interns who have completed their 30-day requirement
        if evaluation and evaluation.is_completed:
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

@router.post("/mentors", status_code=status.HTTP_201_CREATED)
def create_mentor(
    mentor_data: schemas.MentorCreateRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Creates a new Mentor account and optional verification/welcome notification.
    Only Admin users can perform this action.
    """
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Admins can create mentor accounts"
        )
    
    # Check if email already registered
    clean_email = mentor_data.email.strip().lower()
    existing_user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Resolve or create domain if provided
    domain_obj = None
    if mentor_data.domain and mentor_data.domain.strip():
        domain_name_clean = mentor_data.domain.strip()
        domain_obj = db.query(models.Domain).filter(models.Domain.name.ilike(domain_name_clean)).first()
        if not domain_obj:
            domain_obj = models.Domain(name=domain_name_clean, description=f"{domain_name_clean} Internship Domain")
            db.add(domain_obj)
            db.flush()
    
    from core.security import hash_password
    hashed_pw = hash_password(mentor_data.password or "Mentor@123")
    
    new_mentor = models.User(
        name=mentor_data.name.strip(),
        email=clean_email,
        hashed_password=hashed_pw,
        role=models.UserRole.MENTOR,
        college="ProEduvate Mentors",
        domain_id=domain_obj.id if domain_obj else None,
        attendance_pct=100,
        progress_pct=100
    )
    
    db.add(new_mentor)
    db.commit()
    db.refresh(new_mentor)
    
    # Dispatch notification email if service is available
    try:
        from services.email_service import dispatch_notification, EventType, FRONTEND_URL
        dispatch_notification(
            recipient_email=new_mentor.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Mentor Account Verification & Login Credentials",
            message=f"Welcome {new_mentor.name}! Your mentor account has been created for {domain_obj.name if domain_obj else (mentor_data.domain or 'General')}. Temporary password: {mentor_data.password or 'Mentor@123'}",
            action_url=f"{FRONTEND_URL}/login"
        )
    except Exception as e:
        print(f"Notification dispatch warning: {e}")
    
    return {
        "id": new_mentor.id,
        "name": new_mentor.name,
        "email": new_mentor.email,
        "role": "mentor",
        "domain": domain_obj.name if domain_obj else (mentor_data.domain or "-"),
        "domain_id": new_mentor.domain_id,
        "status": "Active",
        "message": "Mentor account created successfully"
    }

@router.get("/domains")
def get_all_domains(db: Session = Depends(database.get_db)):
    domains = db.query(models.Domain).all()
    if not domains:
        default_names = ["Frontend Development", "Data Science", "Artificial Intelligence", "Cybersecurity", "Full Stack Development", "Python", "UI/UX Design", "Java"]
        for d_name in default_names:
            d_obj = models.Domain(name=d_name, description=f"{d_name} Internship Domain")
            db.add(d_obj)
        db.commit()
        domains = db.query(models.Domain).all()
    return [{"id": d.id, "name": d.name, "description": d.description} for d in domains]

from pydantic import BaseModel
from typing import Optional

class CreateDomainReq(BaseModel):
    name: str
    description: Optional[str] = None

@router.post("/domains")
def create_domain(req: CreateDomainReq, db: Session = Depends(database.get_db)):
    clean_name = req.name.strip()
    existing = db.query(models.Domain).filter(func.lower(models.Domain.name) == clean_name.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Domain with this name already exists")
    new_d = models.Domain(name=clean_name, description=req.description or f"{clean_name} Internship Domain")
    db.add(new_d)
    db.commit()
    db.refresh(new_d)
    return {"id": new_d.id, "name": new_d.name, "description": new_d.description}




