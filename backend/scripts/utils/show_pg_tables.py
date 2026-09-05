import sys
import os
sys.path.append(os.path.dirname(__file__))
from app.db.session import engine
from sqlalchemy import inspect

def show_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables in PostgreSQL DB:")
    for t in sorted(tables):
        print(" -", t)
        
if __name__ == "__main__":
    show_tables()
