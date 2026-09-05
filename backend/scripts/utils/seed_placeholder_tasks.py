import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app.models import Task, Domain

def seed_placeholder_tasks():
    db = SessionLocal()
    domains = db.query(Domain).all()
    
    for domain in domains:
        print(f"Adding placeholder simulation tasks for {domain.name}...")
        for day in range(1, 31):
            # Check if task already exists
            existing = db.query(Task).filter(
                Task.domain_id == domain.id,
                Task.task_type == "simulation",
                Task.day_number == day
            ).first()
            
            if not existing:
                new_task = Task(
                    domain_id=domain.id,
                    day_number=day,
                    title=f"{domain.name} Workplace Simulation Day {day}",
                    description=f"Workplace simulation for day {day}",
                    task_type="simulation",
                    mcq_questions="{}"  # Empty JSON, data is in daily_scenarios
                )
                db.add(new_task)
    
    db.commit()
    db.close()
    print("Placeholder tasks created successfully.")

if __name__ == "__main__":
    seed_placeholder_tasks()
