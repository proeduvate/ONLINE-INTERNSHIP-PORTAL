import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from database import engine
from models import TicketMessage, TicketHistory, Ticket
from sqlalchemy.orm import Session

def main():
    try:
        with Session(engine) as db:
            print("Deleting ticket messages...")
            db.query(TicketMessage).delete()
            print("Deleting ticket history...")
            db.query(TicketHistory).delete()
            print("Deleting tickets...")
            db.query(Ticket).delete()
            db.commit()
            print("All tickets successfully cleared!")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    main()
