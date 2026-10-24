import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import engine
from sqlalchemy import text

def delete_all_except_allowed():
    allowed = ["admin@gmail.com", "mentor@gmail.com", "kaul190905@gmail.com"]
    allowed_str = ", ".join([f"'{e}'" for e in allowed])
    
    with engine.connect() as conn:
        res = conn.execute(text(f"SELECT id, email, full_name, role FROM users WHERE LOWER(email) NOT IN ({allowed_str})")).fetchall()
        print(f"Found {len(res)} users to delete:")
        delete_ids = []
        for r in res:
            print(f" - ID: {r[0]}, Email: '{r[1]}', Name: '{r[2]}', Role: '{r[3]}'")
            delete_ids.append(r[0])
            
        if not delete_ids:
            print("\nNo extra accounts to delete!")
            return
            
        ids_tuple = f"({', '.join(map(str, delete_ids))})"
        print(f"\nDeleting dependent records for User IDs: {ids_tuple}...")

        # List of SQL statements to clean up before deleting users
        cleanup_sqls = [
            f"UPDATE onboarding_applications SET user_id = NULL WHERE user_id IN {ids_tuple}",
            f"DELETE FROM ticket_messages WHERE sender_id IN {ids_tuple}",
            f"DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM tickets WHERE created_by IN {ids_tuple} OR assigned_to IN {ids_tuple} OR resolved_by IN {ids_tuple} OR closed_by IN {ids_tuple})",
            f"DELETE FROM ticket_history WHERE ticket_id IN (SELECT id FROM tickets WHERE created_by IN {ids_tuple} OR assigned_to IN {ids_tuple} OR resolved_by IN {ids_tuple} OR closed_by IN {ids_tuple})",
            f"DELETE FROM tickets WHERE created_by IN {ids_tuple} OR assigned_to IN {ids_tuple} OR resolved_by IN {ids_tuple} OR closed_by IN {ids_tuple}",
            f"DELETE FROM messages WHERE sender_id IN {ids_tuple} OR receiver_id IN {ids_tuple}",
            f"DELETE FROM room_participants WHERE user_id IN {ids_tuple}",
            f"DELETE FROM notifications WHERE user_id IN {ids_tuple}",
            f"DELETE FROM mcq_attempts WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM coding_submissions WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM code_attempts WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM submissions WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM attendance_logs WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM certificates WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM daily_question_results WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM airdrop_attempts WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM airdrop_results WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM final_evaluations WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM point_transactions WHERE user_id IN {ids_tuple}",
            f"DELETE FROM meetings WHERE mentor_id IN {ids_tuple}",
            f"DELETE FROM intern_fact_history WHERE intern_id IN {ids_tuple}",
            f"DELETE FROM scenario_history WHERE intern_id IN {ids_tuple}",
            f"UPDATE users SET mentor_id = NULL WHERE mentor_id IN {ids_tuple}",
            f"UPDATE users SET mentor_id = NULL WHERE id IN {ids_tuple}",
            f"DELETE FROM users WHERE id IN {ids_tuple}"
        ]

        for sql in cleanup_sqls:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"Success: {sql[:60]}...")
            except Exception as err:
                conn.rollback()
                print(f"Skipped table/column error: {sql[:50]}... -> {err}")

        remaining = conn.execute(text("SELECT id, email, full_name, role FROM users")).fetchall()
        print(f"\nRemaining User Accounts in Database ({len(remaining)}):")
        for r in remaining:
            print(f" - ID: {r[0]}, Email: '{r[1]}', Name: '{r[2]}', Role: '{r[3]}'")

if __name__ == "__main__":
    delete_all_except_allowed()
