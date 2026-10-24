from sqlalchemy import text
from database import engine

def upgrade():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE onboarding_applications ADD COLUMN offer_letter_url VARCHAR(255);"))
        except Exception as e:
            print("offer_letter_url might already exist:", e)
        try:
            conn.execute(text("ALTER TABLE onboarding_applications ADD COLUMN tc_url VARCHAR(255);"))
        except Exception as e:
            print("tc_url might already exist:", e)
        try:
            conn.execute(text("ALTER TABLE onboarding_applications ADD COLUMN signed_offer_letter_url VARCHAR(255);"))
        except Exception as e:
            print("signed_offer_letter_url might already exist:", e)
        try:
            conn.execute(text("ALTER TABLE onboarding_applications ADD COLUMN signed_tc_url VARCHAR(255);"))
        except Exception as e:
            print("signed_tc_url might already exist:", e)
        conn.commit()

if __name__ == "__main__":
    upgrade()
    print("Migration complete!")
