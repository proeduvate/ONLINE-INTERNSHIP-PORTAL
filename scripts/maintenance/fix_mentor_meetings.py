import os
import re

filepath = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for api
if 'import api from "../../api/axios";' not in content:
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport api from "../../api/axios";')

# Define new handleCreateMeeting function
new_func = """
  const handleCreateMeeting = async (title, time) => {
    if (!title || !time) return alert("Fill in title & time!");
    try {
      const response = await api.post('/api/meetings', {
        title: title,
        room_code: "meeting-" + Date.now(), // Generate a unique room code
        status: "scheduled",
        scheduled_time: new Date(time).toISOString()
      });
      // Optionally refresh mentor's local meetings array
      setMeetings([...meetings, { id: response.data.id || meetings.length + 1, title, time, status: "Scheduled", room_code: response.data.room_code }]);
      alert("Meeting created and saved to database!");
    } catch (err) {
      console.error("Failed to create meeting:", err);
      alert("Error saving meeting to database.");
    }
  };
"""

# Replace existing handleCreateMeeting
content = re.sub(
    r'const handleCreateMeeting = \(title, time\) => \{.*?\};',
    new_func.strip(),
    content,
    flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated handleCreateMeeting in MentorDashboard.jsx")
