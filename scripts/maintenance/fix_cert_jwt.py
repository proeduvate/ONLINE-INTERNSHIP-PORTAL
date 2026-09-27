filepath = "backend/routers/certificates.py"
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("from jose import jwt", "")

with open(filepath, 'w') as f:
    f.write(content)
print("Removed jose jwt import")
