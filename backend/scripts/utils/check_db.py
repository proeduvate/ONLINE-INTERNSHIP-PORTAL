from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Domains in DB:")
    domains = conn.execute(text("SELECT id, name FROM domains")).fetchall()
    for d in domains:
        print(d)

    print("\nDailyScenarios in DB:")
    scenarios = conn.execute(text("SELECT id, domain, day_number, step_number FROM daily_scenarios")).fetchall()
    for s in scenarios:
        print(s)
