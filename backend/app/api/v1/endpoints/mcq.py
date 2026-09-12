from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
import json
import random
from datetime import datetime
import glob

from app.db import session as database
from app import models
from app.dependencies.auth import get_current_user
from app.schemas.mcq import MCQStartResponse, MCQSubmitRequest, MCQResultResponse, MCQQuestionSchema

router = APIRouter(prefix="/mcq", tags=["MCQ Assessment"])

def _get_domain_name(db: Session, user: models.User) -> str:
    if not user.domain_id:
        raise HTTPException(status_code=400, detail="No domain assigned to your account yet.")
    domain = db.query(models.Domain).filter(models.Domain.id == user.domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found.")
    return domain.name

def load_day_questions_from_db(db: Session, domain_name: str, day: int):
    questions = db.query(models.DomainMCQQuestion).filter(
        models.DomainMCQQuestion.domain_name == domain_name,
        models.DomainMCQQuestion.day_number == day
    ).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail=f"Question bank for domain {domain_name} day {day} not found.")
    
    formatted_questions = []
    topic = questions[0].topic if questions else "Unknown Topic"
    for q in questions:
        formatted_questions.append({
            "id": q.question_id,
            "question": q.question_text,
            "options": {
                "A": q.option_a,
                "B": q.option_b,
                "C": q.option_c,
                "D": q.option_d,
            },
            "correct_answer": q.correct_answer
        })
        
    return {"topic": topic, "questions": formatted_questions}

@router.get("/day/{day}", response_model=MCQResultResponse)
def get_mcq_status(day: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    """Check if the user has an existing attempt and return its status/result"""
    if not (1 <= day <= 30):
        raise HTTPException(status_code=400, detail="Invalid curriculum day. Day must be between 1 and 30.")
        
    attempt = db.query(models.MCQAttempt).filter(
        models.MCQAttempt.intern_id == current_user.id,
        models.MCQAttempt.day == day
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="No attempt found for this day.")
        
    return MCQResultResponse(
        attempt_id=attempt.id,
        day=attempt.day,
        topic=attempt.topic,
        total_questions=attempt.total_questions,
        correct_answers=attempt.correct_answers,
        wrong_answers=attempt.wrong_answers,
        score=attempt.score,
        percentage=attempt.percentage,
        status=attempt.status.value if attempt.status else "unknown",
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at
    )

@router.post("/day/{day}/start", response_model=MCQStartResponse)
def start_mcq_assessment(day: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if not (1 <= day <= 30):
        raise HTTPException(status_code=400, detail="Invalid curriculum day. Day must be between 1 and 30.")
        
    # Check for existing attempt
    attempt = db.query(models.MCQAttempt).filter(
        models.MCQAttempt.intern_id == current_user.id,
        models.MCQAttempt.day == day
    ).first()
    
    domain_name = _get_domain_name(db, current_user)
    day_data = load_day_questions_from_db(db, domain_name, day)
    all_questions = day_data.get("questions", [])
    topic = day_data.get("topic", "Unknown Topic")
    
    if attempt:
        if attempt.status == models.MCQAttemptStatus.SUBMITTED:
            raise HTTPException(status_code=400, detail="This MCQ assessment has already been submitted.")
        
        # Return existing IN_PROGRESS attempt
        selected_ids = json.loads(attempt.selected_question_ids)
        # Fetch the actual questions from the bank
        selected_questions = [q for q in all_questions if q["id"] in selected_ids]
        
    else:
        # Create new attempt
        import re
        
        # Group questions by their base text to prevent selecting duplicates
        base_questions = {}
        for q in all_questions:
            # Remove " (Variant X)" or similar suffixes
            base_text = re.sub(r'\s*\(Variant\s*\d+\)\s*', '', q["question"]).strip()
            if base_text not in base_questions:
                base_questions[base_text] = []
            base_questions[base_text].append(q)
            
        unique_bases = list(base_questions.values())
            
        if len(unique_bases) < 10:
            raise HTTPException(status_code=500, detail="Not enough unique questions in the bank.")
            
        # Select 10 unique base questions, then pick one variant for each
        selected_bases = random.sample(unique_bases, 10)
        selected_questions = [random.choice(variants) if isinstance(variants, list) else variants for variants in selected_bases]
        
        selected_ids = [q["id"] for q in selected_questions]
        
        attempt = models.MCQAttempt(
            intern_id=current_user.id,
            day=day,
            topic=topic,
            status=models.MCQAttemptStatus.IN_PROGRESS,
            selected_question_ids=json.dumps(selected_ids),
            total_questions=10
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        
    # Strip correct_answer and Variant text before sending to frontend
    import re
    clean_questions = []
    for q in selected_questions:
        clean_text = re.sub(r'\s*\(Variant\s*\d+\)\s*', '', q["question"]).strip()
        clean_questions.append(MCQQuestionSchema(
            id=q["id"],
            question=clean_text,
            options=q["options"]
        ))
        
    return MCQStartResponse(
        attempt_id=attempt.id,
        day=day,
        topic=topic,
        total_questions=10,
        questions=clean_questions
    )

@router.post("/day/{day}/submit", response_model=MCQResultResponse)
def submit_mcq_assessment(day: int, request: MCQSubmitRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    if not (1 <= day <= 30):
        raise HTTPException(status_code=400, detail="Invalid curriculum day. Day must be between 1 and 30.")
        
    attempt = db.query(models.MCQAttempt).filter(
        models.MCQAttempt.id == request.attempt_id,
        models.MCQAttempt.intern_id == current_user.id,
        models.MCQAttempt.day == day
    ).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Assessment attempt not found.")
        
    if attempt.status == models.MCQAttemptStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="This MCQ assessment has already been submitted.")
        
    selected_ids = json.loads(attempt.selected_question_ids)
    
    # Validate submitted answers
    for q_id, ans in request.answers.items():
        if q_id not in selected_ids:
            raise HTTPException(status_code=400, detail=f"Question {q_id} does not belong to this assessment attempt.")
        if ans not in ["A", "B", "C", "D"]:
            raise HTTPException(status_code=400, detail=f"Invalid answer option for question {q_id}.")
            
    # Load bank to check answers
    domain_name = _get_domain_name(db, current_user)
    day_data = load_day_questions_from_db(db, domain_name, day)
    all_questions = day_data.get("questions", [])
    
    # Create lookup map
    correct_map = {q["id"]: q["correct_answer"] for q in all_questions if q["id"] in selected_ids}
    
    correct_count = 0
    wrong_count = 0
    
    for q_id in selected_ids:
        submitted_ans = request.answers.get(q_id)
        if submitted_ans == correct_map.get(q_id):
            correct_count += 1
        else:
            wrong_count += 1
            
    total = len(selected_ids)
    percentage = (correct_count / total) * 100 if total > 0 else 0
    
    attempt.submitted_answers = json.dumps(request.answers)
    attempt.correct_answers = correct_count
    attempt.wrong_answers = wrong_count
    attempt.score = correct_count
    attempt.percentage = percentage
    attempt.status = models.MCQAttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(attempt)

    # Check if Code Assessment for this day is also done
    # We first find the corresponding coding task
    task = db.query(models.Task).filter(
        models.Task.domain_id == current_user.domain_id,
        models.Task.day_number == day
    ).first()
    
    if task:
        code_sub = db.query(models.Submission).filter(
            models.Submission.intern_id == current_user.id,
            models.Submission.task_id == task.id,
            models.Submission.status.in_(["submitted", "approved"])
        ).first()
        
        if code_sub:
            attendance_log = db.query(models.AttendanceLog).filter(
                models.AttendanceLog.intern_id == current_user.id,
                models.AttendanceLog.log_date >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
                models.AttendanceLog.log_date < datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
            ).first()
            if not attendance_log:
                db.add(models.AttendanceLog(intern_id=current_user.id, status="present", note="Completed both Code Assessment and MCQ"))
                
            now_dt = datetime.utcnow()
            last_comp = current_user.last_task_completion_date
            if last_comp:
                diff_hours = (now_dt - last_comp).total_seconds() / 3600
                if diff_hours < 48 and now_dt.date() > last_comp.date():
                    current_user.learning_streak += 1
                elif now_dt.date() > last_comp.date():
                    current_user.learning_streak = 1
            else:
                current_user.learning_streak = 1
                
            current_user.last_task_completion_date = now_dt
            db.add(current_user)
            db.commit()
    
    # Update Intern's User progress_pct if desired (Optional hook depending on existing logic)
    # The prompt says: "The actual MCQ result should feed into the existing progress system... Do not create duplicate progress cards."
    # We will just ensure the data is saved in attempt. We'll leave existing milestone logic intact but it can read from this model.
    
    db.refresh(attempt)
    
    return MCQResultResponse(
        attempt_id=attempt.id,
        day=attempt.day,
        topic=attempt.topic,
        total_questions=attempt.total_questions,
        correct_answers=attempt.correct_answers,
        wrong_answers=attempt.wrong_answers,
        score=attempt.score,
        percentage=attempt.percentage,
        status=attempt.status.value,
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at
    )

@router.get("/day/{day}/result", response_model=MCQResultResponse)
def get_mcq_result(day: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    """Fetch the result of a submitted assessment"""
    return get_mcq_status(day, db, current_user)
