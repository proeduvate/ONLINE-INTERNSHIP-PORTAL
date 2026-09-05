from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'daily_scenario'"))
    for row in result.mappings():
        print(dict(row))
