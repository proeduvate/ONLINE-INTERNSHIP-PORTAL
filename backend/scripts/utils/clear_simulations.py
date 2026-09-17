from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
engine = create_engine(db_url)

with engine.connect() as conn:
    # Delete any simulation submissions that are using scenario "1" but aren't frontend day 1
    # Actually, let's just delete all simulation submissions so interns start fresh with correct logic
    query = """
    DELETE FROM submissions
    WHERE task_id IN (
        SELECT id FROM tasks WHERE task_type = 'simulation'
    );
    """
    try:
        conn.execute(text("COMMIT"))
        conn.execute(text(query))
        conn.execute(text("COMMIT"))
        print("Cleared simulation submissions. They will regenerate correctly on next visit.")
    except Exception as e:
        print("Error clearing submissions:", e)
        conn.execute(text("ROLLBACK"))
