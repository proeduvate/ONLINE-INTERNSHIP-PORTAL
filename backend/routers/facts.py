from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import DomainFact, InternFactHistory, User
from schemas import DomainFactResponse, FactCompletedResponse
from dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=List[DomainFactResponse])
@router.get("/", response_model=List[DomainFactResponse])
def get_domain_facts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves domain facts for the logged-in intern's domain."""
    user_domain = current_user.domain.name if current_user.domain else "General"
    
    # Query facts matching user domain or general
    facts = db.query(DomainFact).filter(
        (DomainFact.domain == user_domain) | (DomainFact.domain == "General")
    ).filter(DomainFact.is_active == True).all()

    # Get set of fact_ids seen by current user
    history = db.query(InternFactHistory.fact_id).filter(
        InternFactHistory.intern_id == current_user.id
    ).all()
    seen_fact_ids = {h[0] for h in history}

    result = []
    for f in facts:
        is_seen = f.id in seen_fact_ids
        result.append(DomainFactResponse(
            id=f.id,
            domain=f.domain,
            fact=f.fact,
            seen=is_seen,
            completed=is_seen
        ))
    
    return result

@router.post("/{fact_id}/ack", response_model=FactCompletedResponse)
@router.post("/{fact_id}/read", response_model=FactCompletedResponse)
def acknowledge_fact(
    fact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks a domain fact as read/acknowledged by the intern."""
    fact = db.query(DomainFact).filter(DomainFact.id == fact_id).first()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")

    existing = db.query(InternFactHistory).filter(
        InternFactHistory.intern_id == current_user.id,
        InternFactHistory.fact_id == fact_id
    ).first()

    if not existing:
        history = InternFactHistory(
            intern_id=current_user.id,
            fact_id=fact.id,
            fact_text=fact.fact
        )
        db.add(history)
        db.commit()

    return FactCompletedResponse(
        message="Fact acknowledged successfully",
        completed=True
    )
