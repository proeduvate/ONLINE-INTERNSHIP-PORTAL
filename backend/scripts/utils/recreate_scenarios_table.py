import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine
from app.models import DailyScenario
from sqlalchemy import text

# Drop with CASCADE directly
with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS scenario_responses CASCADE;"))
    conn.execute(text("DROP TABLE IF EXISTS daily_scenarios CASCADE;"))

# Recreate
DailyScenario.__table__.create(engine, checkfirst=True)
print("Recreated daily_scenarios table with new schema.")
