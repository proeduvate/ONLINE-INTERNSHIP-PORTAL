from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta
import math

import models
import schemas_airdrops
from database import get_db
from core.dependencies import get_current_user
from core.utils_notifications import notify_user

router = APIRouter(
    prefix="/bonus-airdrops",
    tags=["Bonus Airdrops"]
)

@router.post("", response_model=schemas_airdrops.AirdropResponse, status_code=status.HTTP_201_CREATED)
def create_airdrop(
    data: schemas_airdrops.AirdropCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only Admins can create airdrops")
        
    # Verify batch exists
    batch = db.query(models.Batch).filter(models.Batch.id == data.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    new_airdrop = models.BonusAirdrop(
        question=data.question,
        correct_answer=data.correct_answer,
        domain=data.domain,
        batch_id=data.batch_id,
        time_limit=data.time_limit,
        bonus_points=data.bonus_points,
        winner_count=data.winner_count,
        start_time=datetime.utcnow(),
        end_time=None,
        created_by=current_user.id,
        status="PUBLISHED"
    )
    db.add(new_airdrop)
    db.commit()
    db.refresh(new_airdrop)
    
    return _build_airdrop_response(db, new_airdrop)


@router.get("", response_model=List[schemas_airdrops.AirdropResponse])
def get_airdrops(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() == "admin":
        airdrops = db.query(models.BonusAirdrop).all()
    else:
        # Interns see airdrops matching their batch and domain
        query = db.query(models.BonusAirdrop).filter(
            models.BonusAirdrop.batch_id == current_user.batch_id,
            models.BonusAirdrop.status.in_(["PUBLISHED", "FINALIZED"])
        )
        if current_user.domain:
            from sqlalchemy import func
            query = query.filter(func.lower(models.BonusAirdrop.domain) == func.lower(current_user.domain.name))
        airdrops = query.all()
        
    # Lazy Auto-finalize evaluation
    for a in airdrops:
        if a.status == "PUBLISHED":
            _check_auto_finalize(db, a, datetime.utcnow())
            
    responses = []
    for a in airdrops:
        resp = _build_airdrop_response(db, a)
        
        # Interns should only see their own attempts/results unless finalized? 
        # The prompt says: Intern: available airdrops + their participation/result
        if current_user.role.lower() != "admin":
            resp.attempts = [atm for atm in resp.attempts if atm.intern_id == current_user.id]
            resp.results = [res for res in resp.results if res.intern_id == current_user.id]
            
        responses.append(resp)
        
    return responses


@router.patch("/{airdrop_id}", response_model=schemas_airdrops.AirdropResponse)
def handle_airdrop_action(
    airdrop_id: int,
    data: schemas_airdrops.AirdropPatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    airdrop = db.query(models.BonusAirdrop).filter(models.BonusAirdrop.id == airdrop_id).first()
    if not airdrop:
        raise HTTPException(status_code=404, detail="Airdrop not found")
        
    now = datetime.utcnow()

    if data.action == schemas_airdrops.AirdropAction.START:
        # Check eligibility
        if airdrop.status != "PUBLISHED":
            raise HTTPException(status_code=400, detail="Challenge is not currently open")
        if current_user.batch_id != airdrop.batch_id:
            raise HTTPException(status_code=403, detail="You are not eligible for this challenge")
            
        # Check if already started
        existing = db.query(models.AirdropAttempt).filter(
            models.AirdropAttempt.airdrop_id == airdrop.id,
            models.AirdropAttempt.intern_id == current_user.id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="You have already started this challenge")
            
        attempt = models.AirdropAttempt(
            airdrop_id=airdrop.id,
            intern_id=current_user.id,
            started_at=now,
            status="started"
        )
        db.add(attempt)
        db.commit()

    elif data.action == schemas_airdrops.AirdropAction.SUBMIT:
        if airdrop.status != "PUBLISHED":
            raise HTTPException(status_code=400, detail="Challenge is not currently open")
            
        attempt = db.query(models.AirdropAttempt).filter(
            models.AirdropAttempt.airdrop_id == airdrop.id,
            models.AirdropAttempt.intern_id == current_user.id
        ).first()
        
        if not attempt or attempt.status != "started":
            raise HTTPException(status_code=400, detail="Invalid or non-existent attempt")
            
        # Calculate time difference in seconds
        time_diff = (now - attempt.started_at).total_seconds()
        
        if time_diff > airdrop.time_limit:
            attempt.status = "disqualified"
        else:
            attempt.status = "submitted"
            
        attempt.completed_at = now
        
        # Calculate is_correct by comparing intern's answer to the true correct answer
        if data.answer is not None and airdrop.correct_answer:
            import difflib
            
            def normalize(text: str) -> str:
                return "".join(text.split()).lower()
                
            intern_ans = normalize(data.answer)
            admin_ans = normalize(airdrop.correct_answer)
            
            if intern_ans == admin_ans:
                attempt.is_correct = True
            else:
                # Use difflib to check for >= 85% similarity
                similarity = difflib.SequenceMatcher(None, intern_ans, admin_ans).ratio()
                attempt.is_correct = similarity >= 0.85

        else:
            attempt.is_correct = False
            
        db.commit()
        
        # Check if this submission triggers an auto-finalize
        _check_auto_finalize(db, airdrop, now)

    return _build_airdrop_response(db, airdrop)

def _check_auto_finalize(db: Session, airdrop: models.BonusAirdrop, now: datetime):
    # 1. Condition 1: Winner count reached
    winners_reached = False
    successful_attempts = db.query(models.AirdropAttempt).filter(
        models.AirdropAttempt.airdrop_id == airdrop.id,
        models.AirdropAttempt.status == "submitted",
        models.AirdropAttempt.is_correct == True
    ).count()
    if successful_attempts >= airdrop.winner_count:
        winners_reached = True
        
    # 2. Condition 2: All Batch Members completed
    all_completed = False
    batch_member_count = db.query(models.User).filter(models.User.batch_id == airdrop.batch_id).count()
    if batch_member_count > 0:
        completed_attempts = db.query(models.AirdropAttempt).filter(
            models.AirdropAttempt.airdrop_id == airdrop.id,
            models.AirdropAttempt.status != "started"
        ).count()
        if completed_attempts >= batch_member_count:
            all_completed = True
            
    if winners_reached or all_completed:
        _finalize_airdrop(db, airdrop, now)


def _finalize_airdrop(db: Session, airdrop: models.BonusAirdrop, now: datetime):
    # 1. Get eligible batch size
    batch_member_count = db.query(models.User).filter(models.User.batch_id == airdrop.batch_id).count()
    winner_count = airdrop.winner_count
    
    # 2. Get successful attempts
    attempts = db.query(models.AirdropAttempt).filter(
        models.AirdropAttempt.airdrop_id == airdrop.id,
        models.AirdropAttempt.status == "submitted",
        models.AirdropAttempt.is_correct == True
    ).all()
    
    # Calculate completion times and sort
    valid_attempts = []
    for atm in attempts:
        if atm.completed_at and atm.started_at:
            comp_time_sec = int((atm.completed_at - atm.started_at).total_seconds())
            valid_attempts.append({"attempt": atm, "time": comp_time_sec})
            
    valid_attempts.sort(key=lambda x: x["time"])
    
    # 3. Award winners
    for i, data in enumerate(valid_attempts):
        atm = data["attempt"]
        comp_time = data["time"]
        is_winner = i < winner_count
        
        # Create Result
        result = models.AirdropResult(
            airdrop_id=airdrop.id,
            intern_id=atm.intern_id,
            rank=i + 1,
            completion_time=comp_time,
            bonus_points=airdrop.bonus_points if is_winner else 0,
            is_winner=is_winner
        )
        db.add(result)
        
        # Award Points if Winner
        if is_winner:
            pt = models.PointTransaction(
                user_id=atm.intern_id,
                points=airdrop.bonus_points,
                source_type="BONUS_AIRDROP",
                source_id=airdrop.id,
                reason=f"Bonus points for {airdrop.domain} Airdrop Challenge"
            )
            db.add(pt)
            
    # Mark Finalized
    airdrop.status = "FINALIZED"
    airdrop.finalized_at = now
    db.commit()


def _format_ist(dt: datetime) -> str:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    ist = timezone(timedelta(hours=5, minutes=30))
    dt_ist = dt.astimezone(ist)
    return dt_ist.strftime("%I:%M %p").lstrip("0")

def _build_airdrop_response(db: Session, airdrop: models.BonusAirdrop) -> schemas_airdrops.AirdropResponse:
    attempts = db.query(models.AirdropAttempt).filter(models.AirdropAttempt.airdrop_id == airdrop.id).all()
    results = db.query(models.AirdropResult).filter(models.AirdropResult.airdrop_id == airdrop.id).all()
    batch_member_count = db.query(models.User).filter(models.User.batch_id == airdrop.batch_id).count()
    
    resp = schemas_airdrops.AirdropResponse.model_validate(airdrop)
    resp.start_time_ist = _format_ist(airdrop.start_time)
    resp.end_time_ist = _format_ist(airdrop.end_time)
    
    attempt_responses = []
    for atm in attempts:
        atm_resp = schemas_airdrops.AirdropAttemptResponse.model_validate(atm)
        atm_resp.started_at_ist = _format_ist(atm.started_at)
        atm_resp.completed_at_ist = _format_ist(atm.completed_at)
        attempt_responses.append(atm_resp)
        
    resp.attempts = attempt_responses
    resp.results = results
    resp.eligible_count = batch_member_count
    
    return resp
