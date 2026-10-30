# AGENTS.md - Canonical AI Pair Programming Instructions

This repository is the **Online Internship Portal (OIP)**, a full-stack platform comprising a FastAPI backend and a React (SPA) frontend. This document is the single source of truth for AI agents operating within this workspace.

---

## 1. Project Map

- `backend/routers/`: HTTP route handlers and request/response coordination only. **Business logic and raw direct SQL are forbidden here**; delegate to services/models.
- `backend/services/`: Core business logic, background tasks, email dispatch, and third-party API integrations (Supabase, Google, etc.).
- `backend/models.py`: SQLAlchemy ORM database models and table schema definitions.
- `backend/schemas.py`: Pydantic request/response validation models and serialization schemas.
- `backend/core/`: Application settings, security utilities (password hashing, JWT token handling), and configuration.
- `backend/alembic/`: Database migrations. Managed via Alembic; do not alter manually without explicit instructions.
- `frontend/src/pages/`: Page-level route views. Coordinates UI layout and delegates domain workflows.
- `frontend/src/components/`: Reusable UI components. **Direct raw `fetch` calls are forbidden here**; all network requests must use `apiClient` or service hooks.
- `frontend/src/services/` & `frontend/src/api/`: Centralized API client (`axios`), authentication contexts, and API helper functions.
- `frontend/src/utils/`: Pure client-side helper functions, formatters, and non-stateful utilities.

---

## 2. Exact Commands

Always run commands using PowerShell syntax from the repository root unless explicitly directed.

### Backend Commands
- **Install Dependencies:** `pip install -r backend/requirements.txt`
- **Dev Server:** `cd backend; .\run_backend.ps1` *(or: `.\backend\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`)*
- **Lint Check:** `flake8 .` *(uses root `.flake8`)*
- **Format Check:** `black --check .` *(uses root `pyproject.toml`)*
- **Format Code:** `black .`
- **Run Tests:** `.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_integration.py`

### Frontend Commands
- **Install Dependencies:** `npm --prefix frontend install`
- **Dev Server:** `npm --prefix frontend start` *(serves at `http://localhost:3000`)*
- **Build (Production):** `npm --prefix frontend run build`
- **Run Tests:** `npm --prefix frontend test -- --watchAll=false`
- **Run Lint:** `npm --prefix frontend test -- --watchAll=false`

---

## 3. Conventions

### Naming Conventions
- **Python / Backend:**
  - Files & Modules: `snake_case.py` (e.g., `batch_analytics.py`)
  - Classes & Models: `PascalCase` (e.g., `User`, `PointTransaction`)
  - Functions & Variables: `snake_case` (e.g., `get_current_user`, `domain_id`)
  - Endpoints: Kebab-case or lowercase RESTful paths (`/api/auth/login`, `/api/users/profile`)
- **JavaScript / Frontend:**
  - React Components & Files: `PascalCase.jsx` (e.g., `InternDashboard.jsx`)
  - Utilities & Services: `camelCase.js` (e.g., `apiClient.js`, `authContext.js`)
  - CSS / Style Files: `PascalCase.css` or `kebab-case.css` matching component names.

### Error Handling & Response Patterns
- **Backend:** Raise standard FastAPI `HTTPException(status_code=..., detail=...)` with clear message payloads. Avoid returning raw stack traces or silent 500 errors.
- **Frontend:** Wrap async calls in `try/catch`, display user-friendly toast or banner notifications, and handle unauthorized (401/403) responses gracefully via auth interceptors.

### Import Styles
- **Backend:** Absolute imports relative to backend root (e.g., `from database import get_db`, `from models import User`, `from core.security import verify_password`).
- **Frontend:** Standard ES module imports (`import React, { useState } from 'react'`). Use relative imports or configured paths consistently.

### Placement of New Files
- New backend endpoints -> `backend/routers/<domain>.py` (and register router in `backend/main.py`).
- New business workflows -> `backend/services/<service_name>.py`.
- New database tables -> `backend/models.py`.
- New request/response DTOs -> `backend/schemas.py`.
- New React pages -> `frontend/src/pages/<Feature>/<PageName>.jsx`.
- New React components -> `frontend/src/components/<ComponentName>.jsx`.

---

## 4. Forbidden Zones

Never touch, modify, or commit files within the following paths unless explicitly authorized:
- `backend/venv/` & `.venv/` (virtual environments)
- `frontend/node_modules/` (dependency directories)
- `backend/alembic/versions/` (existing migration files; only generate new migrations via Alembic)
- `sql_app.db` (local SQLite development database binary)
- `backend/sql_app.db` (backend local SQLite database binary)
- `backend/uploads/` & `uploads/` (runtime user uploaded files, resumes, certificates)
- `backend/submissions/` (runtime submitted code/assignments)
- `.env` / `backend/.env` / `frontend/.env` (contains sensitive secrets, credentials, and Supabase keys; never overwrite or commit)

---

## 5. Definition of Done

Any task or change is considered complete ONLY when:
1. **Tests pass:** Existing tests run without unexpected regressions.
2. **Lint is clean:** Python files conform to `flake8` and `black`, and JavaScript files compile with zero syntax or build errors.
3. **No new dependencies without asking:** Do not add entries to `backend/requirements.txt` or `frontend/package.json` without explicit user permission.
4. **No secrets exposed:** No hardcoded tokens, database URLs, or API keys are written into source files.
