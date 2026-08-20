import sys
import os
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import engine

def main():
    with engine.connect() as conn:
        conn.execute(text("UPDATE domains SET name = 'Frontend' WHERE name = 'React Frontend Development';"))
        conn.execute(text("UPDATE domains SET name = 'Backend' WHERE name = 'FastAPI Backend Development';"))
        conn.commit()
    print("Updated domain names in the database.")

if __name__ == "__main__":
    main()
