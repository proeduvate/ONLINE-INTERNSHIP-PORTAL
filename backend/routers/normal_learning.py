from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

tasks = {
    "DAY-01": {
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
}

class TaskUpdate(BaseModel):
    title: str
    description: str
    learning_goal: str
    due_date: str
    mcq_count: int = 5
    practical_title: str
    practical_description: str

class TaskCreate(TaskUpdate):
    day: int
    domain: str

@router.get("/")
def get_tasks():
    return list(tasks.values())

@router.get("/{task_id}")
def get_task(task_id: str):
    if task_id not in tasks:
        raise HTTPException(404, "Task not found")
    return tasks[task_id]

@router.put("/{task_id}")
def update_task(task_id: str, payload: TaskUpdate):
    if task_id not in tasks:
        raise HTTPException(404, "Task not found")
    current = tasks[task_id]
    current.update(payload.model_dump())
    current["updated_at"] = datetime.utcnow().isoformat()
    current["version"] += 1
    current["status"] = "published"
    return current

@router.post("/")
def create_task(payload: TaskCreate):
    task_id = f"DAY-{payload.day:02d}"
    if task_id in tasks:
        raise HTTPException(409, "Task already exists")
    item = {
        "id": task_id,
        **payload.model_dump(),
        "status": "published",
        "updated_at": datetime.utcnow().isoformat(),
        "version": 1,
    }
    tasks[task_id] = item
    return item
