import re

filepath = "frontend/src/pages/breakout-rooms/BreakoutRooms.css"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'(\.br-app-container\s*\{[^}]*?)height:\s*100vh;', r'\1height: 100%;', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Changed height of .br-app-container from 100vh to 100%.")
