from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from collections import defaultdict
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

from app.db.session import get_db
from app import models
from app.dependencies.auth import get_current_user
from app.services.scoring_service import calculate_final_grade
from app.schemas.scoring import MentorEvaluationUpdate

router = APIRouter(prefix="/mentor", tags=["Mentor Dashboard"])

class ReviewUpdate(BaseModel):
    action: str  # "Approve" or "Reject"
    score: int
    feedback: str

class MeetingCreate(BaseModel):
    title: str
    time: str

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can access this endpoint")

    # Assigned Interns count
    interns = db.query(models.User).options(joinedload(models.User.batch)).filter(models.User.mentor_id == current_user.id).all()
    # Fallback for testing if no interns assigned
    if not interns:
         interns = db.query(models.User).options(joinedload(models.User.batch)).filter(models.User.role == models.UserRole.INTERN).all()
         
    intern_ids = [i.id for i in interns]

    # Pending Reviews count
    pending_submissions = db.query(models.Submission).filter(
        models.Submission.intern_id.in_(intern_ids),
        models.Submission.status == "submitted"
    ).count()

    # Meetings Today
    meetings_today = db.query(models.Meeting).filter(models.Meeting.mentor_id == current_user.id).count()

    # Avg Performance
    total_score = 0
    total_interns = len(interns)
    for intern in interns:
        total_score += intern.progress_pct
    avg_performance = int(total_score / total_interns) if total_interns > 0 else 0

    # Backlog Data (Mocked but structured for chart)
    backlog_data = [
        {"name": "Week 1", "Submitted": 40, "Evaluated": 38},
        {"name": "Week 2", "Submitted": 45, "Evaluated": 40},
        {"name": "Week 3", "Submitted": 50, "Evaluated": 30},
        {"name": "Week 4", "Submitted": pending_submissions + 20, "Evaluated": 25},
    ]

    # At-Risk Interns
    at_risk = []
    for intern in interns:
        if intern.progress_pct < 60 or intern.attendance_pct < 70:
            at_risk.append({
                "id": intern.id,
                "name": intern.name,
                "batch": intern.batch.name if intern.batch else "Unknown",
                "reason": f"Low progress ({intern.progress_pct}%) or attendance ({intern.attendance_pct}%)"
            })

    return {
        "assigned_interns_count": total_interns,
        "pending_reviews_count": pending_submissions,
        "meetings_today_count": meetings_today,
        "avg_performance": avg_performance,
        "backlog_data": backlog_data,
        "at_risk_interns": at_risk
    }

@router.get("/interns")
def get_mentor_interns(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can access this endpoint")

    interns = db.query(models.User).options(joinedload(models.User.batch)).filter(models.User.mentor_id == current_user.id).all()
    if not interns:
         interns = db.query(models.User).options(joinedload(models.User.batch)).filter(models.User.role == models.UserRole.INTERN).all()

    intern_ids = [i.id for i in interns]
    subs_by_intern = defaultdict(list)
    if intern_ids:
        all_subs = db.query(models.Submission).options(joinedload(models.Submission.task)).filter(models.Submission.intern_id.in_(intern_ids)).all()
        for sub in all_subs:
            subs_by_intern[sub.intern_id].append(sub)

    result = []
    for i in interns:
        subs = subs_by_intern[i.id]
        avg_score = 0
        weak_areas = "None identified"
        if subs:
            total = sum((s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0) for s in subs)
            avg_score = int(total / len(subs))
            
            low_score_subs = [s for s in subs if ((s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0)) < 150]
            if low_score_subs:
                lowest = sorted(low_score_subs, key=lambda s: (s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0))[0]
                if lowest.task:
                    weak_areas = f"Struggled with {lowest.task.title}"
                else:
                    weak_areas = "Needs more practice"

        result.append({
            "id": i.intern_id or f"INT-{i.id}",
            "db_id": i.id,
            "name": i.name,
            "progress": f"{i.progress_pct}%",
            "attendance": f"{i.attendance_pct}%",
            "score": f"{avg_score} pts",
            "weakAreas": weak_areas,
            "batch": i.batch.name if i.batch else "Batch A"
        })
        
        evaluation = calculate_final_grade(db, i)
        if evaluation:
            result[-1]["final_evaluation"] = {
                "mcq_final_mark": evaluation.mcq_final_mark,
                "code_final_mark": evaluation.code_final_mark,
                "airdrop_final_mark": evaluation.airdrop_final_mark,
                "mentor_evaluation_mark": evaluation.mentor_evaluation_mark,
                "final_score": evaluation.final_score,
                "grade": evaluation.grade,
                "is_completed": evaluation.is_completed
            }
        
    return result

@router.get("/submissions")
def get_mentor_submissions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can access this endpoint")

    interns = db.query(models.User).filter(models.User.mentor_id == current_user.id).all()
    if not interns:
         interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
         
    intern_ids = [i.id for i in interns]

    submissions = db.query(models.Submission).options(
        joinedload(models.Submission.task).joinedload(models.Task.domain),
        joinedload(models.Submission.intern)
    ).filter(
        models.Submission.intern_id.in_(intern_ids)
    ).all()

    result = []
    for sub in submissions:
        task = sub.task
        intern = sub.intern
        result.append({
            "id": sub.id,
            "intern": intern.name if intern else "Unknown",
            "domain": task.domain.name if task and task.domain else "Unknown",
            "curriculum": f"Day {task.day_number}: {task.title}" if task else "Unknown",
            "mcqResults": f"{sub.mcq_score} points",
            "task": task.title if task else "Unknown",
            "code": sub.code_submission or "No code submitted",
            "aiScore": f"{sub.ai_score}%",
            "aiFeedback": sub.ai_feedback,
            "status": "Pending" if sub.status == "submitted" else (sub.status.capitalize() if sub.status else "Unknown"),
            "mentorFeedback": sub.mentor_feedback,
            "score": sub.mentor_score
        })
    return result

@router.put("/submissions/{submission_id}/review")
def review_submission(submission_id: int, review: ReviewUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can review submissions")

    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = "approved" if review.action == "Approve" else "rejected"
    submission.mentor_score = review.score
    submission.mentor_feedback = review.feedback
    db.commit()

    return {"message": f"Submission {submission.status} successfully"}

@router.get("/meetings")
def get_mentor_meetings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can access this endpoint")

    meetings = db.query(models.Meeting).filter(models.Meeting.mentor_id == current_user.id).all()
    result = []
    for m in meetings:
        time_str = m.created_at.strftime("%b %d, %I:%M %p") if m.created_at else "Upcoming"
        result.append({
            "id": m.id,
            "title": m.title,
            "time": time_str,
            "status": m.status.capitalize() if m.status else "Scheduled"
        })
        
    return result

@router.post("/meetings")
def create_mentor_meeting(meeting: MeetingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can create meetings")

    import uuid
    room_code = str(uuid.uuid4())[:8]

    new_meeting = models.Meeting(
        mentor_id=current_user.id,
        title=meeting.title,
        room_code=room_code,
        status="scheduled"
    )
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)

    return {
        "id": new_meeting.id,
        "title": new_meeting.title,
        "time": meeting.time,
        "status": "Scheduled"
    }

@router.put("/interns/{intern_id}/mentor-evaluation")
def update_mentor_evaluation(intern_id: int, eval_data: MentorEvaluationUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Only mentors can submit final evaluations")

    intern = db.query(models.User).filter(models.User.id == intern_id, models.User.role == models.UserRole.INTERN).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
        
    # Check if mentor is authorized (optional, assuming they are if they have the ID)
    if intern.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to evaluate this intern")
        
    evaluation = db.query(models.FinalEvaluation).filter(models.FinalEvaluation.intern_id == intern.id).first()
    if not evaluation:
        evaluation = models.FinalEvaluation(intern_id=intern.id)
        db.add(evaluation)
        
    evaluation.mentor_evaluation_mark = eval_data.mentor_evaluation_mark
    db.commit()
    
    # Recalculate with the new mark
    calculate_final_grade(db, intern, force_recalculate=True)
    return {"message": "Mentor evaluation submitted successfully"}

