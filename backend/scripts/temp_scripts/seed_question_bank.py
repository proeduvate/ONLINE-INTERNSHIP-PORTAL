import sys
import os
import glob
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import models
from app.db import session as database
from app.db.session import Base, engine

Base.metadata.create_all(bind=engine)

DOMAIN_NAME = "Frontend"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MCQ_DIR = os.path.join(BASE_DIR, "question_bank")
CODE_DIR = os.path.join(BASE_DIR, "code_assessment_bank", "frontend")

db = next(database.get_db())

def seed_mcq():
    mcq_files = sorted(glob.glob(os.path.join(MCQ_DIR, "day*.json")))
    total_inserted = 0
    total_skipped = 0
    for filepath in mcq_files:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        day_number = data.get("day")
        topic = data.get("topic", "")
        questions = data.get("questions", [])
        if not day_number:
            continue
        for q in questions:
            question_id = q.get("id")
            if not question_id:
                continue
            exists = db.query(models.DomainMCQQuestion).filter_by(question_id=question_id).first()
            if exists:
                total_skipped += 1
                continue
            options = q.get("options", {})
            record = models.DomainMCQQuestion(
                domain_name=DOMAIN_NAME,
                day_number=day_number,
                question_id=question_id,
                topic=topic,
                question_text=q.get("question", ""),
                option_a=options.get("A", ""),
                option_b=options.get("B", ""),
                option_c=options.get("C", None),
                option_d=options.get("D", None),
                correct_answer=q.get("correct_answer", "A"),
            )
            db.add(record)
            total_inserted += 1
        db.commit()
        print(f"  [MCQ] Day {day_number:02d}: done")
    print(f"MCQ done. Inserted={total_inserted}, Skipped={total_skipped}")
    return total_inserted

def seed_code():
    code_files = sorted(glob.glob(os.path.join(CODE_DIR, "day*.json")))
    total_inserted = 0
    total_skipped = 0
    for filepath in code_files:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        day_number = data.get("day")
        topic = data.get("topic", "")
        questions = data.get("questions", [])
        if not day_number:
            continue
        for q in questions:
            question_id = q.get("id")
            if not question_id:
                continue
            exists = db.query(models.DomainCodeAssessment).filter_by(question_id=question_id).first()
            if exists:
                total_skipped += 1
                continue
            requirements = q.get("requirements", [])
            record = models.DomainCodeAssessment(
                domain_name=DOMAIN_NAME,
                day_number=day_number,
                question_id=question_id,
                topic=topic,
                title=q.get("title", ""),
                description=q.get("description", ""),
                requirements=json.dumps(requirements),
            )
            db.add(record)
            total_inserted += 1
        db.commit()
        print(f"  [CODE] Day {day_number:02d}: done")
    print(f"Code done. Inserted={total_inserted}, Skipped={total_skipped}")
    return total_inserted

print("=== Seeding MCQ ===")
seed_mcq()
print("=== Seeding Code Assessments ===")
seed_code()
print("=== ALL DONE ===")
