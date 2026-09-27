import re

with open('backend/services/document_service.py', 'r') as f:
    content = f.read()

# Replace broken newlines that were literalized incorrectly
# We look for: f"...",\n\n"
content = re.sub(r'f"(.*?),\n\n"', r'f"\1,\\n\\n"', content)
content = re.sub(r'f"(.*?)\.\n\n"', r'f"\1.\\n\\n"', content)
content = re.sub(r'f"(.*?)!\n\n"', r'f"\1!\\n\\n"', content)

with open('backend/services/document_service.py', 'w') as f:
    f.write(content)
