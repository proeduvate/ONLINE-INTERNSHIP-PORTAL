from app.database import SessionLocal
from app import models
import json

db = SessionLocal()
# Check if any simulation tasks exist for domain 4
sim_tasks = db.query(models.Task).filter(models.Task.domain_id == 4, models.Task.task_type == 'simulation').all()

if not sim_tasks:
    print("Creating mock simulation for domain 4")
    new_sim = models.Task(
        domain_id=4,
        task_type='simulation',
        title='AI Model Deployment Scenario',
        description='Your team needs to deploy a new NLP model. How do you approach this?',
        day_number=1,
        coding_prompt=json.dumps([
            {"id": "opt_1", "text": "Deploy as a REST API using FastAPI"},
            {"id": "opt_2", "text": "Deploy via batch processing script"},
            {"id": "opt_3", "text": "Embed directly into the frontend client"}
        ]),
        coding_solution="opt_1"
    )
    db.add(new_sim)
    db.commit()
    print("Added mock simulation for AI/ML")
else:
    print(f"Found {len(sim_tasks)} simulations for domain 4")

# ensure john doe is domain 4
john = db.query(models.User).filter(models.User.email == 'john@intern.com').first()
if john:
    john.domain_id = 4
    db.commit()
    print("Set John Doe to domain 4")
