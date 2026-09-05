import os

routers_dir = "backend/routers"

# tasks.py
tasks_content = """from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_tasks(db: Session = Depends(get_db)):
    return []
"""
with open(os.path.join(routers_dir, "tasks.py"), "w") as f:
    f.write(tasks_content)

# analytics.py
analytics_content = """from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_analytics(db: Session = Depends(get_db)):
    return {"leaderboard": [], "stats": {}}
"""
with open(os.path.join(routers_dir, "analytics.py"), "w") as f:
    f.write(analytics_content)

# submissions.py
submissions_content = """from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_submissions(db: Session = Depends(get_db)):
    return []
"""
with open(os.path.join(routers_dir, "submissions.py"), "w") as f:
    f.write(submissions_content)

# users.py
users_content = """from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return []
"""
with open(os.path.join(routers_dir, "users.py"), "w") as f:
    f.write(users_content)

print("Created missing router files.")
