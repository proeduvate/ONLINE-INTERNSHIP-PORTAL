from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE intern_fact_history ADD COLUMN IF NOT EXISTS fact_text TEXT'))
    conn.commit()
    print('Column added successfully!')
