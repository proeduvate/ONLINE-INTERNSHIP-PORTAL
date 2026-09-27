# ProEduvate Certificate Portal — Updated Full Stack

## Stack
- Frontend: React + Vite
- Backend: FastAPI
- Database: SQLite + SQLAlchemy
- PDF: ReportLab
- Certificate rendering: Pillow
- Authentication: JWT + bcrypt/Passlib

## Certificate rules
- 91–100: O
- 81–90: A+
- 71–80: A
- 61–70: B+
- 51–60: B
- 45–50: C
- Below 45: FAIL — certificate is not generated
- Admin approval is mandatory.
- CEO signature and official seal are added only when the admin approves/generates the certificate.
- The QR code is STATIC and is retained directly from `assets/master_template.png`. No QR generation is performed.
- The master template's visual layout is preserved; dynamic text is drawn only into the designated blank areas.
- Certificate ID is stored in the database/audit trail and PDF metadata so it does not alter the supplied visual format.

## Windows setup

### Backend
```cmd
cd certificate_portal\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (new terminal)
```cmd
cd certificate_portal\frontend
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## Demo accounts
Admin:
- username: `admin`
- password: `Admin@123`

Intern:
- username: `karan`
- password: `Karan@123`

## Test
1. Login as admin.
2. Select an intern and set a score.
3. Preview. The draft preview does **not** contain the CEO signature/seal.
4. Approve & Generate.
5. View/download the generated PDF. It contains the CEO signature and official seal.
6. Login as intern and download the approved certificate.
7. Try a score below 45; the system marks it FAIL and does not generate a certificate.

## Important
The generated SQLite database is created at `backend/certificate.db`. If you want a completely fresh demo database, stop the backend and delete that file before restarting.
