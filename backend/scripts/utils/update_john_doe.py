from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
engine = create_engine(db_url)

with engine.connect() as conn:
    try:
        conn.execute(text("COMMIT"))
        # 4 is AIML
        conn.execute(text("UPDATE users SET domain_id = 4 WHERE full_name = 'John Doe'"))
        conn.execute(text("COMMIT"))
        print("Updated John Doe to AI/ML domain.")
    except Exception as e:
        print("Error updating user:", e)
        conn.execute(text("ROLLBACK"))
