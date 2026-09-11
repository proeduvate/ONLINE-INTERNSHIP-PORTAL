import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(backend_dir))

from app.db.session import engine
from app.models import BonusAirdrop, AirdropAttempt, AirdropResult

def migrate():
    print("Migrating Airdrop tables...")
    # Drop existing tables
    AirdropResult.__table__.drop(engine, checkfirst=True)
    AirdropAttempt.__table__.drop(engine, checkfirst=True)
    BonusAirdrop.__table__.drop(engine, checkfirst=True)
    
    # Recreate tables
    BonusAirdrop.__table__.create(engine)
    AirdropAttempt.__table__.create(engine)
    AirdropResult.__table__.create(engine)
    
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
