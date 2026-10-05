import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models import Domain, Task

def seed_frontend_tasks():
    db = SessionLocal()
    try:
        # Get Frontend domain
        frontend_domain = db.query(Domain).filter(Domain.name == "Frontend").first()
        if not frontend_domain:
            print("Frontend domain not found!")
            return

        curriculum = {
            1: "HTML Fundamentals & Document Structure",
            2: "Semantic HTML5",
            3: "HTML Forms & Input Elements",
            4: "HTML Media, Links, Lists & Tables",
            5: "CSS Fundamentals & Selectors",
            6: "CSS Box Model",
            7: "CSS Typography, Colors & Backgrounds",
            8: "Flexbox",
            9: "CSS Grid",
            10: "Responsive Web Design",
            11: "CSS Positioning & Layout",
            12: "CSS Transitions, Transforms & Animations",
            13: "JavaScript Fundamentals",
            14: "Conditions, Loops & Control Flow",
            15: "Functions, Scope & Closures",
            16: "Arrays, Objects & Modern JavaScript",
            17: "DOM Manipulation",
            18: "Events & Event Handling",
            19: "Forms & Client-Side Validation",
            20: "JSON, Local Storage & Session Storage",
            21: "Asynchronous JavaScript & Promises",
            22: "REST APIs & Fetch",
            23: "React Fundamentals & Components",
            24: "JSX, Props & Component Composition",
            25: "React State & Event Handling",
            26: "React Hooks",
            27: "React Forms & API Integration",
            28: "React Router & Application Architecture",
            29: "Frontend Performance, Debugging & Optimization",
            30: "Web Accessibility, Security & Deployment"
        }

        # Update existing Frontend coding tasks or create if missing
        print("Updating Frontend coding tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == frontend_domain.id,
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
                    domain_id=frontend_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="coding",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Frontend coding tasks updated!")

        print("Updating Frontend simulation tasks...")
        for day in range(1, 31):
            existing_task = db.query(Task).filter(
                Task.domain_id == frontend_domain.id,
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
                    domain_id=frontend_domain.id,
                    day_number=day,
                    title=title,
                    description=description,
                    task_type="simulation",
                    difficulty="medium"
                )
                db.add(new_task)
        db.commit()
        print("Frontend simulation tasks updated!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_frontend_tasks()
