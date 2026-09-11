import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine, SessionLocal
from models import Base, Domain

Base.metadata.create_all(bind=engine)

def seed_domains():
    db = SessionLocal()
    
    expected_domains = [
        'Full Stack', 'AIML', 'Database Management', 'Testing', 'Product Developer',
        'Data Engineering', 'Backend', 'Cyber Security', 'Data Visualization',
        'Frontend', 'Human Resource Management', 'Cloud Technologies'
    ]
    
    added_count = 0
    for domain_name in expected_domains:
        # Check if it already exists
        existing = db.query(Domain).filter(Domain.name == domain_name).first()
        if not existing:
            new_domain = Domain(
                name=domain_name,
                description=f"Learn and build skills in {domain_name}."
            )
            db.add(new_domain)
            added_count += 1
            
    if added_count > 0:
        db.commit()
        print(f"Successfully added {added_count} missing domains to the database!")
    else:
        print("All domains already exist in the database.")
        
    db.close()

if __name__ == "__main__":
    seed_domains()
