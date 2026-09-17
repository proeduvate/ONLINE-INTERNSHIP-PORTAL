import os
import sys
from pathlib import Path

# Add backend directory to sys.path so 'app' package resolves cleanly to backend/app
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the centralized FastAPI application instance from server.py
from server import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
