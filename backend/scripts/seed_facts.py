import sys
import os
import json

# Add the parent directory to sys.path so we can import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal
from models import Base, DomainFact

# This ensures the domain_facts table is created if it doesn't exist
Base.metadata.create_all(bind=engine)

def seed_facts():
    db = SessionLocal()
    
    # Check if we already have facts
    if db.query(DomainFact).count() > 0:
        print("Facts already exist in the database. Clearing existing facts to re-seed...")
        from models import InternFactHistory
        db.query(InternFactHistory).delete()
        db.query(DomainFact).delete()
        db.commit()

    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "facts_data.json")
    with open(json_path, "r", encoding="utf-8") as f:
        facts_data = json.load(f)

    for fact_data in facts_data:
        fact = DomainFact(
            domain=fact_data["domain"],
            fact=fact_data["fact"]
        )
        db.add(fact)
    
    db.commit()
    print(f"Successfully seeded {len(facts_data)} domain facts.")
    db.close()

if __name__ == "__main__":
    seed_facts()
