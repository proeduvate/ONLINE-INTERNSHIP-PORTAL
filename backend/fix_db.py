import sys
sys.path.append('c:\\proeduvate\\ONLINE-INTERNSHIP-PORTAL\\backend')
from database import engine
from sqlalchemy import text

conn = engine.connect()
conn.execute(text("UPDATE github_repository_requests SET domain = 'Frontend'"))
conn.commit()
print("Updated requests domain to Frontend.")
