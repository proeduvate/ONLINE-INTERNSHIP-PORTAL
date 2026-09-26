with open('backend/services/document_service.py', 'r') as f:
    content = f.read()

content = content.replace('f"Sincerely,\n"', 'f"Sincerely,\\n"')

with open('backend/services/document_service.py', 'w') as f:
    f.write(content)
