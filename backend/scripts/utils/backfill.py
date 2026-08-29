from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('UPDATE intern_fact_history SET fact_text = domain_facts.fact FROM domain_facts WHERE intern_fact_history.fact_id = domain_facts.id AND intern_fact_history.fact_text IS NULL'))
    conn.commit()
    print('Backfilled old records!')
