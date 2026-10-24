import requests

BASE = "http://127.0.0.1:8000"

def check(url, method='get', jsond=None, headers=None):
    try:
        func = getattr(requests, method)
        r = func(url, json=jsond, headers=headers, timeout=8)
        print(url, r.status_code)
        try:
            print(r.json())
        except Exception:
            print(r.text[:400])
        return r
    except Exception as e:
        print(url, "ERROR", e)
        return None

print('Starting smoke tests...')
check(BASE + "/")
check(BASE + "/certificate/verify/DOESNOTEXIST")

# Attempt code execution without auth (should be rejected)
payload = {"task_id": 1, "code_submission": "print('hello')"}
check(BASE + "/code/execute", method='post', jsond=payload)

print('Smoke tests completed.')
