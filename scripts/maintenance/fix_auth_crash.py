import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const { user } = useAuth();",
    "const { user } = useAuth() || {};"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed AuthContext destructuring crash in MeetingArea.jsx")
