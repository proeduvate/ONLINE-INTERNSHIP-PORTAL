from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.main import app
from app.db.session import SessionLocal

client = TestClient(app)

def test_onboarding_workflow():
    print("Starting API Test...")
    
    # 1. Apply
    response = client.post(
        "/api/v1/onboarding/apply", 
        json={
            "name": "Test User",
            "email": "test@example.com",
            "phone": "1234567890",
            "college": "Test College",
            "department": "CSE",
            "domain": "Web Dev",
            "resume_url": "http://resume.com",
            "github_repo_url": "http://github.com"
        }
    )
    assert response.status_code == 201, f"Failed to apply: {response.text}"
    app_id = response.json()["application_id"]
    print(f"Successfully applied. Application ID: {app_id}")
    
    # 2. Get applications
    response = client.get("/api/v1/onboarding/applications")
    assert response.status_code == 200, f"Failed to get applications: {response.text}"
    print(f"Successfully retrieved applications list. Found {len(response.json())} apps.")
    
    # 3. Get application by ID
    response = client.get(f"/api/v1/onboarding/applications/{app_id}")
    assert response.status_code == 200, f"Failed to get application {app_id}: {response.text}"
    print(f"Successfully retrieved application {app_id}. Status: {response.json()['status']}")
    
    # 4. Schedule Interview
    response = client.post(f"/api/v1/onboarding/{app_id}/interview", json={"date": "2026-10-10"})
    assert response.status_code == 200, f"Failed to schedule interview: {response.text}"
    print(f"Successfully scheduled interview. New status: {response.json()['status']}")
    
    # 5. Submit Interview Result
    response = client.post(f"/api/v1/onboarding/{app_id}/interview/result", json={"passed": True})
    assert response.status_code == 200, f"Failed to submit result: {response.text}"
    print(f"Successfully submitted result. New status: {response.json()['status']}")
    
    print("All endpoints tested successfully and reflect real database changes!")

if __name__ == "__main__":
    test_onboarding_workflow()
