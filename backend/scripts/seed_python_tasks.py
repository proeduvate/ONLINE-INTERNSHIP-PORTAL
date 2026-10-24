import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Domain, Task

def seed_python_tasks():
    db = SessionLocal()
    try:
        # Get Python domain
        python_domain = db.query(Domain).filter(Domain.name == "Python").first()
        if not python_domain:
            print("Python domain not found!")
            return

        curriculum = {
            1: "Python Introduction & Environment",
            2: "Variables & Data Types",
            3: "Operators & Expressions",
            4: "Input, Output & Formatting",
            5: "Conditional Statements",
            6: "Loops & Iteration",
            7: "Loop Control Statements",
            8: "Strings & String Manipulation",
            9: "Lists & Nested Lists",
            10: "Tuples, Sets & Frozensets",
            11: "Dictionaries & Nested Dictionaries",
            12: "List, Set & Dictionary Comprehensions",
            13: "Functions & Scope",
            14: "Advanced Functions — *args, **kwargs & Arguments",
            15: "Lambda & Functional Programming",
            16: "Recursion & Recursive Algorithms",
            17: "Exception Handling",
            18: "Custom Exceptions & Error Handling",
            19: "File Handling",
            20: "CSV & JSON Processing",
            21: "Modules & Packages",
            22: "Object-Oriented Programming — Classes & Objects",
            23: "OOP — Encapsulation & Abstraction",
            24: "OOP — Inheritance & Polymorphism",
            25: "Iterators & Generators",
            26: "Decorators & Closures",
            27: "Regular Expressions & Text Processing",
            28: "Python Standard Library",
            29: "Debugging, Testing & Python Best Practices",
            30: "Python Automation & Real-World Application"
        }

        # Update existing Python coding tasks or create if missing
        print("Updating Python coding tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == python_domain.id,
                Task.task_type == "coding",
                Task.day_number == day
            ).first()
            
            title = curriculum[day]
            description = f"Complete your Day {day} learning modules on {curriculum[day]}."
            
            if existing_task:
                existing_task.title = title
                existing_task.description = description
            else:
                new_task = Task(
                    domain_id=python_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="coding",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Python coding tasks updated!")

        print("Updating Python simulation tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == python_domain.id,
                Task.task_type == "simulation",
                Task.day_number == day
            ).first()
            
            title = f"Day {day} Scenario: {curriculum[day]}"
            description = f"Complete your Day {day} workplace simulation on {curriculum[day]}."
            
            if existing_task:
                existing_task.title = title
                existing_task.description = description
            else:
                new_task = Task(
                    domain_id=python_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="simulation",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Python simulation tasks updated!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_python_tasks()
