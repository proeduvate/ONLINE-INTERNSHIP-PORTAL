import os
import sys
import json
import glob

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import DomainCodeAssessment

def seed_python_code_assessments():
    db = SessionLocal()
    try:
        # First, remove existing Python code assessments to avoid duplicates
        deleted = db.query(DomainCodeAssessment).filter(DomainCodeAssessment.domain_name == "Python").delete()
        print(f"Deleted {deleted} existing Python code assessments.")
        db.commit()

        # Get all day JSON files in the python code assessment bank
        bank_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
            "learning", 
            "code_assessment_bank", 
            "python"
        )
        
        json_files = glob.glob(os.path.join(bank_dir, "day*.json"))
        
        total_seeded = 0
        
        for file_path in json_files:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
                
            day = data.get("day")
            topic = data.get("topic", "Unknown Topic")
            title = data.get("title", f"Python Day {day} Code Assessment")
            
            for idx, q in enumerate(data.get("questions", [])):
                q_id = f"PY-CODE-D{day}-Q{idx+1:03d}"
                
                assessment = DomainCodeAssessment(
                    domain_name="Python",
                    day_number=day,
                    question_id=q_id,
                    topic=topic,
                    title=title,
                    description=q.get("question", ""),
                    requirements="Use python language and correct logic."
                )
                db.add(assessment)
                total_seeded += 1
                
        db.commit()
        print(f"Successfully seeded {total_seeded} Python code assessments!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_python_code_assessments()
