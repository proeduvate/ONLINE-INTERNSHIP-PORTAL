import os
import json
import sys

# Add the backend directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

# Data directory path
DATA_DIR = os.path.join(
    os.path.dirname(__file__), "seed_data", "interactive"
)

def main():
    if not os.path.exists(DATA_DIR):
        print(f"Data directory not found at {DATA_DIR}")
        return

    db = SessionLocal()
    domains = db.query(models.Domain).all()

    for domain in domains:
        domain_slug = domain.name.lower().replace(" ", "-").replace("/", "-")
        domain_dir = os.path.join(DATA_DIR, domain_slug)
        
        if not os.path.exists(domain_dir):
            print(f"Directory not found for domain {domain.name}: {domain_dir}")
            continue

        for day in range(1, 31):
            file_path = os.path.join(domain_dir, f"day-{day:02d}.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data_content = f.read()
                        
                        # Verify it's valid JSON
                        json.loads(data_content)
                        
                        # Find corresponding tasks for this domain and day
                        tasks = db.query(models.Task).filter(
                            models.Task.domain_id == domain.id,
                            models.Task.day_number == day
                        ).all()
                        
                        for task in tasks:
                            task.interactive_json = data_content
                            
                except json.JSONDecodeError:
                    print(f"Invalid JSON in {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    db.commit()
    db.close()
    print("Database seeding complete.")

if __name__ == "__main__":
    main()
