from app.db import session as database, models

with database.SessionLocal() as db:
    users = db.query(models.User).all()
    print("Users:")
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
