import database, sqlalchemy

with database.engine.connect() as conn:
    try:
        conn.execute(sqlalchemy.text("ALTER TABLE bonus_airdrops RENAME COLUMN winner_percentage TO winner_count;"))
        conn.commit()
        print("Successfully renamed column winner_percentage to winner_count")
    except Exception as e:
        print(f"Failed: {e}")
