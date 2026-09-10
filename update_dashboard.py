import sys

with open('frontend/src/pages/Dashboard/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = 'import AdminOnboardingList from "../admin/onboarding/AdminOnboardingList";\n'
content = content.replace('import "../../styles/Dashboard.css";', 'import "../../styles/Dashboard.css";\n' + import_statement)

# find case "Onboarding": and replace the whole block until case "Tickets": or end of switch
start_idx = content.find('      case "Onboarding":')
if start_idx != -1:
    end_idx = content.find('      case "Tickets":', start_idx)
    if end_idx == -1:
        end_idx = content.find('      default:', start_idx)

    if end_idx != -1:
        new_block = '      case "Onboarding":\n        return <AdminOnboardingList />;\n\n'
        content = content[:start_idx] + new_block + content[end_idx:]
    else:
        print("Could not find end of Onboarding case block")

with open('frontend/src/pages/Dashboard/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
