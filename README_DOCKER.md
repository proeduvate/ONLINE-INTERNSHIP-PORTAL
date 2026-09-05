Backend Docker instructions:

Build image (from repo root):

```bash
cd backend
docker build -t internship-portal-backend .
```

Run container (publish port 8000):

```bash
docker run -p 8000:8000 --name internship-backend -e DATABASE_URL="postgresql+psycopg2://postgres:postgres@host.docker.internal:5432/internship_portal" internship-portal-backend
```

Or use Docker Compose to run PostgreSQL together with the backend:

```bash
docker compose up --build
```

Notes:
- The `docker-compose.yml` file starts a PostgreSQL service named `db` and points the backend at it.
- If you use Compose, the backend is configured with `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST=db`, `POSTGRES_PORT=5432`, and `POSTGRES_DB=internship_portal`.
- To seed the database inside the container, run `docker compose exec backend python seed.py`.
