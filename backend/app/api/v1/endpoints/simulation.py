import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app import models
from app import schemas
from app.db import session as database
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/simulation", tags=["Simulation"])

def get_simulation_state(submission: models.Submission) -> Dict[str, Any]:
    default_state = {
        "state": {
            "problem_solving": 0,
            "technical_reasoning": 0,
            "decision_quality": 0,
            "risk_awareness": 0,
            "cost_awareness": 0
        },
        "history": [],
        "day_completed": False,
        "current_scenario_id": "1",
        "daily_score": 0
    }
    
    if not submission or not submission.ai_feedback:
        return default_state
        
    try:
        parsed = json.loads(submission.ai_feedback)
        if not parsed or "state" not in parsed:
            return default_state
        return parsed
    except:
        return default_state

def save_simulation_state(db: Session, submission: models.Submission, state_dict: Dict[str, Any]):
    submission.ai_feedback = json.dumps(state_dict)
    # also update the overall submission score if it's completed
    if state_dict.get("day_completed", False):
        submission.status = "submitted"
        submission.ai_score = state_dict.get("daily_score", 0)
    db.commit()

@router.get("/intern/current", response_model=schemas.SimulationScenarioResponse)
def get_current_simulation(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")
        
    if current_user.domain_id is None:
        raise HTTPException(status_code=400, detail="No domain assigned yet")

    # Get all simulation tasks for the domain ordered by day
    sim_tasks = db.query(models.Task).filter(
        models.Task.domain_id == current_user.domain_id,
        models.Task.task_type == "simulation"
    ).order_by(models.Task.day_number).all()

    if not sim_tasks:
        raise HTTPException(status_code=404, detail="No simulations available for this domain")

    current_task = None
    current_submission = None
    
    # Find the first incomplete simulation
    for task in sim_tasks:
        sub = db.query(models.Submission).filter(
            models.Submission.intern_id == current_user.id,
            models.Submission.task_id == task.id
        ).first()
        
        state = get_simulation_state(sub)
        if not state.get("day_completed", False):
            current_task = task
            current_submission = sub
            break
            
    if not current_task:
        raise HTTPException(status_code=404, detail="All simulations completed!")

    # Enforce day locking removed for demo purposes

    # Create submission if not exists to lock in the starting state
    if not current_submission:
        start_scenario_id = "start"

        initial_state = get_simulation_state(None)
        initial_state["current_scenario_id"] = start_scenario_id

        current_submission = models.Submission(
            intern_id=current_user.id,
            task_id=current_task.id,
            status="in_progress",
            ai_feedback=json.dumps(initial_state)
        )
        db.add(current_submission)
        db.commit()
        db.refresh(current_submission)
        
        state = initial_state

    current_scenario_val = state.get("current_scenario_id", "start")

    # Fetch the scenario from DailyScenario table based on exact ID
    # But for the very first step, we might only have "start" as a placeholder and need to find root
    if current_scenario_val == "start" or current_scenario_val == "1":
        scenario = db.query(models.DailyScenario).filter(
            models.DailyScenario.domain.ilike(f"%{current_task.domain.name}%"),
            models.DailyScenario.day_number == current_task.day_number,
            models.DailyScenario.step_number == 1,
            models.DailyScenario.is_active == True
        ).first()
        if scenario:
            state["current_scenario_id"] = str(scenario.id)
            save_simulation_state(db, current_submission, state)
            current_scenario_val = str(scenario.id)
        elif current_scenario_val == "1":
             # fallback for legacy "1" if no day scenario found
             scenario = db.query(models.DailyScenario).filter(
                models.DailyScenario.id == 1,
                models.DailyScenario.is_active == True
            ).first()
    else:
        scenario = db.query(models.DailyScenario).filter(
            models.DailyScenario.id == int(current_scenario_val),
            models.DailyScenario.is_active == True
        ).first()

    if not scenario:
        raise HTTPException(status_code=404, detail="No simulation scenario found for this step")

    choices = [
        {"id": "A", "text": scenario.choice_a_text},
        {"id": "B", "text": scenario.choice_b_text}
    ]
    if scenario.choice_c_text:
        choices.append({"id": "C", "text": scenario.choice_c_text})

    return {
        "day": current_task.day_number,
        "simulation_title": f"{current_task.domain.name} Workplace Simulation",
        "scenario_number": scenario.step_number,
        "scenario_id": str(scenario.id),
        "total_scenarios": 1,
        "situation": scenario.scenario_text,
        "question": scenario.question_text or "What is your decision?",
        "choices": choices
    }


@router.post("/decision", response_model=schemas.SimulationDecisionResponse)
def submit_decision(
    decision: schemas.SimulationDecision,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")

    # Find the current active simulation task
    sim_tasks = db.query(models.Task).filter(
        models.Task.domain_id == current_user.domain_id,
        models.Task.task_type == "simulation"
    ).order_by(models.Task.day_number).all()

    current_task = None
    current_submission = None
    
    for task in sim_tasks:
        sub = db.query(models.Submission).filter(
            models.Submission.intern_id == current_user.id,
            models.Submission.task_id == task.id
        ).first()
        
        state = get_simulation_state(sub)
        if not state.get("day_completed", False):
            current_task = task
            current_submission = sub
            break

    if not current_task:
        raise HTTPException(status_code=400, detail="No active simulation found")

    if not current_submission:
        # Create a new submission record
        start_scenario_id = "1"
        if current_task.day_number > 1:
            prev_task = db.query(models.Task).filter(
                models.Task.domain_id == current_task.domain_id,
                models.Task.task_type == "simulation",
                models.Task.day_number == current_task.day_number - 1
            ).first()
            if prev_task:
                prev_sub = db.query(models.Submission).filter(
                    models.Submission.intern_id == current_user.id,
                    models.Submission.task_id == prev_task.id
                ).first()
                if prev_sub:
                    prev_state = get_simulation_state(prev_sub)
                    if prev_state.get("current_scenario_id"):
                        start_scenario_id = str(prev_state.get("current_scenario_id"))

        initial_state = get_simulation_state(None)
        initial_state["current_scenario_id"] = start_scenario_id

        current_submission = models.Submission(
            intern_id=current_user.id,
            task_id=current_task.id,
            status="in_progress",
            ai_feedback=json.dumps(initial_state)
        )
        db.add(current_submission)
        db.commit()
        db.refresh(current_submission)

    state = get_simulation_state(current_submission)
    current_scenario_val = state.get("current_scenario_id", "1")

    # We use actual ID to represent scenario_id for daily_scenarios table
    if str(current_scenario_val) != str(decision.scenario_id):
        raise HTTPException(status_code=400, detail="Invalid scenario ID for current state")

    scenario = db.query(models.DailyScenario).filter(
        models.DailyScenario.id == int(current_scenario_val),
        models.DailyScenario.is_active == True
    ).first()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    if decision.choice_id == "A":
        feedback_type = scenario.choice_a_feedback_type or ""
        consequence = scenario.choice_a_reason or ""
        next_scenario_id = scenario.choice_a_next_scenario_id
    elif decision.choice_id == "B":
        feedback_type = scenario.choice_b_feedback_type or ""
        consequence = scenario.choice_b_reason or ""
        next_scenario_id = scenario.choice_b_next_scenario_id
    elif decision.choice_id == "C":
        feedback_type = scenario.choice_c_feedback_type or ""
        consequence = scenario.choice_c_reason or ""
        next_scenario_id = scenario.choice_c_next_scenario_id
    else:
        raise HTTPException(status_code=400, detail="Invalid choice ID")
    
    # Update state
    # We remove points, so daily_score doesn't matter much anymore.
    
    # Determine next scenario
    day_completed = True # 1 scenario per day
    state["day_completed"] = True
    
    if next_scenario_id:
        state["current_scenario_id"] = str(next_scenario_id)
        next_scenario_id_str = str(next_scenario_id)
    else:
        next_scenario_id_str = None

    # Record history
    state["history"].append({
        "scenario_id": str(current_scenario_val),
        "choice_id": str(decision.choice_id),
        "score": 0,
        "consequence": consequence
    })
    
    # Store in the DB table as requested by user
    history_record = models.ScenarioHistory(
        intern_id=current_user.id,
        domain=current_task.domain.name if current_task.domain else None,
        day_number=current_task.day_number,
        scenario_id=int(current_scenario_val),
        choice_id=str(decision.choice_id),
        feedback_type=feedback_type,
        consequence=consequence
    )
    db.add(history_record)
    
    save_simulation_state(db, current_submission, state)

    return {
        "selected_choice": str(decision.choice_id),
        "feedback_type": feedback_type,
        "feedback": feedback_type, # Provide legacy field if needed
        "consequence": consequence,
        "next_scenario": next_scenario_id_str,
        "day_completed": day_completed
    }
