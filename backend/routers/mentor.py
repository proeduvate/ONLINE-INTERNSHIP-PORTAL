from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from collections import defaultdict
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

from database import get_db
import models
from dependencies import get_current_user
from services.scoring_service import calculate_final_grade
from scoring_schemas import MentorEvaluationUpdate

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

@router.get("/interns/{intern_identifier}")
def get_intern_details(intern_identifier: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    clean_identifier = intern_identifier.strip()
    
    # Try exact/case-insensitive match on intern_id
    intern = db.query(models.User).options(
        joinedload(models.User.batch),
        joinedload(models.User.domain)
    ).filter(
        (models.User.intern_id == clean_identifier) | 
        (func.lower(models.User.intern_id) == clean_identifier.lower())
    ).first()

    # Try numeric ID lookup
    if not intern:
        clean_num = clean_identifier.replace("INT-", "").replace("INT", "").strip()
        if clean_num.isdigit():
            intern = db.query(models.User).options(
                joinedload(models.User.batch),
                joinedload(models.User.domain)
            ).filter(models.User.id == int(clean_num)).first()

    if not intern:
        raise HTTPException(status_code=404, detail=f"Intern '{intern_identifier}' not found")

    # Fetch all submissions for this intern with task details
    subs = db.query(models.Submission).options(
        joinedload(models.Submission.task)
    ).filter(models.Submission.intern_id == intern.id).all()

    # Calculate live metrics
    completed_subs = [s for s in subs if s.status in ["submitted", "approved"]]
    completed_tasks_count = len(completed_subs)

    avg_score = 0
    weak_areas = "None identified"
    strengths = "Good task completion"
    
    if subs:
        scores = [(s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0) for s in subs]
        if scores:
            avg_score = int(sum(scores) / len(scores))
        
        low_subs = [s for s in subs if ((s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0)) < 150]
        if low_subs:
            lowest = sorted(low_subs, key=lambda s: (s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0))[0]
            if lowest.task:
                weak_areas = f"Struggled with {lowest.task.title}"
            else:
                weak_areas = "Needs additional practice"
        
        high_subs = [s for s in subs if ((s.mcq_score or 0) + (s.ai_score or 0) + (s.mentor_score or 0)) >= 180]
        if high_subs and high_subs[0].task:
            strengths = f"Strong performance in {high_subs[0].task.title}"

    # Calculate days completed
    days_completed = max(completed_tasks_count, int((intern.progress_pct / 100.0) * 30)) if intern.progress_pct else completed_tasks_count

    # Build map of submissions by day number
    sub_by_day = {}
    for sub in subs:
        day_num = sub.task.day_number if sub.task else sub.id
        sub_by_day[day_num] = sub

    formatted_submissions = []
    submitted_count = 0
    for day_i in range(1, 31):
        sub = sub_by_day.get(day_i)
        if sub:
            submitted_count += 1
            task = sub.task
            task_title = task.title if task else f"Daily Task {day_i}"
            sub_date = sub.submitted_at.strftime("%Y-%m-%d") if sub.submitted_at else f"2026-10-{day_i:02d}"
            sub_datetime = sub.submitted_at.strftime("%Y-%m-%d %H:%M") if sub.submitted_at else f"2026-10-{day_i:02d} 10:00"
            
            files_list = []
            if sub.code_submission and sub.code_submission.strip():
                lang = "python" if ("def " in sub.code_submission or "import " in sub.code_submission or "print(" in sub.code_submission) else "javascript"
                ext = "py" if lang == "python" else "js"
                files_list.append({
                    "name": f"Solution_Day{day_i}.{ext}",
                    "type": "code",
                    "language": lang,
                    "size": f"{len(sub.code_submission)} B",
                    "uploadedAt": sub_datetime,
                    "content": sub.code_submission
                })
            if sub.mcq_answers:
                files_list.append({
                    "name": f"MCQ_Answers_Day{day_i}.json",
                    "type": "code",
                    "language": "json",
                    "size": f"{len(sub.mcq_answers)} B",
                    "uploadedAt": sub_datetime,
                    "content": sub.mcq_answers
                })
            if sub.filename:
                files_list.append({
                    "name": sub.filename,
                    "type": "document",
                    "size": "500 KB",
                    "uploadedAt": sub_datetime
                })
            if not files_list:
                files_list.append({
                    "name": f"MCQ_Day{day_i}.pdf",
                    "type": "document",
                    "size": "250 KB",
                    "uploadedAt": sub_datetime
                })

            formatted_submissions.append({
                "id": sub.id,
                "dayNumber": day_i,
                "day": f"Day {day_i}",
                "task": task_title,
                "date": sub_date,
                "submittedAt": sub_datetime,
                "mcqScore": f"{sub.mcq_score}%" if sub.mcq_score is not None else "0%",
                "aiScore": f"{sub.ai_score}%" if sub.ai_score is not None else "N/A",
                "mentorScore": sub.mentor_score,
                "status": "Approved" if sub.status == "approved" else ("Rejected" if sub.status == "rejected" else "Submitted"),
                "feedback": sub.mentor_feedback or sub.ai_feedback or "Good progress on daily assessment.",
                "githubUrl": f"https://github.com/intern/task-{day_i}" if sub.code_submission else None,
                "files": files_list,
                "isSubmitted": True
            })
        else:
            formatted_submissions.append({
                "id": f"unsubmitted-{day_i}",
                "dayNumber": day_i,
                "day": f"Day {day_i}",
                "task": "No Task Scheduled",
                "date": "-",
                "submittedAt": "-",
                "mcqScore": "-",
                "aiScore": "-",
                "mentorScore": 0,
                "status": "Not Submitted",
                "feedback": "-",
                "githubUrl": None,
                "files": [],
                "isSubmitted": False
            })

    # Performance trend curve
    performance_trend = [
        {"week": "Week 1", "score": min(100, max(40, avg_score - 15)) if avg_score else 50},
        {"week": "Week 2", "score": min(100, max(45, avg_score - 10)) if avg_score else 60},
        {"week": "Week 3", "score": min(100, max(50, avg_score - 5)) if avg_score else 70},
        {"week": "Week 4", "score": avg_score if avg_score else intern.progress_pct or 75},
    ]

    domain_name = intern.domain.name if intern.domain else "AIML"

    return {
        "intern": {
            "id": intern.intern_id or f"INT-{intern.id}",
            "db_id": intern.id,
            "name": intern.name,
            "email": intern.email,
            "domain": domain_name,
            "batch": intern.batch.name if intern.batch else "Batch A",
            "progress": intern.progress_pct or 0,
            "attendance": intern.attendance_pct or 100,
            "score": avg_score,
            "weakAreas": weak_areas,
            "strengths": strengths,
            "completedDays": days_completed,
            "totalDays": 30,
            "completedTasks": submitted_count,
            "totalTasks": 30,
        },
        "performanceData": performance_trend,
        "submissions": formatted_submissions
    }


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

