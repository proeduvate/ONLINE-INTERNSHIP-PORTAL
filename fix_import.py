import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
try:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace duplicate Hand
    content = content.replace(", Smile, ThumbsUp, Hand }", ", Smile, ThumbsUp }")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed duplicate import in MeetingArea.jsx")
except Exception as e:
    print(f"Error: {e}")
