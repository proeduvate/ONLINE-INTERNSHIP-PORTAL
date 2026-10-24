import re

# Fix InternDashboard.jsx
filepath_intern = "frontend/src/pages/Dashboard/InternDashboard.jsx"
with open(filepath_intern, 'r', encoding='utf-8') as f:
    content_intern = f.read()

lucide_pattern_intern = r'(import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\'];?)'
match_intern = re.search(lucide_pattern_intern, content_intern)
if match_intern:
    imports = [i.strip() for i in match_intern.group(2).split(',')]
    for icon in ['Award', 'Clock', 'Download']:
        if icon not in imports:
            imports.append(icon)
    new_import_str = f"import {{ {', '.join(imports)} }} from 'lucide-react';"
    content_intern = content_intern[:match_intern.start()] + new_import_str + content_intern[match_intern.end():]
    with open(filepath_intern, 'w', encoding='utf-8') as f:
        f.write(content_intern)
    print("Fixed InternDashboard imports")

# Fix MentorDashboard.jsx
filepath_mentor = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath_mentor, 'r', encoding='utf-8') as f:
    content_mentor = f.read()

lucide_pattern_mentor = r'(import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\'];?)'
match_mentor = re.search(lucide_pattern_mentor, content_mentor)
if match_mentor:
    imports = [i.strip() for i in match_mentor.group(2).split(',')]
    for icon in ['Check', 'X', 'Award']:
        if icon not in imports:
            imports.append(icon)
    new_import_str = f"import {{ {', '.join(imports)} }} from 'lucide-react';"
    content_mentor = content_mentor[:match_mentor.start()] + new_import_str + content_mentor[match_mentor.end():]
    with open(filepath_mentor, 'w', encoding='utf-8') as f:
        f.write(content_mentor)
    print("Fixed MentorDashboard imports")
