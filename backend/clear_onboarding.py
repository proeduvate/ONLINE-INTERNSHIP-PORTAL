import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models
from sqlalchemy.exc import OperationalError, IntegrityError

def clear_onboarding_data():
    db = SessionLocal()
    try:
        count = db.query(models.OnboardingApplication).delete()
        db.commit()
        print(f'Successfully cleared {count} onboarding applications.')
    except OperationalError as e:
        print(f"Database connection error. Trying again might help. Error: {e}")
        db.rollback()
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    clear_onboarding_data()
