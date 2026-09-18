import psycopg2
conn = psycopg2.connect('postgresql://postgres:Proeduvate%401@db.vilcgxfidyjunirdkxxu.supabase.co:5432/postgres')
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks'")
cols = [row[0] for row in cur.fetchall()]
print(cols)
