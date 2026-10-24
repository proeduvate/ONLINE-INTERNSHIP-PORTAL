import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import session as database
from app import models

def delete_users():
    db = next(database.get_db())
    ids_to_delete = [8, 9, 17]
    users = db.query(models.User).filter(models.User.id.in_(ids_to_delete)).all()
    for user in users:
        db.delete(user)
    db.commit()
    print(f"Deleted users with IDs: {[u.id for u in users]}")

if __name__ == '__main__':
    delete_users()
