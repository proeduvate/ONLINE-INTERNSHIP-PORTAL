from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Task, Domain

router = APIRouter()

class TaskUpdate(BaseModel):
    title: str
    description: str
    learning_goal: Optional[str] = None
    due_date: Optional[str] = None
    mcq_count: int = 5
    practical_title: Optional[str] = None
    practical_description: Optional[str] = None

class TaskCreate(TaskUpdate):
    day: int
    domain: str

@router.get("/")
def get_tasks(db: Session = Depends(get_db)):
    db_tasks = db.query(Task).order_by(Task.day_number.asc()).all()
    if db_tasks:
        return [
            {
                "id": f"DAY-{t.day_number:02d}",
                "day": t.day_number,
                "domain": t.domain.name if t.domain else "General",
                "title": t.title,
                "description": t.description,
                "learning_goal": t.notes or "Understand fundamentals",
                "due_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "status": "published",
                "updated_at": datetime.utcnow().isoformat(),
                "version": 1,
                "mcq_count": 5,
                "practical_title": t.title,
                "practical_description": t.coding_prompt or t.description,
            }
            for t in db_tasks
        ]
    # Fallback to default
    return [
        {
            "id": "DAY-01",
            "day": 1,
            "domain": "Frontend Development",
            "title": "HTML5 Fundamentals & Semantic Structure",
            "description": "Learn the building blocks of an HTML page through an interactive learning deck.",
            "learning_goal": "Understand document structure, common elements and semantic HTML.",
            "due_date": "2026-09-10",
            "status": "published",
            "updated_at": datetime.utcnow().isoformat(),
            "version": 1,
            "mcq_count": 5,
            "practical_title": "Build a Personal Developer Portfolio",
            "practical_description": "Create a semantic HTML5 portfolio with Header, About, Skills, Projects, Contact and Footer.",
        }
    ]

@router.get("/{task_id}")
def get_task(task_id: str, db: Session = Depends(get_db)):
    day_num = None
    if task_id.startswith("DAY-"):
        try:
            day_num = int(task_id.replace("DAY-", ""))
        except ValueError:
            pass
            
    if day_num:
        t = db.query(Task).filter(Task.day_number == day_num).first()
        if t:
            return {
                "id": f"DAY-{t.day_number:02d}",
                "day": t.day_number,
                "domain": t.domain.name if t.domain else "General",
                "title": t.title,
                "description": t.description,
                "learning_goal": t.notes or "Understand fundamentals",
                "due_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "status": "published",
                "updated_at": datetime.utcnow().isoformat(),
                "version": 1,
                "mcq_count": 5,
                "practical_title": t.title,
                "practical_description": t.coding_prompt or t.description,
            }
    raise HTTPException(404, "Task not found")
