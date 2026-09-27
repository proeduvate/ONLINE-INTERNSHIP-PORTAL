import sys

filepath = "backend/routers/certificates.py"
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("user.full_name", "user.name")

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed user.full_name bug in approve_certificate")
