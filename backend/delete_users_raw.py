import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import session as database
from sqlalchemy import text

def delete_users():
    db = next(database.get_db())
    ids = (8, 9, 17)
    
    tables_with_intern_id = ['attendance_logs', 'submissions', 'certificates', 'daily_question_results', 'airdrop_attempts', 'airdrop_results', 'applications']
    for table in tables_with_intern_id:
        try:
            db.execute(text(f"DELETE FROM {table} WHERE intern_id IN {ids}"))
            db.commit()
        except Exception as e:
            db.rollback()
            
    tables_with_user_id = ['room_participants', 'notifications', 'applications', 'leaderboard']
    for table in tables_with_user_id:
        try:
            db.execute(text(f"DELETE FROM {table} WHERE user_id IN {ids}"))
            db.commit()
        except Exception as e:
            db.rollback()

    try:
        db.execute(text(f"DELETE FROM messages WHERE sender_id IN {ids} OR receiver_id IN {ids}"))
        db.commit()
    except:
        db.rollback()

    try:
        db.execute(text(f"DELETE FROM ticket_messages WHERE sender_id IN {ids}"))
        db.commit()
    except:
        db.rollback()

    try:
        db.execute(text(f"DELETE FROM tickets WHERE created_by IN {ids} OR assigned_to IN {ids} OR resolved_by IN {ids} OR closed_by IN {ids}"))
        db.commit()
    except:
        db.rollback()

    try:
        db.execute(text(f"DELETE FROM users WHERE id IN {ids}"))
        db.commit()
        print(f"Deleted users with IDs: {ids}")
    except Exception as e:
        db.rollback()
        print(f"Failed to delete users: {e}")

if __name__ == '__main__':
    delete_users()
