import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
from database import SessionLocal

def seed():
    db = SessionLocal()
    # Check for domain
    domain = db.query(models.Domain).first()
    if not domain:
        domain = models.Domain(name="Artificial Intelligence", description="AI Domain")
        db.add(domain)
        db.commit()
        db.refresh(domain)
        
    # Check if tasks exist
    if db.query(models.Task).count() > 0:
        print("Tasks already seeded.")
        return
        
    tasks = [
        models.Task(domain_id=domain.id, day_number=1, title="Introduction to React", description="Understand component composition, JSX, and render paths.", instructions="Read the notes and complete the test.", task_type="coding", difficulty="easy"),
        models.Task(domain_id=domain.id, day_number=2, title="State and Props", description="Learn to handle component data flow.", instructions="Complete the assessment.", task_type="coding", difficulty="medium"),
        models.Task(domain_id=domain.id, day_number=3, title="React Hooks", description="Implement useEffect.", instructions="Complete the assessment.", task_type="coding", difficulty="hard"),
    ]
    db.add_all(tasks)
    db.commit()
    print("Tasks seeded.")
    db.close()

if __name__ == "__main__":
    seed()
