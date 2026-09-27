filepath = "frontend/src/pages/Dashboard/AdminDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix React.useState / React.useEffect
content = content.replace("React.useState", "useState")
content = content.replace("React.useEffect", "useEffect")

# Fix api import
if "import api from" not in content:
    content = content.replace('import "../../styles/Dashboard.css";', 'import "../../styles/Dashboard.css";\nimport api from "../../api/axios";')

# Fix lucide-react imports
import re
lucide_pattern = r'(import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\'];?)'
match = re.search(lucide_pattern, content)
if match:
    imports = [i.strip() for i in match.group(2).split(',')]
    for icon in ['Check', 'X']:
        if icon not in imports:
            imports.append(icon)
    new_import_str = f"import {{ {', '.join(imports)} }} from 'lucide-react';"
    content = content[:match.start()] + new_import_str + content[match.end():]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed AdminDashboard imports")
