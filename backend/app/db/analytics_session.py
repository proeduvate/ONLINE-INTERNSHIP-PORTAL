import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use a separate SQLite database for analytics to avoid crashing the main DB
DATABASE_URL = "sqlite:///./analytics.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} # Needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_analytics_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
