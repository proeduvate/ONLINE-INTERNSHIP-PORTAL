import re

filepath = "backend/routers/meetings.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('router = APIRouter(prefix="/meetings", tags=["meetings"])', 'router = APIRouter(tags=["meetings"])')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed duplicate prefix from meetings.py")
