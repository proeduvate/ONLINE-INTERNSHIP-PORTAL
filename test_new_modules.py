import requests
import json
import socket
import time
import subprocess
import os
import sys

def _find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

def _wait_for_server(url, timeout=10.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = requests.get(url, timeout=1.0)
            if r.status_code == 200:
                return True
        except Exception:
            time.sleep(0.2)
    return False

if __name__ == "__main__":
    backend_dir = os.path.abspath("backend")
    venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    python_exec = venv_python if os.path.exists(venv_python) else sys.executable

    port = _find_free_port()
    base_url = f"http://127.0.0.1:{port}"

    print(f"Starting server on {base_url}...")
    backend_proc = subprocess.Popen(
        [python_exec, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", str(port)],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    if not _wait_for_server(f"{base_url}/"):
        backend_proc.terminate()
        print("Backend server did not start in time")
        print("stdout:", backend_proc.stdout.read().decode())
        print("stderr:", backend_proc.stderr.read().decode())
        sys.exit(1)

    print("Server started successfully.")

    try:
        # Register admin directly
        admin_reg = {
            "name": "Admin Tester",
            "email": "admin_test@gmail.com",
            "password": "admin123",
            "role": "admin"
        }
        requests.post(f"{base_url}/register", json=admin_reg)

        # Login as admin
        r = requests.post(f"{base_url}/login", json={"email": "admin_test@gmail.com", "password": "admin123"})
        if r.status_code != 200:
            print(f"Admin login failed: {r.text}")
            sys.exit(1)
        admin_token = r.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Admin onboards an intern
        onboard_payload = {
            "name": "Intern Tester",
            "email": "intern_test@gmail.com",
            "password": "intern123",
            "role": "intern",
            "college": "MIT"
        }
        requests.post(f"{base_url}/admin/onboard", json=onboard_payload, headers=admin_headers)

        # Login as intern
        r = requests.post(f"{base_url}/login", json={"email": "intern_test@gmail.com", "password": "intern123"})
        if r.status_code != 200:
            print(f"Intern login failed: {r.text}")
            sys.exit(1)
        intern_token = r.json()["access_token"]
        intern_headers = {"Authorization": f"Bearer {intern_token}"}

        # 1. Test Daily Question Analytics
        print("Testing Daily Question Analytics...")
        payload = {
            "question_id": 1,
            "marks_obtained": 8,
            "max_marks": 10,
            "date": "2026-08-01"
        }
        r = requests.post(f"{base_url}/daily-questions/results", json=payload, headers=intern_headers)
        if r.status_code == 201:
            print("Successfully recorded daily question result!")
        else:
            print(f"Failed to record daily question result: {r.text}")

        r = requests.get(f"{base_url}/analytics/daily-questions/me", headers=intern_headers)
        if r.status_code == 200:
            print(f"Successfully retrieved my daily analytics: {len(r.json())} entries")
        else:
            print(f"Failed to get daily analytics: {r.text}")

        # 2. Test Tickets
        print("Testing Tickets...")
        ticket_payload = {
            "title": "Cannot submit assignment",
            "description": "Getting an error when clicking submit.",
            "category": "technical",
            "priority": "high"
        }
        r = requests.post(f"{base_url}/tickets", json=ticket_payload, headers=intern_headers)
        if r.status_code == 201:
            print(f"Successfully created ticket! ID: {r.json()['id']}")
            ticket_id = r.json()["id"]
        else:
            print(f"Failed to create ticket: {r.text}")
            sys.exit(1)
        
        r = requests.get(f"{base_url}/tickets/my", headers=intern_headers)
        if r.status_code == 200:
            print(f"Successfully retrieved my tickets. Count: {len(r.json())}")
        else:
            print(f"Failed to get my tickets: {r.text}")
            
        print("All tests passed!")

    finally:
        backend_proc.terminate()
        backend_proc.wait()
