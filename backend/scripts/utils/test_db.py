from sqlalchemy import text
from app.db.session import engine

with engine.connect() as conn:
    conn.execute(text("COMMIT"))
    try:
        conn.execute(text("ALTER TABLE bonus_airdrops ADD COLUMN points_distribution VARCHAR(255) DEFAULT ''"))
        print('Added points_distribution')
    except Exception as e:
        print('points_distribution likely exists:', e)
        conn.execute(text("ROLLBACK"))
    
    try:
        conn.execute(text("ALTER TABLE bonus_airdrops ALTER COLUMN domain DROP NOT NULL"))
        print('Made domain optional')
    except Exception as e:
        print('Failed to make domain optional:', e)
        conn.execute(text("ROLLBACK"))

    try:
        conn.execute(text("ALTER TABLE bonus_airdrops ALTER COLUMN batch_id DROP NOT NULL"))
        print('Made batch_id optional')
    except Exception as e:
        print('Failed to make batch_id optional:', e)
        conn.execute(text("ROLLBACK"))
