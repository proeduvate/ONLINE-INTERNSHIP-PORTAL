import os
import re

filepath = "backend/main.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for new routers
imports_to_add = """from routers import auth, meetings, airdrops, onboarding, tasks, analytics, submissions, users
"""

# We can replace the existing router imports with the complete set
content = re.sub(r'from routers import .*', imports_to_add, content)

# Add app.include_router for each
routers_to_include = """
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(airdrops.router, prefix="/api/airdrops", tags=["Airdrops"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["Onboarding"])
# Meetings uses a custom prefix internally for WS, but we'll register the router
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
"""

# Replace all existing app.include_router block
content = re.sub(r'(app\.include_router.*?\n)+', routers_to_include, content)

# Check if routers were actually present, if not add them before the root endpoint
if "app.include_router(" not in content:
    content = content.replace("@app.get(\"/\")", routers_to_include + "\n@app.get(\"/\")")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated main.py with all routers")
