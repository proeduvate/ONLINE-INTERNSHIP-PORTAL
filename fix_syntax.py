import re

files = [
    'frontend/src/pages/Dashboard/AdminDashboard.jsx',
    'frontend/src/pages/Dashboard/MentorDashboard.jsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix api.post
    content = content.replace('await api.post(/api/certificates//);', 'await api.post(/api/certificates//);')
    # Fix alert
    content = content.replace('alert(Certificate d successfully!);', 'alert(Certificate d successfully!);')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

with open('frontend/src/pages/Dashboard/InternDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix api.get
content = content.replace('const response = await api.get(/api/certificates//download, {', 'const response = await api.get(/api/certificates//download, {')
# Fix download string
content = content.replace('link.setAttribute(\'download\', .pdf);', 'link.setAttribute(\'download\', ${cert.certificate_id}.pdf);')

with open('frontend/src/pages/Dashboard/InternDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax errors!")
