import re

filepath = "frontend/src/styles/Dashboard.css"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .main's overflow: hidden to overflow-y: auto
main_pattern = r'(\.main\s*\{[^}]*?)overflow:\s*hidden;'
content = re.sub(main_pattern, r'\1overflow-y: auto;', content)

# Replace .main-content-scroll's overflow: hidden to overflow-y: auto
main_scroll_pattern = r'(\.main-content-scroll\s*\{[^}]*?)overflow:\s*hidden;'
content = re.sub(main_scroll_pattern, r'\1overflow-y: auto;', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Dashboard.css to allow scrolling")
