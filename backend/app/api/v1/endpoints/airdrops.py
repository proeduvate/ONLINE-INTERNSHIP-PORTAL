from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta
import json

from app import models
import app.schemas.airdrops as schemas_airdrops
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.core.airdrop_evaluator import evaluate_airdrop_submission
from app.core.utils_notifications import notify_interns

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
    if current_user.role.lower() not in ["admin", "mentor"]:
        raise HTTPException(status_code=403, detail="Only Mentors and Admins can create airdrops")
        
    # Verify batch exists if provided
    if data.batch_id is not None:
        batch = db.query(models.Batch).filter(models.Batch.id == data.batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")

    new_airdrop = models.BonusAirdrop(
        title=data.title,
        description=data.description,
        task_type=data.task_type.value,
        task_config=json.dumps(data.task_config),
        domain=data.domain,
        batch_id=data.batch_id,
        start_mode=data.start_mode.value,
        time_limit=data.time_limit,
        start_time=data.start_time,
        points_distribution=data.points_distribution,
        winner_count=data.winner_count,
        created_by=current_user.id,
        status=schemas_airdrops.AirdropStatus.PENDING_APPROVAL.value
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
    if current_user.role.lower() in ["admin", "mentor"]:
        airdrops = db.query(models.BonusAirdrop).all()
    else:
        # Interns see all published airdrops (Global)
        query = db.query(models.BonusAirdrop).filter(
            models.BonusAirdrop.status.in_([schemas_airdrops.AirdropStatus.PUBLISHED.value, schemas_airdrops.AirdropStatus.FINALIZED.value])
        )
        airdrops = query.all()
        
    # Lazy Auto-finalize evaluation
    for a in airdrops:
        if a.status == schemas_airdrops.AirdropStatus.PUBLISHED.value:
            _check_auto_finalize(db, a, datetime.utcnow())
            
    responses = []
    for a in airdrops:
        resp = _build_airdrop_response(db, a)
        
        # Interns should only see their own attempts/results
        if current_user.role.lower() not in ["admin", "mentor"]:
            resp.attempts = [atm for atm in resp.attempts if atm.intern_id == current_user.id]
            resp.results = [res for res in resp.results if res.intern_id == current_user.id]
            
        responses.append(resp)
        
    return responses


@router.post("/{airdrop_id}/submit-approval", response_model=schemas_airdrops.AirdropResponse)
def submit_for_approval(
    airdrop_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() not in ["admin", "mentor"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    airdrop = db.query(models.BonusAirdrop).filter(models.BonusAirdrop.id == airdrop_id).first()
    if not airdrop:
        raise HTTPException(status_code=404, detail="Airdrop not found")
        
    if airdrop.status != schemas_airdrops.AirdropStatus.DRAFT.value:
        raise HTTPException(status_code=400, detail="Only DRAFT airdrops can be submitted for approval")
        
    airdrop.status = schemas_airdrops.AirdropStatus.PENDING_APPROVAL.value
    db.commit()
    db.refresh(airdrop)
    return _build_airdrop_response(db, airdrop)

@router.post("/admin/{airdrop_id}/approve", response_model=schemas_airdrops.AirdropResponse)
def approve_airdrop(
    airdrop_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only Admins can approve airdrops")
        
    airdrop = db.query(models.BonusAirdrop).filter(models.BonusAirdrop.id == airdrop_id).first()
    if not airdrop:
        raise HTTPException(status_code=404, detail="Airdrop not found")
        
    if airdrop.status != schemas_airdrops.AirdropStatus.PENDING_APPROVAL.value:
        raise HTTPException(status_code=400, detail="Airdrop is not pending approval")
        
    airdrop.status = schemas_airdrops.AirdropStatus.PUBLISHED.value
    
    # Check if we should auto-finalize immediately (if all interns have already completed it)
    _check_auto_finalize(db, airdrop, datetime.utcnow())
    
    db.commit()
    db.refresh(airdrop)
    return _build_airdrop_response(db, airdrop)

@router.post("/admin/{airdrop_id}/reject", response_model=schemas_airdrops.AirdropResponse)
def reject_airdrop(
    airdrop_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only Admins can reject airdrops")
        
    airdrop = db.query(models.BonusAirdrop).filter(models.BonusAirdrop.id == airdrop_id).first()
    if not airdrop:
        raise HTTPException(status_code=404, detail="Airdrop not found")
        
    airdrop.status = schemas_airdrops.AirdropStatus.DRAFT.value
    airdrop.rejection_reason = reason
    db.commit()
    db.refresh(airdrop)
    return _build_airdrop_response(db, airdrop)

@router.post("/admin/{airdrop_id}/publish", response_model=schemas_airdrops.AirdropResponse)
def publish_airdrop(
    airdrop_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only Admins can publish airdrops")
        
    airdrop = db.query(models.BonusAirdrop).filter(models.BonusAirdrop.id == airdrop_id).first()
    if not airdrop:
        raise HTTPException(status_code=404, detail="Airdrop not found")
        
    if airdrop.status != schemas_airdrops.AirdropStatus.APPROVED.value:
        raise HTTPException(status_code=400, detail="Airdrop must be approved before publishing")
        
    airdrop.status = schemas_airdrops.AirdropStatus.PUBLISHED.value
    airdrop.published_at = datetime.utcnow()
    db.commit()
    
    notify_interns(
        db,
        title="🎉 New Bonus Airdrop!",
        message=f"A new Airdrop Challenge '{airdrop.title}' has just been published! Participate now to earn extra points.",
        notif_type="system"
    )
    
    db.refresh(airdrop)
    return _build_airdrop_response(db, airdrop)


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
        if airdrop.status != schemas_airdrops.AirdropStatus.PUBLISHED.value:
            raise HTTPException(status_code=400, detail="Challenge is not currently open")
        if airdrop.batch_id is not None and current_user.batch_id != airdrop.batch_id:
            raise HTTPException(status_code=403, detail="You are not eligible for this challenge")
            
        if airdrop.start_mode == schemas_airdrops.StartMode.FIXED.value:
            if not airdrop.start_time or now < airdrop.start_time:
                raise HTTPException(status_code=400, detail="Fixed start time has not been reached yet")
            
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
        if airdrop.status != schemas_airdrops.AirdropStatus.PUBLISHED.value:
            raise HTTPException(status_code=400, detail="Challenge is not currently open")
            
        attempt = db.query(models.AirdropAttempt).filter(
            models.AirdropAttempt.airdrop_id == airdrop.id,
            models.AirdropAttempt.intern_id == current_user.id
        ).first()
        
        if not attempt or attempt.status != "started":
            raise HTTPException(status_code=400, detail="Invalid or non-existent attempt")
            
        # For Flexible, strict enforcement. For Fixed, use a small grace period just in case.
        time_diff = (now - attempt.started_at).total_seconds()
        is_late = False
        if airdrop.start_mode == schemas_airdrops.StartMode.FLEXIBLE.value:
            if time_diff > (airdrop.time_limit + 5):
                is_late = True
        else:
            if airdrop.start_time and (now - airdrop.start_time).total_seconds() > (airdrop.time_limit + 5):
                is_late = True
                
        attempt.completed_at = now
        attempt.submitted_answer = json.dumps(data.answer) if data.answer is not None else None
        
        if is_late:
            attempt.status = "disqualified"
            attempt.is_correct = False
        else:
            attempt.status = "submitted"
            config = json.loads(airdrop.task_config)
            attempt.is_correct = evaluate_airdrop_submission(airdrop.task_type, config, data.answer)
            
        db.commit()
        
        _check_auto_finalize(db, airdrop, now)

    return _build_airdrop_response(db, airdrop)

def _check_auto_finalize(db: Session, airdrop: models.BonusAirdrop, now: datetime):
    winners_reached = False
    successful_attempts = db.query(models.AirdropAttempt).filter(
        models.AirdropAttempt.airdrop_id == airdrop.id,
        models.AirdropAttempt.status == "submitted",
        models.AirdropAttempt.is_correct == True
    ).count()
    if successful_attempts >= airdrop.winner_count:
        winners_reached = True
        
    all_completed = False
    intern_count = db.query(models.User).filter(models.User.role == "intern").count()
    if intern_count > 0:
        completed_attempts = db.query(models.AirdropAttempt).filter(
            models.AirdropAttempt.airdrop_id == airdrop.id,
            models.AirdropAttempt.status != "started"
        ).count()
        if completed_attempts >= intern_count:
            all_completed = True
            
    if winners_reached or all_completed:
        _finalize_airdrop(db, airdrop, now)


def _finalize_airdrop(db: Session, airdrop: models.BonusAirdrop, now: datetime):
    winner_count = airdrop.winner_count
    
    attempts = db.query(models.AirdropAttempt).filter(
        models.AirdropAttempt.airdrop_id == airdrop.id,
        models.AirdropAttempt.status == "submitted",
        models.AirdropAttempt.is_correct == True
    ).all()
    
    valid_attempts = []
    for atm in attempts:
        if atm.completed_at and atm.started_at:
            if airdrop.start_mode == schemas_airdrops.StartMode.FIXED.value and airdrop.start_time:
                 comp_time_sec = int((atm.completed_at - airdrop.start_time).total_seconds())
            else:
                 comp_time_sec = int((atm.completed_at - atm.started_at).total_seconds())
            valid_attempts.append({"attempt": atm, "time": comp_time_sec})
            
    valid_attempts.sort(key=lambda x: x["time"])
    
    for i, data in enumerate(valid_attempts):
        atm = data["attempt"]
        comp_time = data["time"]
        is_winner = i < winner_count
        
        awarded_points = 0
        if is_winner:
            points_arr = [int(p.strip()) for p in airdrop.points_distribution.split(",") if p.strip().isdigit()]
            if i < len(points_arr):
                awarded_points = points_arr[i]
            elif len(points_arr) > 0:
                awarded_points = points_arr[-1]

        result = models.AirdropResult(
            airdrop_id=airdrop.id,
            intern_id=atm.intern_id,
            rank=i + 1,
            completion_time=comp_time,
            bonus_points=awarded_points,
            is_winner=is_winner
        )
        db.add(result)
        
        if is_winner and awarded_points > 0:
            pt = models.PointTransaction(
                user_id=atm.intern_id,
                points=awarded_points,
                source_type="BONUS_AIRDROP",
                source_id=airdrop.id,
                reason=f"Bonus points for {airdrop.domain or 'Backend'} Airdrop Challenge"
            )
            db.add(pt)
            
    airdrop.status = schemas_airdrops.AirdropStatus.FINALIZED.value
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
    
    config_dict = {}
    try:
        config_dict = json.loads(airdrop.task_config)
    except:
        pass
        
    resp_dict = {
        "id": airdrop.id,
        "title": airdrop.title,
        "description": airdrop.description,
        "task_type": airdrop.task_type,
        "task_config": config_dict,
        "domain": airdrop.domain,
        "batch_id": airdrop.batch_id,
        "start_mode": airdrop.start_mode,
        "time_limit": airdrop.time_limit,
        "start_time": airdrop.start_time,
        "start_time_ist": _format_ist(airdrop.start_time),
        "points_distribution": airdrop.points_distribution,
        "winner_count": airdrop.winner_count,
        "status": airdrop.status,
        "created_by": airdrop.created_by,
        "rejection_reason": airdrop.rejection_reason,
        "published_at": airdrop.published_at,
        "finalized_at": airdrop.finalized_at,
        "created_at": airdrop.created_at,
        "attempts": [],
        "results": []
    }
    
    resp = schemas_airdrops.AirdropResponse(**resp_dict)
    
    attempt_responses = []
    for atm in attempts:
        atm_resp = schemas_airdrops.AirdropAttemptResponse.model_validate(atm)
        atm_resp.started_at_ist = _format_ist(atm.started_at)
        atm_resp.completed_at_ist = _format_ist(atm.completed_at)
        attempt_responses.append(atm_resp)
        
    resp.attempts = attempt_responses
    
    result_responses = []
    for res in results:
        res_resp = schemas_airdrops.AirdropResultResponse.model_validate(res)
        user = db.query(models.User).filter(models.User.id == res.intern_id).first()
        res_resp.intern_name = user.name if user else "Unknown"
        result_responses.append(res_resp)
        
    resp.results = result_responses
    return resp
