import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from sqlalchemy import text

def merge_domains():
    db = SessionLocal()
    try:
        # Check domain IDs
        domains = db.execute(text("SELECT id, name FROM domains WHERE name IN ('Frontend', 'Frontend Development')")).fetchall()
        print("Found domains before merge:", domains)
        
        target_id = None
        source_id = None
        
        for d_id, d_name in domains:
            if d_name == "Frontend":
                target_id = d_id
            elif d_name == "Frontend Development":
                source_id = d_id
                
        if not source_id:
            print("No 'Frontend Development' domain found to merge.")
            return

        if not target_id:
            # If Frontend doesn't exist, just rename Frontend Development to Frontend
            db.execute(text("UPDATE domains SET name = 'Frontend' WHERE id = :source_id"), {"source_id": source_id})
            db.commit()
            print("Renamed 'Frontend Development' to 'Frontend'")
            return

        print(f"Merging domain ID {source_id} ('Frontend Development') into domain ID {target_id} ('Frontend')")

        # 1. Update Users table domain_id
        res_users = db.execute(
            text("UPDATE users SET domain_id = :target_id WHERE domain_id = :source_id"),
            {"target_id": target_id, "source_id": source_id}
        )
        print(f"Updated {res_users.rowcount} users.")

        # 2. Update Tasks table domain_id (avoiding duplicate day_number if target already has it)
        tasks_to_move = db.execute(
            text("SELECT id, day_number FROM tasks WHERE domain_id = :source_id"),
            {"source_id": source_id}
        ).fetchall()

        for t_id, day_num in tasks_to_move:
            existing_target_task = db.execute(
                text("SELECT id FROM tasks WHERE domain_id = :target_id AND day_number = :day_num"),
                {"target_id": target_id, "day_num": day_num}
            ).fetchone()

            if existing_target_task:
                # Target already has a task for this day_number, delete the source task or re-link submissions
                db.execute(
                    text("UPDATE submissions SET task_id = :target_task_id WHERE task_id = :source_task_id"),
                    {"target_task_id": existing_target_task[0], "source_task_id": t_id}
                )
                db.execute(text("DELETE FROM tasks WHERE id = :source_task_id"), {"source_task_id": t_id})
            else:
                db.execute(
                    text("UPDATE tasks SET domain_id = :target_id WHERE id = :t_id"),
                    {"target_id": target_id, "t_id": t_id}
                )

        # Commit FK user/task updates so far
        db.commit()

        # 3. Update daily_scenarios table if it has domain column
        try:
            res_scenarios = db.execute(
                text("UPDATE daily_scenarios SET domain = 'Frontend' WHERE domain = 'Frontend Development'")
            )
            print(f"Updated {res_scenarios.rowcount} daily_scenarios.")
            db.commit()
        except Exception as e:
            db.rollback()
            print("Daily scenarios update note:", e)

        # 4. Delete the source domain record
        res_del = db.execute(text("DELETE FROM domains WHERE id = :source_id"), {"source_id": source_id})
        print(f"Deleted source domain record ID {source_id}.")
        db.commit()

        print("Successfully merged domains into 'Frontend'!")

        # Print final domains list
        final_domains = db.execute(text("SELECT id, name FROM domains ORDER BY id")).fetchall()
        print("\nUpdated Domains in Database:")
        for d in final_domains:
            print(f"  ID {d[0]}: {d[1]}")

    except Exception as e:
        db.rollback()
        print("Error during domain merge:", e)
    finally:
        db.close()

if __name__ == "__main__":
    merge_domains()
