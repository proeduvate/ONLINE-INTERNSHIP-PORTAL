import json
import os
import sys

# Add the backend directory to sys.path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models import DomainMCQQuestion

def seed_full_stack_mcqs():
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../full_stack_mcqs.json'))
    
    print(f"Loading data from: {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load JSON file. Please ensure syntax is correct: {e}")
        return
        
    db = SessionLocal()
    
    try:
        added_count = 0
        for day_data in data:
            day_number = day_data.get('day')
            topic = day_data.get('topic', '')
            mcqs = day_data.get('mcqs', [])
            
            for mcq in mcqs:
                # Prepend 'FS-' to avoid unique constraint violations with 'Frontend' questions
                original_id = mcq['id']
                question_id = f"FS-{original_id}" if not original_id.startswith("FS-") else original_id
                
                # Check if question already exists to avoid affecting existing data
                existing = db.query(DomainMCQQuestion).filter(DomainMCQQuestion.question_id == question_id).first()
                if existing:
                    continue
                
                options = mcq.get('options', [])
                answer_text = mcq.get('answer', '')
                
                # Map answer text to A, B, C, D
                correct_answer = "A"
                for idx, opt in enumerate(options):
                    if opt.strip() == answer_text.strip():
                        correct_answer = chr(ord('A') + idx)
                        break
                
                option_a = options[0] if len(options) > 0 else ""
                option_b = options[1] if len(options) > 1 else ""
                option_c = options[2] if len(options) > 2 else ""
                option_d = options[3] if len(options) > 3 else ""
                
                new_q = DomainMCQQuestion(
                    domain_name="Full Stack",
                    day_number=day_number,
                    question_id=question_id,
                    topic=topic,
                    question_text=mcq.get('question', ''),
                    option_a=option_a,
                    option_b=option_b,
                    option_c=option_c,
                    option_d=option_d,
                    correct_answer=correct_answer
                )
                db.add(new_q)
                added_count += 1
                
        db.commit()
        print(f"Successfully added {added_count} new questions for Full Stack domain.")
        
    except Exception as e:
        db.rollback()
        print(f"Error occurred during insertion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_full_stack_mcqs()
