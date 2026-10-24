import os
import re

filepath = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the datetime serialization in handleCreateMeeting
content = content.replace("scheduled_time: new Date(time).toISOString()", "scheduled_time: time")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed scheduled_time serialization in MentorDashboard")
