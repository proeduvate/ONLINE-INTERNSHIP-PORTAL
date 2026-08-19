import database, models

with database.SessionLocal() as db:
    batches = db.query(models.Batch).all()
    print("Batches:")
    for b in batches:
        print(f"ID: {b.id}, Name: {b.name}")
