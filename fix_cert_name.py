filepath = "backend/routers/certificates.py"
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("current_user.full_name", "current_user.name")
content = content.replace('full_name="Guest Intern"', 'name="Guest Intern"')

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed User attribute name to full_name")
