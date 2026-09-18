import psycopg2
conn = psycopg2.connect('postgresql://postgres:Proeduvate%401@db.vilcgxfidyjunirdkxxu.supabase.co:5432/postgres')
conn.autocommit = True
cur = conn.cursor()
try:
    cur.execute("ALTER TABLE tasks ADD COLUMN interactive_json TEXT;")
    print("Added interactive_json column to tasks table.")
except Exception as e:
    print(f"Error adding column: {e}")
