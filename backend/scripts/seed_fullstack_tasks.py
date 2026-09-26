import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Domain, Task

def seed_fullstack_tasks():
    db = SessionLocal()
    try:
        # Get Full Stack domain
        fullstack_domain = db.query(Domain).filter(Domain.name == "Full Stack").first()
        if not fullstack_domain:
            print("Full Stack domain not found!")
            return

        curriculum = {
            1: "HTML Fundamentals & Web Structure",
            2: "Semantic HTML5 & Forms",
            3: "CSS Fundamentals & Selectors",
            4: "CSS Box Model, Typography & Colors",
            5: "Flexbox & Layout",
            6: "CSS Grid & Responsive Design",
            7: "CSS Transitions, Transforms & Animations",
            8: "JavaScript Fundamentals & Variables",
            9: "Operators, Conditions & Loops",
            10: "Functions, Scope & Closures",
            11: "Arrays, Objects & Modern JavaScript",
            12: "DOM Manipulation & Events",
            13: "Forms & Client-Side Validation",
            14: "JSON, Local Storage & Session Storage",
            15: "Asynchronous JavaScript, Promises & Fetch API",
            16: "React Fundamentals & Components",
            17: "JSX, Props & Component Composition",
            18: "React State, Events & Conditional Rendering",
            19: "React Hooks",
            20: "React Forms, API Integration & Routing",
            21: "Node.js Fundamentals & NPM",
            22: "Express.js & REST API Development",
            23: "Middleware, Routing & Error Handling",
            24: "MongoDB & Database Operations",
            25: "MongoDB with Node.js & Data Modeling",
            26: "Authentication & Authorization",
            27: "Full Stack Integration",
            28: "Security, Validation & Performance",
            29: "Testing, Debugging & Deployment",
            30: "Web Application Architecture & Best Practices"
        }

        # Update existing Full Stack coding tasks or create if missing
        print("Updating Full Stack coding tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == fullstack_domain.id,
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
                    domain_id=fullstack_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="coding",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Full Stack coding tasks updated!")

        print("Updating Full Stack simulation tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == fullstack_domain.id,
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
                    domain_id=fullstack_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="simulation",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Full Stack simulation tasks updated!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_fullstack_tasks()
