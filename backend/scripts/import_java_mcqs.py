import json
import os
import sys
import re

# Ensure backend directory is in path
sys.path.append(r"C:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend")

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import DomainMCQQuestion

JSON_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "java_mcqs_30_days.json")

def load_and_fix_json(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Step 1: Normalize multiple arrays separating days
    fixed = re.sub(r'\]\s*,\s*\[', ',', content)
    fixed = re.sub(r'\]\s*,\s*\{', ',\n{', fixed)
    fixed = re.sub(r'\}\s*,\s*\[', ',\n', fixed)

    # Step 2: Fix specific raw quotes inside code snippets
    fixed = fixed.replace('`List.of("A", "B")`', '`List.of(\\"A\\", \\"B\\")`')

    # Step 3: Ensure valid outer array wrapping
    stripped = fixed.strip()
    if not stripped.startswith('['):
        stripped = '[' + stripped
    if not stripped.endswith(']'):
        stripped = stripped.rstrip(',') + ']'

    # Fix any trailing commas before closing braces/brackets
    stripped = re.sub(r',\s*([\]\}])', r'\1', stripped)

    try:
        data = json.loads(stripped)
    except json.JSONDecodeError as e:
        print(f"JSON parse error at line {e.lineno}, col {e.colno} (pos {e.pos}): {e.msg}")
        raise e

    # Flatten if list of lists
    flat_data = []
    if isinstance(data, list):
        for item in data:
            if isinstance(item, list):
                flat_data.extend(item)
            elif isinstance(item, dict):
                flat_data.append(item)
    elif isinstance(data, dict):
        flat_data = [data]

    return flat_data

def import_all_java_mcqs():
    if not os.path.exists(JSON_FILE_PATH):
        print(f"File not found: {JSON_FILE_PATH}")
        return

    print(f"Loading and validating Java MCQ data from: {JSON_FILE_PATH}")
    days_data = load_and_fix_json(JSON_FILE_PATH)
    
    # Deduplicate days (in case a day was pasted more than once)
    days_map = {}
    for day_item in days_data:
        day_num = day_item.get("day")
        if day_num:
            days_map[day_num] = day_item

    sorted_days = sorted(days_map.keys())
    print(f"Successfully processed {len(sorted_days)} unique days: {sorted_days}")

    db: Session = SessionLocal()
    try:
        # Clear existing Java questions completely to guarantee clean slate
        deleted = db.query(DomainMCQQuestion).filter(
            DomainMCQQuestion.domain_name.ilike('%java%')
        ).delete(synchronize_session=False)
        db.commit()
        print(f"Cleared {deleted} existing Java records from domain_mcq_questions.")

        total_inserted = 0

        for day_num in sorted_days:
            day_item = days_map[day_num]
            topic = day_item.get("topic", f"Java Day {day_num}")
            questions = day_item.get("mcqs", day_item.get("questions", []))

            if not questions:
                continue

            for idx, q in enumerate(questions, start=1):
                q_id = f"JAVA-D{day_num:02d}-Q{idx:02d}"

                options = q.get("options", [])
                if isinstance(options, list):
                    opt_a = options[0] if len(options) > 0 else ""
                    opt_b = options[1] if len(options) > 1 else ""
                    opt_c = options[2] if len(options) > 2 else ""
                    opt_d = options[3] if len(options) > 3 else ""
                elif isinstance(options, dict):
                    opt_a = options.get("A", "")
                    opt_b = options.get("B", "")
                    opt_c = options.get("C", "")
                    opt_d = options.get("D", "")
                else:
                    opt_a, opt_b, opt_c, opt_d = "", "", "", ""

                ans_val = str(q.get("answer", q.get("correct_answer", ""))).strip()
                if ans_val.upper() in ["A", "B", "C", "D"]:
                    correct_answer = ans_val.upper()
                else:
                    if ans_val == str(opt_a).strip():
                        correct_answer = "A"
                    elif ans_val == str(opt_b).strip():
                        correct_answer = "B"
                    elif ans_val == str(opt_c).strip():
                        correct_answer = "C"
                    elif ans_val == str(opt_d).strip():
                        correct_answer = "D"
                    else:
                        correct_answer = "A"

                raw_question = q.get("question", "")
                # Strip out tags like [Day 1, Q1]
                clean_question = re.sub(r'\s*\[Day\s*\d+,\s*Q\d+\]', '', raw_question, flags=re.IGNORECASE)
                # Clean up space before question mark if any
                clean_question = re.sub(r'\s+\?', '?', clean_question)

                record = DomainMCQQuestion(
                    domain_name="Java",
                    day_number=day_num,
                    question_id=q_id,
                    topic=topic,
                    question_text=clean_question,
                    option_a=opt_a,
                    option_b=opt_b,
                    option_c=opt_c,
                    option_d=opt_d,
                    correct_answer=correct_answer
                )
                db.add(record)
                total_inserted += 1

            db.commit()
            print(f"  [Day {day_num:02d}] Inserted {len(questions)} MCQs -> {topic}")

        print(f"\n========================================================")
        print(f"SUCCESS: Successfully inserted {total_inserted} Java MCQs across {len(sorted_days)} days into DB!")
        print(f"========================================================")

    except Exception as e:
        db.rollback()
        print(f"Error during import: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_all_java_mcqs()
