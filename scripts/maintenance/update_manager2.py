import re

with open("frontend/src/pages/breakout-rooms/BreakoutManagerModal.jsx", "r", encoding="utf-8") as f:
    text = f.read()

replacement = """
  const handleAssignSelected = async (roomName) => {
    setInterns(interns.map(i => selectedInterns.includes(i.id) ? { ...i, room: roomName } : i));
    
    try {
        const { default: api } = await import('../../api/axios');
        for (const internId of selectedInterns) {
            const currentRoom = interns.find(i => i.id === internId)?.room || 'Main Meeting';
            await api.post('/api/meetings/switch-room', {
                intern_id: internId.toString(),
                current_room_id: currentRoom === 'Main Meeting' ? 'main-room' : currentRoom,
                target_room_id: roomName === 'Main Meeting' ? 'main-room' : roomName
            });
        }
    } catch(err) {}

    setAssigningToRoom(null);
    setSelectedInterns([]);
  };
"""

text = re.sub(r'  const handleAssignSelected = \(roomName\) => \{\n    setInterns\(interns\.map\(i => selectedInterns\.includes\(i\.id\) \? \{ \.\.\.i, room: roomName \} : i\)\);\n    setAssigningToRoom\(null\);\n    setSelectedInterns\(\[\]\);\n  \};', replacement.strip(), text, flags=re.DOTALL)

with open("frontend/src/pages/breakout-rooms/BreakoutManagerModal.jsx", "w", encoding="utf-8") as f:
    f.write(text)
