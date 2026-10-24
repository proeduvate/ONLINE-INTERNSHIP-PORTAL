import re

filepath = "backend/main.py"
with open(filepath, 'r') as f:
    content = f.read()

# Add StaticFiles import if not exists
if "StaticFiles" not in content:
    content = content.replace("from fastapi.middleware.cors import CORSMiddleware", "from fastapi.middleware.cors import CORSMiddleware\nfrom fastapi.staticfiles import StaticFiles")

# Mount static files
mount_str = "app.mount('/static', StaticFiles(directory='static'), name='static')"
if mount_str not in content:
    content = content.replace("app = FastAPI(title=\"OIP API\")", "app = FastAPI(title=\"OIP API\")\n" + mount_str)

# Include the new router
if "certificates.router" not in content:
    # Let's find the routers import
    if "from routers import" in content:
        content = re.sub(r'from routers import (.*?)\n', r'from routers import \1, certificates\n', content)
    else:
        # Just manually insert it
        pass

    # Insert include_router
    include_str = 'app.include_router(certificates.router)'
    content = content.replace("app.include_router(meetings.router, prefix=\"/api/meetings\", tags=[\"Meetings\"])", "app.include_router(meetings.router, prefix=\"/api/meetings\", tags=[\"Meetings\"])\napp.include_router(certificates.router)")

with open(filepath, 'w') as f:
    f.write(content)
print("Updated main.py")
