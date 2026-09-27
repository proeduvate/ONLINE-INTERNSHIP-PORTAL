import os

files = [
    'routers/admin.py',
    'routers/mcq.py',
    'routers/mentor.py',
    'routers/onboarding.py',
    'services/scoring_service.py',
    'scoring_schemas.py',
    'mcq_schemas.py'
]

replacements = [
    ("from app.db import session as database", "import database"),
    ("from app.db.session import get_db", "from database import get_db"),
    ("from app import models", "import models"),
    ("from app.dependencies.auth import get_current_user", "from dependencies import get_current_user"),
    ("from app.services.scoring_service import", "from services.scoring_service import"),
    ("from app.schemas.scoring import", "from scoring_schemas import"),
    ("from app.schemas.mcq import", "from mcq_schemas import"),
    ("from app.core.security import pwd_context", "from main import pwd_context")
]

for file_path in files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r') as f:
        content = f.read()
        
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(file_path, 'w') as f:
        f.write(content)

print("Imports fixed!")
