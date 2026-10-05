import os
from pathlib import Path
from dotenv import load_dotenv

try:
    from backend.database import engine, SessionLocal, Base, get_db
except ImportError:
    try:
        from database import engine, SessionLocal, Base, get_db
    except ImportError:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker, declarative_base

        env_path = Path(__file__).resolve().parent.parent.parent / ".env"
        load_dotenv(dotenv_path=env_path, override=False)
        DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

        if DATABASE_URL.startswith("sqlite"):
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base = declarative_base()

        def get_db():
            db = SessionLocal()
            try:
                yield db
            finally:
                db.close()
