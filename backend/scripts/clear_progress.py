import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models
import sys
sys.path.append('c:\\proeduvate\\ONLINE-INTERNSHIP-PORTAL\\backend')
from app import models

engine = create_engine("postgresql+psycopg2://postgres.vilcgxfidyjunirdkxxu:Proeduvate%401@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

intern = db.query(models.User).filter(models.User.email == 'intern2@gmail.com').first()
if intern:
    print(f"Found intern: {intern.email} (ID: {intern.id})")
    deleted = db.query(models.DailyQuestionResult).filter(models.DailyQuestionResult.intern_id == intern.id).delete()
    print(f"Deleted {deleted} daily question results.")
    
    intern.progress_pct = 0
    intern.attendance_pct = 0
    db.commit()
    print("Progress cleared.")
else:
    print("Intern not found.")
