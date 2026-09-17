import os
import json
import logging
import sys

# Ensure backend directory is in path
sys.path.append(r"C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend")

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import DomainMCQQuestion, Domain

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_java_mcqs():
    db: Session = SessionLocal()
    try:
        java_mcq_dir = os.path.join(r"C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend\question_bank\java")
        if not os.path.exists(java_mcq_dir):
            logger.error(f"Directory {java_mcq_dir} not found!")
            return

        added = 0
        updated = 0

        for filename in os.listdir(java_mcq_dir):
            if not filename.endswith('.json'):
                continue
                
            file_path = os.path.join(java_mcq_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                day_data = json.load(f)
            if isinstance(day_data, list):
                day_data = day_data[0]
            
            day_number = day_data.get('day')
            topic = day_data.get('topic')
            questions = day_data.get('questions', day_data.get('mcqs', []))
            
            # Erase existing questions for this day before seeding
            db.query(DomainMCQQuestion).filter(
                DomainMCQQuestion.domain_name == "Java",
                DomainMCQQuestion.day_number == day_number
            ).delete()
            db.commit()
            
            existing_map = {}

            for q in questions:
                # Make the ID domain-specific to avoid unique constraint violations
                q_id = q['id']
                if not q_id.startswith('JAVA-'):
                    q_id = f"JAVA-{q_id}"
                    
                if q_id in existing_map:
                    existing_q = existing_map[q_id]
                    existing_q.question_text = q['question']
                    existing_q.option_a = q['options']['A']
                    existing_q.option_b = q['options']['B']
                    existing_q.option_c = q['options'].get('C', '')
                    existing_q.option_d = q['options'].get('D', '')
                    existing_q.correct_answer = q['answer']
                    existing_q.topic = topic
                    updated += 1
                else:
                    new_q = DomainMCQQuestion(
                        domain_name="Java",
                        day_number=day_number,
                        question_id=q_id,
                        topic=topic,
                        question_text=q['question'],
                        option_a=q['options']['A'],
                        option_b=q['options']['B'],
                        option_c=q['options'].get('C', ''),
                        option_d=q['options'].get('D', ''),
                        correct_answer=q['answer']
                    )
                    db.add(new_q)
                    added += 1
        
        db.commit()
        logger.info(f"Java MCQs seeded successfully! Added: {added}, Updated: {updated}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding Java MCQs: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_java_mcqs()
