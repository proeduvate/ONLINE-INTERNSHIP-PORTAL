import requests
for url in ['http://127.0.0.1:8000/', 'http://127.0.0.1:3000/']:
    try:
        r = requests.get(url, timeout=5)
        print(url, r.status_code, r.text[:120])
    except Exception as e:
        print(url, 'ERROR', e)
