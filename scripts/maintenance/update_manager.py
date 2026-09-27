import re

with open("frontend/src/pages/breakout-rooms/BreakoutManagerModal.jsx", "r", encoding="utf-8") as f:
    text = f.read()

replacement = """
  const moveIntern = async (internId, targetRoomName) => {
    // Optimistic UI update
    setInterns(interns.map(i => i.id === internId ? { ...i, room: targetRoomName } : i));
    
    // API call to broadcast the switch
    try {
        const { default: api } = await import('../../api/axios');
        const currentRoom = interns.find(i => i.id === internId)?.room || 'Main Meeting';
        await api.post('/api/meetings/switch-room', {
            intern_id: internId.toString(),
            current_room_id: currentRoom === 'Main Meeting' ? 'main-room' : currentRoom,
            target_room_id: targetRoomName === 'Main Meeting' ? 'main-room' : targetRoomName
        });
    } catch(err) {
        console.error("Failed to move intern", err);
    }
  };
"""

text = re.sub(r'  const moveIntern = \(internId, targetRoomName\) => \{\n    setInterns\(interns\.map\(i => i\.id === internId \? \{ \.\.\.i, room: targetRoomName \} : i\)\);\n  \};', replacement.strip(), text, flags=re.DOTALL)

with open("frontend/src/pages/breakout-rooms/BreakoutManagerModal.jsx", "w", encoding="utf-8") as f:
    f.write(text)
