import re

with open("backend/routers/meetings.py", "r", encoding="utf-8") as f:
    text = f.read()

replacement = """
from pydantic import BaseModel

class SwitchRoomRequest(BaseModel):
    intern_id: str
    current_room_id: str
    target_room_id: str

@router.post("/switch-room")
async def switch_room(payload: SwitchRoomRequest, db: Session = Depends(get_db)):
    # Broadcast a forced switch command to the current room
    await manager.broadcast_to_room(
        payload.current_room_id, 
        {"type": "force-switch", "target_user_id": payload.intern_id, "target_room_id": payload.target_room_id}
    )
    return {"status": "success", "target_room_id": payload.target_room_id}
"""

text = re.sub(r'@router\.post\("/switch-room"\)\ndef switch_room.*?pass', replacement.strip(), text, flags=re.DOTALL)

with open("backend/routers/meetings.py", "w", encoding="utf-8") as f:
    f.write(text)
