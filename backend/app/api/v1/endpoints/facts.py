from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Union
from datetime import datetime, timedelta

from app import models
from app.db import session as database
import app.schemas.facts as schemas_facts
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/facts", tags=["Domain Facts"])

@router.get("", response_model=Union[schemas_facts.DomainFactResponse, schemas_facts.FactCompletedResponse])
def get_domain_facts(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get an unseen fact for the current intern's domain.
    """
    print(f"DEBUG /facts: current_user.email={current_user.email}, role={current_user.role}, type={type(current_user.role)}")
    if current_user.role != models.UserRole.INTERN and getattr(current_user.role, "value", current_user.role) != "intern":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only interns can view domain facts."
        )

    if not current_user.domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intern has no assigned domain."
        )

    domain_name = current_user.domain.name

    # Removed the 10-minute cache block so a new fact is picked on every request.

    facts_query = db.query(models.DomainFact).filter(
        models.DomainFact.domain == domain_name,
        models.DomainFact.is_active == True
    )

    # We no longer limit to one fact per day, so we removed the daily check.
    seen_fact_ids = [
        h.fact_id for h in db.query(models.InternFactHistory)
        .filter(models.InternFactHistory.intern_id == current_user.id)
        .all()
    ]
    
    unseen_facts = facts_query.filter(models.DomainFact.id.notin_(seen_fact_ids)).all() if seen_fact_ids else facts_query.all()

    if not unseen_facts:
        all_facts = facts_query.all()
        if not all_facts:
            return schemas_facts.FactCompletedResponse(
                message="No facts are available for your domain yet.",
                completed=True
            )
        # Repeat facts if all have been seen
        unseen_facts = all_facts

    # Sort to ensure deterministic order
    unseen_facts = sorted(unseen_facts, key=lambda f: f.id)

    import random
    # Select a completely random unseen fact
    selected_fact = random.choice(unseen_facts)

    # Record history
    history = models.InternFactHistory(
        intern_id=current_user.id, 
        fact_id=selected_fact.id,
        fact_text=selected_fact.fact
    )
    db.add(history)
    db.commit()

    return schemas_facts.DomainFactResponse(
        id=selected_fact.id,
        domain=selected_fact.domain,
        fact=selected_fact.fact,
        seen=False,
        completed=False
    )
