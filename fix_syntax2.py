import re

files = [
    'frontend/src/pages/Dashboard/AdminDashboard.jsx',
    'frontend/src/pages/Dashboard/MentorDashboard.jsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix failed to alert
    content = content.replace('alert(Failed to  certificate.);', 'alert(Failed to  certificate.);')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed syntax errors 2!")
