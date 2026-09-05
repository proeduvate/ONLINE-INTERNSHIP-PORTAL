from sqlalchemy import create_engine
import models
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
# Drop the certificates table
models.Certificate.__table__.drop(engine, checkfirst=True)
# Recreate all tables
models.Base.metadata.create_all(bind=engine)

print("Dropped and recreated certificates table.")
