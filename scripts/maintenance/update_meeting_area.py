import re

with open("frontend/src/pages/breakout-rooms/MeetingArea.jsx", "r", encoding="utf-8") as f:
    text = f.read()

replacement = """
      } else if (type === 'chat') {
        setChatMessages(prev => [...prev, { sender: `User ${peerId}`, text: data.text }]);
      } else if (type === 'force-switch' && data.target_user_id == clientId) {
        alert(`You have been moved to room: ${data.target_room_id}`);
        // Typically we would update the parent state or navigate, but since this component 
        // handles its own WebSocket connection, we could just reload or call a callback.
        // Let's reload to the new room, or you can pass a callback from BreakoutRoomsApp.
        window.location.reload(); 
      }
"""

text = text.replace("""      } else if (type === 'chat') {
        setChatMessages(prev => [...prev, { sender: `User ${peerId}`, text: data.text }]);
      }""", replacement.strip())

with open("frontend/src/pages/breakout-rooms/MeetingArea.jsx", "w", encoding="utf-8") as f:
    f.write(text)
