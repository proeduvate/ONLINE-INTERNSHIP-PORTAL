from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models
import database
import schemas
from core.dependencies import get_current_user

router = APIRouter(prefix="", tags=["Repository Requests"])

@router.post("/repository-requests", response_model=schemas.RepositoryRequestResponse)
def create_repository_request(
    data: schemas.RepositoryRequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only interns can request GitHub repositories."
        )

    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if task.domain_id != current_user.domain_id:
        raise HTTPException(status_code=403, detail="Task does not belong to your assigned domain.")

    # Check if a request already exists
    existing_req = db.query(models.GitHubRepositoryRequest).filter(
        models.GitHubRepositoryRequest.intern_id == current_user.id,
        models.GitHubRepositoryRequest.task_id == data.task_id
    ).first()

    if existing_req:
        return existing_req

    new_request = models.GitHubRepositoryRequest(
        intern_id=current_user.id,
        task_id=data.task_id,
        domain=task.domain.name if task.domain else data.domain,
        request_status="requested",
        requested_at=datetime.utcnow()
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Optional: Trigger notification to mentors/admins here
    
    return new_request


@router.get("/repository-requests", response_model=List[schemas.RepositoryRequestResponse])
def get_repository_requests(
    intern_id: int = None,
    task_id: int = None,
    req_status: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.GitHubRepositoryRequest)

    if current_user.role == models.UserRole.INTERN:
        query = query.filter(models.GitHubRepositoryRequest.intern_id == current_user.id)
    # Mentors and Admins see all requests in this demo

    if intern_id and current_user.role != models.UserRole.INTERN:
        query = query.filter(models.GitHubRepositoryRequest.intern_id == intern_id)
        
    if task_id:
        query = query.filter(models.GitHubRepositoryRequest.task_id == task_id)
        
    if req_status:
        query = query.filter(models.GitHubRepositoryRequest.request_status == req_status)

    return query.all()


@router.put("/repository-requests/{req_id}/assign", response_model=schemas.RepositoryRequestResponse)
def assign_repository(
    req_id: int,
    data: schemas.RepositoryRequestAssign,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign repositories."
        )

    req = db.query(models.GitHubRepositoryRequest).filter(models.GitHubRepositoryRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Repository request not found.")

    if current_user.role == models.UserRole.MENTOR:
        intern = db.query(models.User).filter(models.User.id == req.intern_id).first()
        if not intern or intern.mentor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Intern is not assigned to you.")

    req.repository_id = data.repository_id
    req.repository_url = data.repository_url
    req.request_status = "assigned"
    req.assigned_by = current_user.id
    req.assigned_at = datetime.utcnow()

    db.add(req)
    db.commit()
    db.refresh(req)
    
    # Optional: Send notification to intern here
    notification = models.Notification(
        user_id=req.intern_id,
        title="GitHub Repository Assigned",
        message=f"Your repository for task #{req.task_id} has been assigned. URL: {req.repository_url}",
        type="system"
    )
    db.add(notification)
    db.commit()

    return req
