import re

filepath_mentor = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath_mentor, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the end of Overview
content = re.sub(r'(</>\s*\);\s*case "Cohort":)', r'  <AdminCertificateApprovals />\n            \1', content, flags=re.DOTALL)

with open(filepath_mentor, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MentorDashboard Overview")
