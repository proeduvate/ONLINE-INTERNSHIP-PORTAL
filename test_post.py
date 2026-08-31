import requests

res = requests.post("http://127.0.0.1:8000/api/meetings", json={
    "title": "Test Title",
    "room_code": "meeting-12345",
    "status": "scheduled",
    "scheduled_time": "Fri, Aug 31, 2:00 PM"
})
print(f"Status: {res.status_code}")
print(f"Response: {res.text}")
