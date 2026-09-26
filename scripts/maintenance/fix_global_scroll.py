import re

filepath = "frontend/src/styles/Dashboard.css"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. .container - remove height: 100vh and overflow: hidden
content = re.sub(r'(\.container\s*\{[^}]*?)height:\s*100vh;', r'\1min-height: 100vh;', content)
content = re.sub(r'(\.container\s*\{[^}]*?)overflow:\s*hidden;', r'\1', content)

# 2. .sidebar - make it sticky
sidebar_pattern = r'(\.sidebar\s*\{[^}]*?)position:\s*relative;'
content = re.sub(sidebar_pattern, r'\1position: sticky;\n  top: 0;\n  overflow-y: auto;', content)

# 3. .main - change height: 100vh to min-height: 100vh, remove overflow-y
content = re.sub(r'(\.main\s*\{[^}]*?)height:\s*100vh;', r'\1min-height: 100vh;', content)
content = re.sub(r'(\.main\s*\{[^}]*?)overflow-y:\s*auto;', r'\1', content)

# 4. .main-content-scroll - remove overflow completely or set to visible
content = re.sub(r'(\.main-content-scroll\s*\{[^}]*?)overflow-y:\s*auto;', r'\1overflow: visible;', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Dashboard.css for natural window scrolling with sticky sidebar.")
