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
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only Admins can create tasks.")

    domain = db.query(models.Domain).filter(models.Domain.name == task_in.domain_name).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found.")

    new_task = models.Task(
        domain_id=domain.id,
        day_number=task_in.day_number,
        title=task_in.title,
        description=task_in.description,
        deadline_days=task_in.deadline_days
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
    return tasks
