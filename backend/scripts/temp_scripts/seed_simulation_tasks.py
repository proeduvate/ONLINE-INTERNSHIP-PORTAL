import sys
import os

# Ensure backend directory is in path
sys.path.append(r'C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend')

from app.db.session import SessionLocal
from app.models import Task, Domain

db = SessionLocal()
domains = db.query(Domain).all()
total_added = 0

for d in domains:
    for day in range(1, 31):
        exists = db.query(Task).filter(
            Task.domain_id == d.id, 
            Task.task_type == 'simulation', 
            Task.day_number == day
        ).first()
        
        if not exists:
            new_task = Task(
                domain_id=d.id, 
                title=f"{d.name} Workplace Simulation Day {day}", 
                description=f"Workplace simulation for {d.name} day {day}", 
                task_type="simulation", 
                day_number=day
            )
            db.add(new_task)
            total_added += 1

db.commit()
print(f"Added {total_added} simulation tasks!")
