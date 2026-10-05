from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
engine = create_engine(db_url)

with engine.connect() as conn:
    print("Tasks for user:")
    # Get John Doe's user_id
    user = conn.execute(text("SELECT id, full_name, domain_id FROM users WHERE full_name = 'John Doe'")).fetchone()
    print("User:", user)

    # get tasks for this domain_id
    if user:
        tasks = conn.execute(text(f"SELECT id, domain_id, task_type, day_number FROM tasks WHERE domain_id = {user.domain_id} AND task_type = 'simulation' ORDER BY day_number LIMIT 5")).fetchall()
        print("Tasks for domain", user.domain_id, ":", tasks)
