from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse
import os

# Prefer a standard DATABASE_URL if provided.
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    DB_USER = os.environ.get("POSTGRES_USER", "postgres")
    DB_PASS = os.environ.get("POSTGRES_PASSWORD", "postgres")
    DB_HOST = os.environ.get("POSTGRES_HOST", "127.0.0.1")
    DB_PORT = os.environ.get("POSTGRES_PORT", "5432")
    DB_NAME = os.environ.get("POSTGRES_DB", "internship_portal")

    # URL encode the password to safely escape the '@' and '#' symbols
    ENCODED_PASS = urllib.parse.quote_plus(DB_PASS)
    SQLALCHEMY_DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:{ENCODED_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        pass
    print("Database: Connected to PostgreSQL successfully.")
except Exception as e:
    print(f"Database: PostgreSQL connection failed ({e}).")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()