import sys
sys.path.append('.')
from database import SessionLocal
from models import User, Domain

db = SessionLocal()
user = db.query(User).filter(User.email == 'kaul190905@gmail.com').first()
domain_obj = db.query(Domain).filter(Domain.name == 'Full Stack').first()

if domain_obj and user:
    user.domain_id = domain_obj.id
    db.commit()
    print('Updated user domain_id to:', domain_obj.id)
