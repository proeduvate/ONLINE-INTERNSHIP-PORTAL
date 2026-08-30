import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Locate the .env file explicitly in the backend directory
env_path = Path(__file__).resolve().parent / ".env"

# 2. Force load the .env file (override=True ensures cached/system env vars are replaced)
load_dotenv(dotenv_path=env_path, override=True)

# 3. Fetch the DATABASE_URL environment variable with SQLite fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./scripts/legacy_data/internship_portal.db")

# Debug output to verify what string Python is reading upon startup
print("\n" + "=" * 50)
print("DEBUG: LOADED DATABASE_URL ->", DATABASE_URL)
print("=" * 50 + "\n")

# 4. Initialize the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Automatically check and restore dropped connections
)

# 5. Create SessionLocal class for database queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6. Create Base class for SQLAlchemy ORM models
Base = declarative_base()

# 7. Dependency generator to manage database sessions in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
