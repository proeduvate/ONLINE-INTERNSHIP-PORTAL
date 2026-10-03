import os
import sys
from pathlib import Path

# Add backend directory to sys.path so modules resolve correctly
backend_dir = Path(__file__).resolve().parent / 'backend'
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Ensure required directories exist before startup
os.makedirs("uploads", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Import and expose the complete FastAPI app from backend/main.py
from main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
