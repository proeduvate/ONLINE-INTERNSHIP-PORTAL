filepath = "backend/routers/certificates.py"
with open(filepath, 'r') as f:
    content = f.read()

# Fix domain assignment
old_domain_line = 'domain = current_user.domain if hasattr(current_user, \'domain\') and current_user.domain else "Software Engineering"'
new_domain_line = '''
    if hasattr(current_user, 'domain') and current_user.domain:
        domain = current_user.domain.name if hasattr(current_user.domain, 'name') else str(current_user.domain)
    else:
        domain = "Software Engineering"
'''
content = content.replace(old_domain_line, new_domain_line)

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed domain attribute access")
