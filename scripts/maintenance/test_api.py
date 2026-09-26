import requests

# We'll try to hit the endpoint directly
try:
    res = requests.post("http://127.0.0.1:8000/api/meetings/", json={
        "title": "Test",
        "room_code": "test-123",
        "status": "scheduled",
        "scheduled_time": "Today"
    })
    print(res.status_code)
    print(res.text)
except Exception as e:
    print(e)
