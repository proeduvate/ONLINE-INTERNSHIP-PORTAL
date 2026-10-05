from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
engine = create_engine(db_url)

with engine.connect() as conn:
    # Delete duplicate airdrops by keeping only the first one (min id) for each question
    query = """
    DELETE FROM bonus_airdrops
    WHERE id NOT IN (
        SELECT MIN(id)
        FROM bonus_airdrops
        GROUP BY question
    );
    """
    try:
        conn.execute(text("COMMIT"))
        conn.execute(text(query))
        conn.execute(text("COMMIT"))
        print("Duplicates deleted successfully.")
    except Exception as e:
        print("Error deleting duplicates:", e)
        conn.execute(text("ROLLBACK"))
