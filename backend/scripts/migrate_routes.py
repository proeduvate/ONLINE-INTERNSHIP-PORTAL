with open('app/main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def extract_routes(start_marker, end_marker=None):
    start_idx = -1
    for i, line in enumerate(lines):
        if start_marker in line:
            start_idx = i
            break
    if start_idx == -1: return ''
    
    end_idx = len(lines)
    if end_marker:
        for i in range(start_idx+1, len(lines)):
            if end_marker in line:
                end_idx = i
                break
    else:
        # Stop at next # ====
        for i in range(start_idx+1, len(lines)):
            if line.startswith('# =========================================='):
                end_idx = i
                break
    
    return ''.join(lines[start_idx:end_idx]).replace('@app.', '@router.')

tasks_routes = extract_routes('@app.get("/tasks/intern")', '# ==========================================')
notifs_routes = extract_routes('@app.get("/notifications"', '# ==========================================')

tasks_code = f"""from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
import models
import schemas
from typing import List

router = APIRouter(prefix="", tags=["Tasks"])

{tasks_routes}
"""

notifs_code = f"""from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
import models
import schemas
from typing import List

router = APIRouter(prefix="", tags=["Notifications"])

{notifs_routes}
"""

with open('routers/tasks.py', 'w', encoding='utf-8') as f: f.write(tasks_code)
with open('routers/notifications.py', 'w', encoding='utf-8') as f: f.write(notifs_code)
print('Done copying routes')
