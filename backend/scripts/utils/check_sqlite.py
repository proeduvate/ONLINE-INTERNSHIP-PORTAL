import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "internship_portal.db")

def check():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    print("Tables:", [t[0] for t in tables])
    
    if "tasks" in [t[0] for t in tables]:
        count = cursor.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
        print("Tasks count:", count)
        
    if "submissions" in [t[0] for t in tables]:
        count = cursor.execute("SELECT COUNT(*) FROM submissions").fetchone()[0]
        print("Submissions count:", count)
        
    if "repository_requests" in [t[0] for t in tables]:
        count = cursor.execute("SELECT COUNT(*) FROM repository_requests").fetchone()[0]
        print("Repo Requests count:", count)

    if "domains" in [t[0] for t in tables]:
        print("Domains:", cursor.execute("SELECT id, name FROM domains").fetchall())

    conn.close()

if __name__ == "__main__":
    check()
