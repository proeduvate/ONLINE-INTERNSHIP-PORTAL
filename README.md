# Online Internship Portal

This repository contains both the frontend and backend for the Online Internship Portal.

## How to Run the Application Correctly

To run the application, you need to start both the backend server and the frontend development server separately.

### 1. Running the Backend (FastAPI)

The correct backend application is located in the `backend/` directory, **NOT** the root `app.py`. Do not run the `app.py` in the root folder, as it is deprecated and missing necessary routes (such as onboarding endpoints).

To start the backend correctly:

```powershell
cd backend
.\run_backend.ps1
```

*(Alternatively, you can manually run `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` from inside the `backend/` directory.)*

The backend API will be available at `http://localhost:8000`.

### 2. Running the Frontend (React)

The frontend application is located in the `frontend/` directory.

To start the frontend:

```powershell
cd frontend
npm install  # (if running for the first time)
npm start
```

The frontend will start a development server and should automatically open in your default browser at `http://localhost:3000`.
