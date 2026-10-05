import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv('.env', override=True)
url = os.getenv('DATABASE_URL')
print('URL', url)
engine = create_engine(url)
conn = engine.connect()
print('users schema:')
print(conn.execute(text("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position")).fetchall())
print('enum values query:')
try:
    rows = conn.execute(text("SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'userrole' ORDER BY e.enumsortorder")).fetchall()
    print(rows)
except Exception as e:
    print('enum query failed', e)
print('current roles:')
print(conn.execute(text("SELECT id, full_name, email, role, hashed_password FROM users ORDER BY id")).fetchall())
