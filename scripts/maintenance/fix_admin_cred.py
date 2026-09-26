import re

filepath_admin = "frontend/src/pages/Dashboard/AdminDashboard.jsx"
with open(filepath_admin, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'case "Credentials":.*?case "Tickets":', 'case "Credentials":\n        return (\n          <AdminCertificateApprovals />\n        );\n\n      case "Tickets":', content, flags=re.DOTALL)

with open(filepath_admin, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminDashboard Credentials tab")
