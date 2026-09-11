import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("DELETE FROM daily_scenarios;"))
    print("Deleted all records from daily_scenarios table.")
