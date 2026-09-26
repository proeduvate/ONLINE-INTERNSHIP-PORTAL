import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
try:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the user avatar initialization
    content = content.replace(
        "{user ? user.charAt(0).toUpperCase() : 'M'}",
        "{(user?.name || user?.email || 'M').charAt(0).toUpperCase()}"
    )

    # Fix the user nametag
    content = content.replace(
        "<span style={{ fontWeight: 600 }}>{user || 'Me'}</span>",
        "<span style={{ fontWeight: 600 }}>{user?.name || user?.email || 'Me'}</span>"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed user.charAt error in MeetingArea.jsx")
except Exception as e:
    print(f"Error: {e}")
