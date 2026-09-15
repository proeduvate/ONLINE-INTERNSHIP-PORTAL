from app.db.session import SessionLocal
from app import models

db = SessionLocal()

java_qs = db.query(models.DomainCodeAssessment).filter(models.DomainCodeAssessment.domain_name == 'Java').order_by(models.DomainCodeAssessment.id).all()
python_qs = db.query(models.DomainCodeAssessment).filter(models.DomainCodeAssessment.domain_name == 'Python').order_by(models.DomainCodeAssessment.id).all()

if len(java_qs) == len(python_qs):
    for j, p in zip(java_qs, python_qs):
        p.title = j.title
    db.commit()
    print("Updated python titles!")
else:
    print("Length mismatch!")
