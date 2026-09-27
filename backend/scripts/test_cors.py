import requests

headers = {
    "Origin": "http://localhost:3000",
    "Access-Control-Request-Method": "GET"
}

# Preflight test
res = requests.options("http://127.0.0.1:8000/profile", headers=headers)
print("OPTIONS Status:", res.status_code)
print("OPTIONS Headers:", res.headers)

# Actual GET test
res = requests.get("http://127.0.0.1:8000/profile", headers={"Origin": "http://localhost:3000"})
print("GET Status:", res.status_code)
print("GET Headers:", res.headers)
print("GET Body:", res.text)
