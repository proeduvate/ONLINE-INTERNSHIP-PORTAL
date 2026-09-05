from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter(prefix="/api/features", tags=["features"])

# --- BONUS AIRDROPS ---

@router.get("/airdrops", response_model=List[schemas.BonusAirdropResponse])
def get_airdrops(db: Session = Depends(get_db)):
    """Fetch all active bonus airdrops."""
    return db.query(models.BonusAirdrop).filter(models.BonusAirdrop.is_active == True).all()

@router.post("/airdrops", response_model=schemas.BonusAirdropResponse)
def create_airdrop(airdrop: schemas.BonusAirdropCreate, db: Session = Depends(get_db)):
    """Create a new bonus airdrop (admin/mentor)."""
    db_airdrop = models.BonusAirdrop(**airdrop.model_dump())
    db.add(db_airdrop)
    db.commit()
    db.refresh(db_airdrop)
    return db_airdrop

# --- DAILY SCENARIOS ---

@router.get("/scenarios", response_model=List[schemas.DailyScenarioResponse])
def get_scenarios(db: Session = Depends(get_db)):
    """Fetch daily scenarios."""
    return db.query(models.DailyScenario).order_by(models.DailyScenario.date_added.desc()).all()

@router.post("/scenarios", response_model=schemas.DailyScenarioResponse)
def create_scenario(scenario: schemas.DailyScenarioCreate, db: Session = Depends(get_db)):
    """Create a new daily scenario."""
    db_scenario = models.DailyScenario(**scenario.model_dump())
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    return db_scenario

