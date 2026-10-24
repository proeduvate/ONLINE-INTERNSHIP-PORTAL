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

def seed_python_mcqs():
    db: Session = SessionLocal()
    try:
        python_mcq_dir = os.path.join(r"C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend\learning\question_bank\python")
        if not os.path.exists(python_mcq_dir):
            logger.error(f"Directory {python_mcq_dir} not found!")
            return

        added = 0
        updated = 0

        for filename in os.listdir(python_mcq_dir):
            if not filename.endswith('.json'):
                continue
                
            file_path = os.path.join(python_mcq_dir, filename)
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                day_data = json.load(f)
            if isinstance(day_data, list):
                day_data = day_data[0]
            
            day_number = day_data.get('day')
            topic = day_data.get('topic')
            questions = day_data.get('questions', day_data.get('mcqs', []))
            
            # Erase existing questions for this day before seeding
            db.query(DomainMCQQuestion).filter(
                DomainMCQQuestion.domain_name == "Python",
                DomainMCQQuestion.day_number == day_number
            ).delete()
            db.commit()
            
            existing_map = {}

            for q in questions:
                # Make the ID domain-specific to avoid unique constraint violations
                q_id = str(q['id'])
                if not q_id.startswith(f'PYTHON-D{day_number}-'):
                    q_id = f"PYTHON-D{day_number}-{q_id}"
                    
                if q_id in existing_map:
                    existing_q = existing_map[q_id]
                    existing_q.question_text = q['question']
                    existing_q.option_a = q['options'][0] if len(q['options']) > 0 else ''
                    existing_q.option_b = q['options'][1] if len(q['options']) > 1 else ''
                    existing_q.option_c = q['options'][2] if len(q['options']) > 2 else ''
                    existing_q.option_d = q['options'][3] if len(q['options']) > 3 else ''
                    ans_text = q['answer']
                    ans_letter = "A"
                    if len(q['options']) > 0 and ans_text == q['options'][0]: ans_letter = "A"
                    elif len(q['options']) > 1 and ans_text == q['options'][1]: ans_letter = "B"
                    elif len(q['options']) > 2 and ans_text == q['options'][2]: ans_letter = "C"
                    elif len(q['options']) > 3 and ans_text == q['options'][3]: ans_letter = "D"

                    existing_q.correct_answer = ans_letter
                    existing_q.topic = topic
                    updated += 1
                else:
                    ans_text = q['answer']
                    ans_letter = "A"
                    if len(q['options']) > 0 and ans_text == q['options'][0]: ans_letter = "A"
                    elif len(q['options']) > 1 and ans_text == q['options'][1]: ans_letter = "B"
                    elif len(q['options']) > 2 and ans_text == q['options'][2]: ans_letter = "C"
                    elif len(q['options']) > 3 and ans_text == q['options'][3]: ans_letter = "D"

                    new_q = DomainMCQQuestion(
                        domain_name="Python",
                        day_number=day_number,
                        question_id=q_id,
                        topic=topic,
                        question_text=q['question'],
                        option_a=q['options'][0] if len(q['options']) > 0 else '',
                        option_b=q['options'][1] if len(q['options']) > 1 else '',
                        option_c=q['options'][2] if len(q['options']) > 2 else '',
                        option_d=q['options'][3] if len(q['options']) > 3 else '',
                        correct_answer=ans_letter
                    )
                    db.add(new_q)
                    added += 1
        
        db.commit()
        logger.info(f"Python MCQs seeded successfully! Added: {added}, Updated: {updated}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding Python MCQs: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_python_mcqs()
