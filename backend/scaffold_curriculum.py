import os
import json
import sys

# Add the backend directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

# Data directory path
DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "src", "features", "learning", "interactive", "data"
)

def create_boilerplate_json(domain_name, day_num):
    return {
        "curriculum": domain_name,
        "day": day_num,
        "topic": f"Day {day_num} Topic for {domain_name}",
        "version": 1,
        "learningMode": "interactive_deck",
        "learningObjectives": [
            "Objective 1",
            "Objective 2",
            "Objective 3"
        ],
        "activities": [
            {
                "id": f"d{day_num:02d}-a01",
                "type": "discover",
                "title": "Activity 1",
                "instruction": "Instruction for activity 1",
                "content": {
                    "concept": "Concept 1",
                    "tip": "Tip for activity 1"
                },
                "interaction": {
                    "mode": "html-discover"
                }
            }
        ],
        "assessmentRef": f"assessment-day-{day_num:02d}.json",
        "practicalTaskRef": f"practical-day-{day_num:02d}.json",
        "progression": {
            "nextActivityLockedUntilComplete": True,
            "nextDayLockedUntilComplete": True
        },
        "separation": {
            "learning": "Teach the concept through an interactive experience.",
            "assessment": "Stored separately and completed after learning.",
            "practical": "Stored separately and completed after assessment."
        }
    }

def main():
    if not os.path.exists(DATA_DIR):
        print(f"Data directory not found at {DATA_DIR}")
        return

    db = SessionLocal()
    domains = db.query(models.Domain).all()
    db.close()

    for domain in domains:
        domain_slug = domain.name.lower().replace(" ", "-").replace("/", "-")
        domain_dir = os.path.join(DATA_DIR, domain_slug)
        
        if not os.path.exists(domain_dir):
            os.makedirs(domain_dir)
            print(f"Created directory: {domain_dir}")

        for day in range(1, 31):
            file_path = os.path.join(domain_dir, f"day-{day:02d}.json")
            if not os.path.exists(file_path):
                data = create_boilerplate_json(domain.name, day)
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                # print(f"Created {file_path}")
            else:
                pass
                
    print("Scaffolding complete.")

if __name__ == "__main__":
    main()
