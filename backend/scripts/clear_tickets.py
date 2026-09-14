import sys
import os
from sqlalchemy import text

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            # Delete in order to respect foreign key constraints
            conn.execute(text("DELETE FROM ticket_history;"))
            conn.execute(text("DELETE FROM ticket_messages;"))
            conn.execute(text("DELETE FROM tickets;"))
            conn.commit()
            print("Successfully removed all data from the ticket system tables (ticket_history, ticket_messages, tickets).")
    except Exception as e:
        print(f"Error clearing ticket data: {e}")

if __name__ == "__main__":
    main()
