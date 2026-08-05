import sqlite3
import os

# Path: script is in backend/scripts/, DB is at backend/internship_portal.db
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'internship_portal.db'))

print('Using DB path:', db_path)
if not os.path.exists(db_path):
    print('Database file not found; nothing to fix.')
    exit(0)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Helper to check for column existence
def has_column(table, column):
    cur.execute("PRAGMA table_info(%s)" % table)
    cols = [r[1] for r in cur.fetchall()]
    return column in cols

# Add missing columns expected by models
columns_to_add = [
    ("users", "learning_streak", "INTEGER", "0"),
    ("users", "attendance_pct", "INTEGER", "0"),
    ("users", "progress_pct", "INTEGER", "0"),
    ("users", "last_task_completion_date", "TEXT", "NULL")
]

for table, col, coltype, default in columns_to_add:
    if not has_column(table, col):
        try:
            sql = f"ALTER TABLE {table} ADD COLUMN {col} {coltype}"
            if default != "NULL":
                sql += f" DEFAULT {default}"
            cur.execute(sql)
            print(f"Added column {col} to {table}")
        except Exception as e:
            print(f"Failed to add column {col} to {table}: {e}")
    else:
        print(f"Column {col} already exists in {table}")

conn.commit()
conn.close()
print('Schema fix complete.')
