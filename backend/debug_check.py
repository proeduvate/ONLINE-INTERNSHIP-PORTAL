import requests, json

BASE = "http://localhost:8000"

# Login as intern (JSON body)
r = requests.post(f"{BASE}/login", json={"email": "intern@gmail.com", "password": "intern123"})
if r.status_code != 200:
    print(f"Login failed: {r.status_code} {r.text}")
    r = requests.post(f"{BASE}/login", json={"email": "intern@gmail.com", "password": "password"})
    if r.status_code != 200:
        print(f"Login attempt 2 failed: {r.status_code} {r.text}")
        exit(1)

token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}
print(f"Logged in successfully.")

# Fetch tasks
print("\n--- /tasks/intern ---")
r = requests.get(f"{BASE}/tasks/intern", headers=headers)
if r.status_code == 200:
    tasks = r.json()
    if isinstance(tasks, list):
        for t in tasks[:10]:
            print(f"  Day {t.get('day_number')}: status={t.get('status')}, unlocked={t.get('unlocked')}, attendance={t.get('day_attendance')}, title={t.get('title')[:50]}")
    else:
        print(tasks)
else:
    print(f"Failed: {r.status_code} {r.text[:200]}")
