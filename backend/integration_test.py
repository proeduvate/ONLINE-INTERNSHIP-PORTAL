import requests
import json
import time
import os
from base64 import b64decode

BASE = "http://127.0.0.1:8000"

# Helper
def post(url, data=None, headers=None):
    return requests.post(BASE+url, json=data, headers=headers, timeout=10)

def get(url, headers=None):
    return requests.get(BASE+url, headers=headers, timeout=10)

print('Integration test starting...')

# 1) Login admin
r = post('/login', data={'email':'admin@gmail.com','password':'admin123'})
if r.status_code != 200:
    print('Admin login failed', r.status_code, r.text)
    raise SystemExit(1)
admin_token = r.json()['access_token']
admin_headers = {'Authorization': f'Bearer {admin_token}'}
print('Admin logged in')

# 2) Login intern
r2 = post('/login', data={'email':'intern@gmail.com','password':'intern123'})
if r2.status_code != 200:
    print('Intern login failed', r2.status_code, r2.text)
    raise SystemExit(1)
intern_token = r2.json()['access_token']
intern_headers = {'Authorization': f'Bearer {intern_token}'}
print('Intern logged in')

# 3) Fetch intern tasks
r = get('/tasks/intern', headers=intern_headers)
print('Tasks fetch', r.status_code)
tasks = r.json()
if not tasks:
    print('No tasks available; aborting')
    raise SystemExit(1)

# 4) Submit Day 1 code
task = tasks[0]
code = "def greeting(name):\n    return f'Hello, {name}!'"
mcq_answers = json.dumps({"1": "A JavaScript Library for building UIs", "2": "Facebook / Meta"})
sub_payload = {"task_id": task['id'], "code_submission": code, "mcq_answers": mcq_answers}
r = post('/submissions', data=sub_payload, headers=intern_headers)
print('Submission result', r.status_code, r.json())

# 5) Force progress to 100 via direct DB access (use local DB module)
print('Bumping intern progress to 100 to allow certificate generation')
from database import SessionLocal
import models

db = SessionLocal()
user = db.query(models.User).filter(models.User.email == 'intern@gmail.com').first()
if not user:
    print('Could not find intern in DB')
else:
    user.progress_pct = 100
    db.add(user)
    db.commit()
    print('Progress updated in DB')
    db.close()

# 6) Generate certificate
r = get('/certificate/generate', headers=intern_headers)
print('/certificate/generate', r.status_code)
if r.status_code == 200:
    cert = r.json()
    print('Certificate created:', cert.get('certificate_id'))
else:
    print('Generate certificate failed:', r.text)
    raise SystemExit(1)

# 7) Download PDF
r = get('/certificate/download', headers=intern_headers)
print('/certificate/download', r.status_code)
if r.status_code == 200:
    out_path = os.path.join(os.path.dirname(__file__), 'certificate_test.pdf')
    with open(out_path, 'wb') as f:
        f.write(r.content)
    print('Saved certificate to', out_path)
else:
    print('Download failed', r.text)

print('Integration test completed.')
