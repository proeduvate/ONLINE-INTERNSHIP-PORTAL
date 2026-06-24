from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse
import os

# 1. Clear text credentials
DB_USER = "root"
DB_PASS = ""
DB_HOST = "127.0.0.1"
DB_PORT = "3306"
DB_NAME = "internship_portal"

# 2. URL encode the password to safely escape the '@' and '#' symbols
ENCODED_PASS = urllib.parse.quote_plus(DB_PASS)

# 3. Assemble the final safe connection URL
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{ENCODED_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    # 4. Engine setup (MySQL) with a timeout so it doesn't hang if MySQL is down
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        pool_pre_ping=True,
        connect_args={"connect_timeout": 2}
    )
    # Test connection
    with engine.connect() as conn:
        pass
    print("Database: Connected to MySQL successfully.")
except Exception as e:
    print(f"Database: MySQL connection failed ({e}). Falling back to SQLite.")
    # Use SQLite fallback in the backend folder
    sqlite_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "internship_portal.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{sqlite_db_path}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    print(f"Database: Initialized SQLite at {sqlite_db_path}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()