import os
import re

filepath = "frontend/src/pages/Dashboard/InternDashboard.jsx"
try:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will just replace the specific icon mappings that appear for InternDashboard
    content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Overview"', 'icon: "📊", label: "Overview"', content)
    # wait, the file has { id: "Overview", icon: "..." }, let's check exact format.
    # Ah, the format is `{ id: "Overview", icon: "..." }`
    
    content = re.sub(r'{\s*id:\s*"Overview",\s*icon:\s*"[^"]*"\s*}', '{ id: "Overview", icon: "📊" }', content)
    content = re.sub(r'{\s*id:\s*"Learning",\s*icon:\s*"[^"]*"\s*}', '{ id: "Learning", icon: "📚" }', content)
    content = re.sub(r'{\s*id:\s*"Daily Scenario",\s*icon:\s*"[^"]*"\s*}', '{ id: "Daily Scenario", icon: "🚀" }', content)
    content = re.sub(r'{\s*id:\s*"Tickets",\s*icon:\s*"[^"]*"\s*}', '{ id: "Tickets", icon: "🎫" }', content)
    content = re.sub(r'{\s*id:\s*"Chat with Mentor",\s*icon:\s*"[^"]*"\s*}', '{ id: "Chat with Mentor", icon: "💬" }', content)
    content = re.sub(r'{\s*id:\s*"Bonus Airdrops",\s*icon:\s*"[^"]*"\s*}', '{ id: "Bonus Airdrops", icon: "🎁" }', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed InternDashboard.jsx")
except Exception as e:
    print(e)
