import sqlite3
import json
import os

db_path = "database.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN interactive_json TEXT")
        print("Successfully added interactive_json column to tasks table.")
    except sqlite3.OperationalError as e:
        print(f"Error (maybe column exists): {e}")

    # Now let's try to migrate day-01 data if we can
    try:
        with open("../frontend/src/features/learning/interactive/data/day-01.json", "r") as f:
            day_01_data = f.read()
            
        cursor.execute("UPDATE tasks SET interactive_json = ? WHERE day_number = 1", (day_01_data,))
        print(f"Migrated day 1 JSON to {cursor.rowcount} tasks.")
    except Exception as e:
        print(f"Error migrating day-01 data: {e}")

    # Read curriculum.js to extract day-02 to day-30?
    # This is slightly complex since it's a JS file. But for now, we just migrate what we can.
    # We can inject mock JSON for other days if needed.

    conn.commit()
    conn.close()
