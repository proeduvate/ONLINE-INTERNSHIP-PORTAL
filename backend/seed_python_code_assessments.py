import os
import json
import logging
import sys

# Ensure backend directory is in path
sys.path.append(r"C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend")

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import DomainCodeAssessment

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_python_code_assessments():
    db: Session = SessionLocal()
    try:
        python_code_dir = os.path.join(r"C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend\code_assessment_bank\python")
        if not os.path.exists(python_code_dir):
            logger.error(f"Directory {python_code_dir} not found!")
            return

        added = 0

        for filename in os.listdir(python_code_dir):
            if not filename.endswith('.json'):
                continue
                
            file_path = os.path.join(python_code_dir, filename)
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                day_data = json.load(f)
            
            if isinstance(day_data, list):
                day_data = day_data[0]
            
            day_number = day_data.get('day')
            topic = day_data.get('topic')
            title = day_data.get('title', f"Python Day {day_number} Code Assessment")
            questions = day_data.get('questions', day_data.get('mcqs', []))
            
            # Erase existing questions for this day and domain before seeding to avoid duplicates
            db.query(DomainCodeAssessment).filter(
                DomainCodeAssessment.domain_name == "Python",
                DomainCodeAssessment.day_number == day_number
            ).delete()
            db.commit()

            for q in questions:
                q_id = str(q['id'])
                if not q_id.startswith('PY-CODE-'):
                    q_id = f"PY-CODE-{q_id}"
                    
                new_q = DomainCodeAssessment(
                    domain_name="Python",
                    day_number=day_number,
                    question_id=q_id,
                    topic=topic,
                    title=title,
                    description=q['question'],
                    requirements="[]"
                )
                db.add(new_q)
                added += 1
        
        db.commit()
        logger.info(f"Python Code Assessments seeded successfully! Added: {added}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding Python Code Assessments: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_python_code_assessments()
