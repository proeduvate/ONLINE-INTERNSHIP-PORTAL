import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "..", "internship_portal.db")

def migrate():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Checking if batch_id exists in users...")
        # Try to select batch_id, if it fails, add it
        try:
            cursor.execute("SELECT batch_id FROM users LIMIT 1")
            print("batch_id already exists.")
        except sqlite3.OperationalError:
            print("batch_id missing. Adding it...")
            cursor.execute("ALTER TABLE users ADD COLUMN batch_id INTEGER REFERENCES batches(id);")
            conn.commit()
            print("batch_id added successfully.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
