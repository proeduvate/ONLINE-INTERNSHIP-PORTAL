import requests
base='http://127.0.0.1:8002'
pairs=[('admin@gmail.com','admin123'),('mentor@gmail.com','mentor123'),('intern@gmail.com','intern123')]
for email, password in pairs:
    r = requests.post(base + '/login', json={'email': email, 'password': password})
    print(email, r.status_code, r.json().get('role'))
