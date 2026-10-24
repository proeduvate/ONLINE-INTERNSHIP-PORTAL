import os

filepath = "backend/routers/meetings.py"
try:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The current websocket_endpoint simply relays data:
    # data = await websocket.receive_json()
    # await manager.broadcast_to_room(room_id, {"sender": client_id, "payload": data})

    # Let's replace the websocket_endpoint completely
    ws_new = """@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(room_id, websocket)
    # Notify room that user joined
    await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-join", "payload": {}})
    try:
        while True:
            data = await websocket.receive_json()
            # If it's a state-update or reaction, broadcast it
            msg_type = data.get("type")
            
            if msg_type in ["state-update", "reaction"]:
                await manager.broadcast_to_room(room_id, {"sender": client_id, "type": msg_type, "payload": data})
            else:
                # Relay standard WebRTC signals (offer, answer, ICE)
                await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "webrtc", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"sender": client_id, "type": "user-leave", "payload": {}})"""

    content = content.replace(
"""@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Relay WebRTC signals (offer, answer, ICE candidates) to other room participants
            await manager.broadcast_to_room(room_id, {"sender": client_id, "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast_to_room(room_id, {"type": "USER_DISCONNECTED", "client_id": client_id})""", ws_new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Backend websocket updated")
except Exception as e:
    print(e)
