import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Locate the .env file explicitly in the backend directory
env_path = Path(__file__).resolve().parent / ".env"

# 2. Load the .env file (override=False ensures system/Render env vars take precedence)
load_dotenv(dotenv_path=env_path, override=False)

# 3. Fetch the DATABASE_URL environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Guard statement: fallback to local sqlite if missing or placeholder
if not DATABASE_URL or "YOUR_PROJECT_REF" in DATABASE_URL or "YOUR_ACTUAL_PASSWORD" in DATABASE_URL:
    DATABASE_URL = "sqlite:///./sql_app.db"

SQLALCHEMY_DATABASE_URL = DATABASE_URL

# 4. Initialize the SQLAlchemy engine
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    if DATABASE_URL.startswith("sqlite:///./"):
        backend_dir = Path(__file__).resolve().parent
        db_file = DATABASE_URL[len("sqlite:///./"):]
        resolved_db_path = (backend_dir / db_file).resolve().as_posix()
        DATABASE_URL = f"sqlite:///{resolved_db_path}"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
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
