import os
import json
import logging
import sys

sys.path.append(r"c:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend")

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import DomainMCQQuestion, Domain

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_uiux_mcqs():
    db: Session = SessionLocal()
    try:
        uiux_mcq_dir = os.path.join(r"c:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend\learning\question_bank\uiux")
        if not os.path.exists(uiux_mcq_dir):
            logger.error(f"Directory {uiux_mcq_dir} not found!")
            return

        added = 0
        updated = 0

        for filename in sorted(os.listdir(uiux_mcq_dir)):
            if not filename.endswith('.json'):
                continue
                
            file_path = os.path.join(uiux_mcq_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                day_data = json.load(f)
            if isinstance(day_data, list):
                day_data = day_data[0]
            
            day_number = day_data.get('day')
            topic = day_data.get('topic')
            questions = day_data.get('questions', day_data.get('mcqs', []))
            
            logger.info(f"Processing UI/UX Day {day_number}: {topic} ({len(questions)} questions)")

            for idx, q in enumerate(questions, 1):
                raw_id = str(q.get('id', f'Q-D{day_number}-{idx:03d}'))
                # Ensure unique, domain-scoped question_id
                if not raw_id.startswith('UIUX-'):
                    q_id = f"UIUX-{raw_id}"
                else:
                    q_id = raw_id

                options = q.get('options', [])
                if isinstance(options, list):
                    opt_a = options[0] if len(options) > 0 else ""
                    opt_b = options[1] if len(options) > 1 else ""
                    opt_c = options[2] if len(options) > 2 else ""
                    opt_d = options[3] if len(options) > 3 else ""
                elif isinstance(options, dict):
                    opt_a = options.get('A', '')
                    opt_b = options.get('B', '')
                    opt_c = options.get('C', '')
                    opt_d = options.get('D', '')
                else:
                    opt_a, opt_b, opt_c, opt_d = "", "", "", ""

                raw_answer = str(q.get('answer', q.get('correct_answer', ''))).strip()
                # Determine correct letter A, B, C, or D
                if raw_answer.upper() in ['A', 'B', 'C', 'D']:
                    correct_answer = raw_answer.upper()
                else:
                    # Match answer text to option text
                    if raw_answer == str(opt_a).strip():
                        correct_answer = 'A'
                    elif raw_answer == str(opt_b).strip():
                        correct_answer = 'B'
                    elif raw_answer == str(opt_c).strip():
                        correct_answer = 'C'
                    elif raw_answer == str(opt_d).strip():
                        correct_answer = 'D'
                    else:
                        logger.warning(f"Could not match answer '{raw_answer}' for question {q_id}, defaulting to 'A'")
                        correct_answer = 'A'

                question_text = q.get('question', '')

                # Check if this specific question already exists in UI/UX domain
                existing_q = db.query(DomainMCQQuestion).filter(
                    DomainMCQQuestion.question_id == q_id
                ).first()

                if existing_q:
                    existing_q.domain_name = "UI/UX"
                    existing_q.day_number = day_number
                    existing_q.topic = topic
                    existing_q.question_text = question_text
                    existing_q.option_a = opt_a
                    existing_q.option_b = opt_b
                    existing_q.option_c = opt_c
                    existing_q.option_d = opt_d
                    existing_q.correct_answer = correct_answer
                    updated += 1
                else:
                    new_q = DomainMCQQuestion(
                        domain_name="UI/UX",
                        day_number=day_number,
                        question_id=q_id,
                        topic=topic,
                        question_text=question_text,
                        option_a=opt_a,
                        option_b=opt_b,
                        option_c=opt_c,
                        option_d=opt_d,
                        correct_answer=correct_answer
                    )
                    db.add(new_q)
                    added += 1

            db.commit()
            logger.info(f"Finished UI/UX Day {day_number}. Current total Added: {added}, Updated: {updated}")

        print(f"DONE: Successfully inserted {added} new MCQs and updated {updated} existing MCQs for domain 'UI/UX'.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding UI/UX MCQs: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_uiux_mcqs()
