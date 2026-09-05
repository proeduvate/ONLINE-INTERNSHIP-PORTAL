from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

certs = db.query(models.Certificate).all()
for c in certs:
    c.status = "PENDING_ADMIN_APPROVAL"
db.commit()
print("Reset all certificates to PENDING_ADMIN_APPROVAL")
