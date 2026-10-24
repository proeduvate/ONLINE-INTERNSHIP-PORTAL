import os
import re

filepath = "frontend/src/pages/breakout-rooms/WorkspaceSidebar.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove isIntern restriction from handleRoomClick
content = re.sub(
    r'const handleRoomClick = \(roomId\) => \{\s*//.*?\s*if \(isIntern\) return;\s*setActiveRoom\(roomId\);\s*\};',
    '''const handleRoomClick = (roomId) => {
    setActiveRoom(roomId);
  };''',
    content,
    flags=re.DOTALL
)

# 2. Make cursor pointer for everyone
content = content.replace("cursor: isIntern ? 'default' : 'pointer'", "cursor: 'pointer'")

# 3. Ensure opacity isn't dimmed for interns not in the active room
content = content.replace("opacity: isIntern && activeRoom !== room.id ? 0.6 : 1", "opacity: 1")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated WorkspaceSidebar.jsx for Discord-like free switching")
