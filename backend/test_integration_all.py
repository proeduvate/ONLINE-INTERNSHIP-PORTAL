import sys
import os

backend_dir = r"h:\Interns\ProEduvate\Online Internship Portal\ONLINE-INTERNSHIP-PORTAL\backend"
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
from models import User, Domain, Task, Ticket, PointTransaction, DomainFact
from core.security import hash_password

print("=== STARTING END-TO-END BACKEND INTEGRATION TEST ===")

Base.metadata.create_all(bind=engine)
db = SessionLocal()

domain = db.query(Domain).filter(Domain.name == "Frontend Development").first()
if not domain:
    domain = Domain(name="Frontend Development", description="Frontend Web Development")
    db.add(domain)
    db.commit()
    db.refresh(domain)

user = db.query(User).filter(User.email == "test_intern@example.com").first()
if not user:
    user = User(
        name="Test Intern",
        email="test_intern@example.com",
        hashed_password=hash_password("password123"),
        role="intern",
        domain_id=domain.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

client = TestClient(app)

# 1. Test Auth Login
print("\n[1] Testing Auth Login...")
res = client.post("/api/auth/login", json={"email": "test_intern@example.com", "password": "password123"})
print("Auth Login Status:", res.status_code)
assert res.status_code == 200, f"Auth login failed: {res.text}"
token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
print("Access token retrieved successfully.")

# 2. Test Profile & Password Endpoints (GET, PUT & POST change-password)
print("\n[2] Testing Profile & Password Endpoints...")
res = client.get("/api/users/profile", headers=headers)
print("Get Profile Status:", res.status_code)
assert res.status_code == 200

res = client.put("/api/users/profile", json={"name": "Test Intern Updated", "college": "MIT University"}, headers=headers)
print("Update Profile Status:", res.status_code)
assert res.status_code == 200

res = client.post("/api/users/change-password", json={"current_password": "password123", "new_password": "newpassword456"}, headers=headers)
print("Change Password Status:", res.status_code, res.json())
assert res.status_code == 200

# Verify login with new password
res_login_new = client.post("/api/auth/login", json={"email": "test_intern@example.com", "password": "newpassword456"})
print("Login with New Password Status:", res_login_new.status_code)
assert res_login_new.status_code == 200

# Revert password back to password123 for future tests
new_token = res_login_new.json().get("access_token")
new_headers = {"Authorization": f"Bearer {new_token}"}
client.post("/api/users/change-password", json={"current_password": "newpassword456", "new_password": "password123"}, headers=new_headers)

res_reset = client.post("/api/users/reset-password-request", headers=headers)
print("Reset Password Request Status:", res_reset.status_code, res_reset.json())
assert res_reset.status_code == 200

print("\n==================================================")
print("ALL PROFILE & PASSWORD RESET INTEGRATION TESTS PASSED!")
print("==================================================")
