import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import DomainCodeAssessment, Task, Domain

def update_task_coding_prompts():
    db = SessionLocal()
    try:
        python_domain = db.query(Domain).filter(Domain.name == "Python").first()
        if not python_domain:
            print("Python domain not found")
            return
            
        # For each day from 1 to 30
        for day in range(1, 31):
            # Fetch the assessments for that day
            assessments = db.query(DomainCodeAssessment).filter(
                DomainCodeAssessment.domain_name == "Python",
                DomainCodeAssessment.day_number == day
            ).order_by(DomainCodeAssessment.id).all()
            
            if not assessments:
                continue
                
            title = assessments[0].title
            prompt_parts = [title]
            
            for idx, a in enumerate(assessments):
                prompt_parts.append(f"{idx+1}. {a.description}")
                
            coding_prompt = "\n".join(prompt_parts)
            
            # Update the coding task for that day
            task = db.query(Task).filter(
                Task.domain_id == python_domain.id,
                Task.day_number == day,
                Task.task_type == "coding"
            ).first()
            
            if task:
                task.coding_prompt = coding_prompt
                print(f"Updated coding prompt for Day {day}")
                
        db.commit()
        print("Successfully updated all Python Task coding prompts!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_task_coding_prompts()
