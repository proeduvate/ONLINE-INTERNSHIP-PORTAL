import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { API_BASE } from '../../api/axios';",
    "import { API_BASE } from '../../api';"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MeetingArea.jsx API_BASE import path")
