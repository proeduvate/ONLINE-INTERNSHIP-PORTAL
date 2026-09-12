"""
app/api/v1/endpoints/questions.py
----------------------------------
Domain-aware question bank endpoints.
Serves MCQ questions and code assessments from the DB,
filtered by the intern's domain and requested day.
"""
import json
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.db import session as database
from app.api.v1.endpoints.mcq import get_current_user

router = APIRouter(tags=["questions"])


def _get_domain_name(db: Session, user: models.User) -> str:
    """Resolve the intern's domain name from their domain_id."""
    if not user.domain_id:
        raise HTTPException(status_code=400, detail="No domain assigned to your account yet.")
    domain = db.query(models.Domain).filter(models.Domain.id == user.domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found.")
    return domain.name


@router.get("/questions/mcq/day/{day}")
def get_mcq_questions_for_day(
    day: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Return 10 randomly selected MCQ questions for the intern's domain and the given day.
    Questions are served from domain_mcq_questions table (seeded from question_bank/ JSON files).
    """
    if not (1 <= day <= 30):
        raise HTTPException(status_code=400, detail="Day must be between 1 and 30.")

    domain_name = _get_domain_name(db, current_user)

    questions = (
        db.query(models.DomainMCQQuestion)
        .filter(
            models.DomainMCQQuestion.domain_name == domain_name,
            models.DomainMCQQuestion.day_number == day,
        )
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail=f"No MCQ questions found for domain '{domain_name}', day {day}. Please contact your admin."
        )

    # Randomly select 10 (or all if fewer than 10)
    selected = random.sample(questions, min(10, len(questions)))

    return {
        "domain": domain_name,
        "day": day,
        "topic": selected[0].topic if selected else "",
        "total_available": len(questions),
        "questions": [
            {
                "id": q.question_id,
                "question": q.question_text,
                "options": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d,
                },
                "correct_answer": q.correct_answer,
            }
            for q in selected
        ],
    }


@router.get("/questions/code/day/{day}")
def get_code_assessments_for_day(
    day: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Return all code challenge prompts for the intern's domain and the given day.
    Served from domain_code_assessments table (seeded from code_assessment_bank/ JSON files).
    """
    if not (1 <= day <= 30):
        raise HTTPException(status_code=400, detail="Day must be between 1 and 30.")

    domain_name = _get_domain_name(db, current_user)

    challenges = (
        db.query(models.DomainCodeAssessment)
        .filter(
            models.DomainCodeAssessment.domain_name == domain_name,
            models.DomainCodeAssessment.day_number == day,
        )
        .all()
    )

    if not challenges:
        raise HTTPException(
            status_code=404,
            detail=f"No code assessments found for domain '{domain_name}', day {day}. Please contact your admin."
        )

    # Randomly select 1 code assessment to show out of the available ones
    selected = random.choice(challenges)

    return {
        "domain": domain_name,
        "day": day,
        "topic": selected.topic if selected.topic else "",
        "total_questions": 1,
        "questions": [
            {
                "id": selected.question_id,
                "title": selected.title,
                "description": selected.description,
                "requirements": json.loads(selected.requirements) if selected.requirements else [],
            }
        ],
    }
