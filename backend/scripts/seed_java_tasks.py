import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Domain, Task

def seed_java_tasks():
    db = SessionLocal()
    try:
        # Get Java domain
        java_domain = db.query(Domain).filter(Domain.name == "Java").first()
        
        # Note: If "Java" is not the domain name, it might be "Backend" or similar in some databases, 
        # but let's assume "Java" domain exists or create it if missing for safety.
        if not java_domain:
            java_domain = Domain(name="Java", description="Learn and build skills in Java.")
            db.add(java_domain)
            db.commit()
            db.refresh(java_domain)
            print("Created missing Java domain!")

        curriculum = {
            1: "Java Introduction, JDK, JRE, JVM & Basic Syntax",
            2: "Variables, Data Types & Type Casting",
            3: "Operators & Expressions",
            4: "Input, Output & Formatting",
            5: "Conditional Statements",
            6: "Loops & Iteration",
            7: "Nested Loops & Pattern Programming",
            8: "Arrays",
            9: "Multidimensional Arrays",
            10: "Strings & String Manipulation",
            11: "StringBuilder & StringBuffer",
            12: "Methods & Parameter Passing",
            13: "Method Overloading & Varargs",
            14: "Recursion & Recursive Algorithms",
            15: "Classes, Objects & Constructors",
            16: "Encapsulation & Access Modifiers",
            17: "Inheritance & super",
            18: "Polymorphism, Method Overriding & Dynamic Binding",
            19: "Abstraction & Interfaces",
            20: "Exception Handling & Custom Exceptions",
            21: "Packages, static, final & Java Organization",
            22: "Collections — List, Set & Queue",
            23: "Collections — Map & HashMap",
            24: "Generics & Type-Safe Programming",
            25: "Iterators & Enhanced Collection Processing",
            26: "Lambda Expressions & Functional Interfaces",
            27: "Stream API",
            28: "File Handling & Serialization",
            29: "Multithreading, Debugging & Testing",
            30: "Java Automation & Real-World Application"
        }

        # Update existing Java coding tasks or create if missing
        print("Updating Java coding tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == java_domain.id,
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
                    domain_id=java_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="coding",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Java coding tasks updated!")

        print("Updating Java simulation tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == java_domain.id,
                Task.task_type == "simulation",
                Task.day_number == day
            ).first()
            
            title = curriculum[day]
            description = f"Complete your Day {day} workplace simulation on {curriculum[day]}."
            
            if existing_task:
                existing_task.title = title
                existing_task.description = description
            else:
                new_task = Task(
                    domain_id=java_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="simulation",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Java simulation tasks updated!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_java_tasks()
