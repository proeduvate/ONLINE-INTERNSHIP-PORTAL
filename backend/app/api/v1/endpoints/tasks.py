from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import session as database
from app import models
from app.dependencies.auth import get_current_user
from app.schemas.tasks import TaskCreate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin" and current_user.role.lower() != "mentor":
        raise HTTPException(status_code=403, detail="Only Admins or Mentors can create tasks.")

    domain = db.query(models.Domain).filter(models.Domain.name == task_in.domain_name).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found.")

    new_task = models.Task(
        domain_id=domain.id,
        day_number=task_in.day_number,
        title=task_in.title,
        description=task_in.description,
        deadline_days=task_in.deadline_days,
        interactive_json=task_in.interactive_json,
        difficulty=task_in.difficulty
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Task)
    if hasattr(current_user.role, "value"):
        role_str = current_user.role.value.lower()
    else:
        role_str = str(current_user.role).lower()
        
    if role_str == "intern":
        if not current_user.domain_id:
            return []
        query = query.filter(models.Task.domain_id == current_user.domain_id)
    
    tasks = query.all()
    
    # Pre-fetch domains to map IDs to Names
    domains = db.query(models.Domain).all()
    domain_id_to_name = {d.id: d.name for d in domains}
    domain_name_to_id = {d.name: d.id for d in domains}
    
    result = []
    
    for task in tasks:
        result.append({
            "id": task.id,
            "domain_id": task.domain_id,
            "day_number": task.day_number,
            "title": task.title,
            "description": task.description,
            "difficulty": task.difficulty,
            "deadline_days": task.deadline_days,
            "domain_name": domain_id_to_name.get(task.domain_id, "Unknown"),
            "task_type": "curriculum",
            "interactive_json": task.interactive_json
        })
        
    # Fetch DomainCodeAssessments
    ca_query = db.query(models.DomainCodeAssessment)
    if role_str == "intern" and current_user.domain_id:
        intern_domain_name = domain_id_to_name.get(current_user.domain_id)
        ca_query = ca_query.filter(models.DomainCodeAssessment.domain_name == intern_domain_name)
    code_assessments = ca_query.all()
    
    for ca in code_assessments:
        result.append({
            "id": ca.id + 10000, # Fake ID to avoid collisions
            "domain_id": domain_name_to_id.get(ca.domain_name, 0),
            "day_number": ca.day_number,
            "title": ca.title,
            "description": ca.description,
            "difficulty": "Medium",
            "deadline_days": 1,
            "domain_name": ca.domain_name,
            "task_type": "coding"
        })
        
    # Fetch DomainMcqs
    mcq_query = db.query(models.DomainMCQQuestion)
    if role_str == "intern" and current_user.domain_id:
        intern_domain_name = domain_id_to_name.get(current_user.domain_id)
        mcq_query = mcq_query.filter(models.DomainMCQQuestion.domain_name == intern_domain_name)
    mcqs = mcq_query.all()
    
    for mcq in mcqs:
        result.append({
            "id": mcq.id + 20000, # Fake ID to avoid collisions
            "domain_id": domain_name_to_id.get(mcq.domain_name, 0),
            "day_number": mcq.day_number,
            "title": mcq.question_text,
            "description": mcq.topic,
            "difficulty": "Medium",
            "deadline_days": 1,
            "domain_name": mcq.domain_name,
            "task_type": "mcq"
        })
        
    return result
