import sys
import os

backend_dir = r"h:\Interns\ProEduvate\Online Internship Portal\ONLINE-INTERNSHIP-PORTAL\backend"
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import User
from core.security import create_access_token

client = TestClient(app)

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No user found in DB!")
    sys.exit(1)

token = create_access_token(user.id, user.role.value if hasattr(user.role, 'value') else str(user.role))
headers = {"Authorization": f"Bearer {token}"}

endpoints_to_test = [
    "/api/v1/leaderboard",
    "/api/v1/leaderboard?period=weekly",
    "/api/v1/facts",
    "/api/v1/tickets",
    "/api/v1/tasks",
    "/api/v1/analytics/daily-questions/me",
    "/api/v1/admin/final-evaluations"
]

print(f"Testing with User ID={user.id}, Role={user.role}:")

for ep in endpoints_to_test:
    res = client.get(ep, headers=headers)
    print(f"\nGET {ep} -> Status: {res.status_code}")
    if res.status_code != 200:
        print("  Response:", res.text[:300])
