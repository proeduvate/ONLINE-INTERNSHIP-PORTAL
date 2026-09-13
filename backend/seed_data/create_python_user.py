import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app.models import User, Domain, Task, DomainMCQQuestion
from app.core.security import hash_password

def add_python_user():
    db = SessionLocal()
    try:
        # Check if Python domain exists
        python_domain = db.query(Domain).filter(Domain.name == "Python").first()
        if not python_domain:
            print("Python domain not found! Cannot add user.")
            return

        print(f"Found Python Domain (ID: {python_domain.id})")

        # Check seeded data for Python domain
        tasks_count = db.query(Task).filter(Task.domain_id == python_domain.id).count()
        mcqs_count = db.query(DomainMCQQuestion).filter(DomainMCQQuestion.domain_name == "Python").count()
        
        print(f"Seeded Python Tasks: {tasks_count}")
        print(f"Seeded Python MCQs: {mcqs_count}")

        # Check if user already exists
        user = db.query(User).filter(User.email == "python@gmail.com").first()
        if user:
            print("User python@gmail.com already exists. Updating domain to Python.")
            user.domain_id = python_domain.id
            user.role = "intern"
        else:
            print("Creating new user python@gmail.com")
            user = User(
                name="Python Intern",
                email="python@gmail.com",
                hashed_password=hash_password("python"),
                role="intern",
                domain_id=python_domain.id,
                batch_id=1  # Assuming batch 1 exists
            )
            db.add(user)
        
        db.commit()
        print("Successfully added/updated python@gmail.com!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_python_user()
