import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            res = conn.execute(text('UPDATE users SET batch_id = 1'))
            conn.commit()
            print(f'Updated {res.rowcount} users in DB to batch_id 1')
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
