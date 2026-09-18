import sys
import os
import json
from datetime import datetime

# Adjust path to find the 'app' module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.db.session import SessionLocal
from app.models import Domain, Task, DomainFact

def seed_curriculum():
    db = SessionLocal()
    try:
        # Get active domains from DB
        domains = db.query(Domain).all()
        print(f"Found {len(domains)} domains in DB.")
        
        # Load facts just to have some dynamic content if we want
        facts_path = os.path.join(os.path.dirname(__file__), '../../seed_data/domain_facts_list.json')
        facts_data = []
        if os.path.exists(facts_path):
            with open(facts_path, 'r', encoding='utf-8') as f:
                facts_data = json.load(f)
                
        # Simple mapping for JSON domain to DB domain
        domain_mapping = {
            "Data Engineering": "Data science",
            "Data Visualization": "Data science",
            "Product Developer": "Full Stack",
            "Database Management": "Backend",
            "Testing": "UI/UX"
        }
        
        # Seed Tasks for each domain
        for domain in domains:
            print(f"Seeding tasks for domain: {domain.name}")
            
            # Count existing tasks for this domain
            existing_tasks = db.query(Task).filter(Task.domain_id == domain.id).all()
            existing_days = {t.day_number for t in existing_tasks}
            
            # Find relevant facts for this domain
            relevant_facts = [
                f['fact'] for f in facts_data 
                if f.get('domain') == domain.name or domain_mapping.get(f.get('domain')) == domain.name
            ]
            
            # Create tasks for days that don't have one
            added_count = 0
            for day in range(1, 31):
                if day in existing_days:
                    continue
                    
                # Pick a fact if available, else generic text
                description = f"Complete the curriculum and tasks for Day {day}."
                if len(relevant_facts) > day:
                    description += f"\n\nToday's focus: {relevant_facts[day]}"
                
                new_task = Task(
                    domain_id=domain.id,
                    day_number=day,
                    title=f"Day {day} Learning & Assessment",
                    description=description,
                    deadline_days=1,
                    task_type="curriculum",
                    difficulty="Medium"
                )
                db.add(new_task)
                added_count += 1
            
            print(f"Added {added_count} new tasks for {domain.name}")

        db.commit()
        print("Curriculum seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding curriculum: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_curriculum()
