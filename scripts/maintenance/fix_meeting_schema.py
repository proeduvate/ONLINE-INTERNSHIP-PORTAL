import os
import re

filepath = "backend/routers/meetings.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Change datetime to str for scheduled_time to prevent validation errors with 422
content = content.replace("scheduled_time: Optional[datetime] = None", "scheduled_time: Optional[str] = None")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MeetingCreate schema to accept scheduled_time as string")
