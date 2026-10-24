import os

filepath = "frontend/src/pages/breakout-rooms/BreakoutRooms.css"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if '.br-controls-bar {' not in content:
    content += "\n.br-controls-bar {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n"
else:
    # Just in case they want it on br-meeting-controls
    pass

if '.br-meeting-controls {' in content:
    content = content.replace(
        '.br-meeting-controls {',
        '.br-meeting-controls {\n  display: flex;\n  justify-content: center;\n  align-items: center;'
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BreakoutRooms.css with flex properties")
