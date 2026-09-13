import json
import os
import sys

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import DomainFact, Domain

def seed_python_facts():
    db = SessionLocal()
    try:
        # Check if Python domain exists
        python_domain = db.query(Domain).filter(Domain.name == "Python").first()
        if not python_domain:
            print("Creating Python domain...")
            python_domain = Domain(name="Python", description="Python Programming Internship", duration_days=30)
            db.add(python_domain)
            db.commit()
            db.refresh(python_domain)
        
        # Load facts
        with open("python_facts.json", "r", encoding="utf-8") as f:
            facts = json.load(f)
            
        print(f"Loaded {len(facts)} facts. Inserting into database...")
        
        count = 0
        for item in facts:
            # Check if fact already exists
            existing = db.query(DomainFact).filter(
                DomainFact.domain == "Python",
                DomainFact.fact == item["fact"]
            ).first()
            
            if not existing:
                fact = DomainFact(
                    domain="Python",
                    fact=item["fact"]
                )
                db.add(fact)
                count += 1
                
        db.commit()
        print(f"Successfully inserted {count} new facts for the Python domain.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_python_facts()
