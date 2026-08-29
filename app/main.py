# main.py

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# Import routers
from app.routers import meetings  # Import the meetings router

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # Assuming frontend runs on port 3000
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix="/api/meetings") # Register the meetings router

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Add other routers here as your application grows
# from app.routers import users
# app.include_router(users.router, prefix="/api/users")

# You can add other configurations like database connections here

if __name__ == "__main__":
    import uvicorn
    # Note: In production, use a proper ASGI server like uvicorn with Gunicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
