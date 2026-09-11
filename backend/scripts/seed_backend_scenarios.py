import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import SessionLocal
from models import DailyScenario

def seed_scenarios():
    with open(os.path.join(os.path.dirname(__file__), "parsed_scenarios.json"), "r", encoding="utf-8") as f:
        days = json.load(f)

    db = SessionLocal()

    # We will build the DAG from Day 30 backwards to Day 1
    # Keep track of the IDs of the next day's nodes
    next_max_id = None
    next_neutral_id = None
    next_negative_id = None

    domain_name = "Backend"

    try:
        # Loop backwards from 29 (Day 30) down to 0 (Day 1)
        for i in range(29, -1, -1):
            day_data = days[i]
            day_number = i + 1
            
            # Prepare the nodes for this day
            nodes_to_create = []
            
            if day_number == 1:
                # Root node
                nodes_to_create.append({
                    "path": "root",
                    "prefix": ""
                })
            else:
                # Day > 1, create 3 variants
                prev_day_data = days[i - 1]
                nodes_to_create.append({
                    "path": "max",
                    "prefix": prev_day_data["a_feedback"]
                })
                nodes_to_create.append({
                    "path": "neutral",
                    "prefix": prev_day_data["b_feedback"]
                })
                nodes_to_create.append({
                    "path": "negative",
                    "prefix": prev_day_data["c_feedback"]
                })

            current_day_ids = {}

            for node in nodes_to_create:
                raw_prefix = node["prefix"]
                prefix = ""
                if raw_prefix:
                    import re
                    prefix = re.sub(r'^(EXCELLENT DECISION|GOOD DECISION|RISKY DECISION)\s*', '', raw_prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Excellent!?\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Good[^\n]*\n', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Good[^\.]*\.\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Needs Improvement\.?\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^🎉 Excellent!\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^👍 Good!\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^⚠️ Needs Improvement\.\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = prefix.strip()
                    
                scenario_text = f"{prefix}\n\n{day_data['scenario']}".strip() if prefix else day_data['scenario']
                
                db_scenario = DailyScenario(
                    domain=domain_name,
                    day_number=day_number,
                    step_number=1, # Always 1 because it's 1 scenario per day now
                    scenario_text=scenario_text,
                    question_text=day_data["question"],
                    
                    choice_a_text=day_data["choice_a"],
                    choice_a_feedback_type="Excellent",
                    choice_a_reason=f"{day_data['why']}\n\n{day_data['a_feedback']}",
                    choice_a_next_scenario_id=next_max_id,
                    
                    choice_b_text=day_data["choice_b"],
                    choice_b_feedback_type="Good",
                    choice_b_reason=f"{day_data['why']}\n\n{day_data['b_feedback']}",
                    choice_b_next_scenario_id=next_neutral_id,
                    
                    choice_c_text=day_data["choice_c"],
                    choice_c_feedback_type="Needs Improvement",
                    choice_c_reason=f"{day_data['why']}\n\n{day_data['c_feedback']}",
                    choice_c_next_scenario_id=next_negative_id,
                    
                    is_active=True
                )
                db.add(db_scenario)
                db.flush() # To get the ID
                
                current_day_ids[node["path"]] = db_scenario.id
            
            # Now update the next_*_id pointers for the PREVIOUS iteration (which is the previous day)
            if day_number == 1:
                pass # No previous day
            else:
                next_max_id = current_day_ids["max"]
                next_neutral_id = current_day_ids["neutral"]
                next_negative_id = current_day_ids["negative"]

        db.commit()
        print("Successfully seeded the 30-day Backend Intern DAG!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_scenarios()
