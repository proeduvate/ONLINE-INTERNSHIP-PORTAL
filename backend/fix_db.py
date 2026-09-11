from database import engine
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN offer_letter_url VARCHAR(255)'))
    except Exception as e: print(e)
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN tc_url VARCHAR(255)'))
    except Exception as e: print(e)
    conn.commit()
print('Done')
