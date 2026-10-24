import os
from sqlalchemy import create_engine, text

engine = create_engine('postgresql+psycopg2://postgres:Proeduvate%401@db.vilcgxfidyjunirdkxxu.supabase.co:5432/postgres')
with engine.connect() as conn:
    res = conn.execute(text("SELECT * FROM users WHERE email='kaul190905@gmail.com'")).fetchall()
    print("USER FOUND:" if res else "NO USER FOUND")
    for r in res:
        print(r)
