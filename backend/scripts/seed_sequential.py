import sys
import os
import json
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import SessionLocal
from models import DailyScenario

def clean_prefix(raw_prefix):
    if not raw_prefix: return ""
    prefix = re.sub(r'^(EXCELLENT DECISION|GOOD DECISION|RISKY DECISION)\s*', '', raw_prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^Excellent!?\s*', '', prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^Good[^\n]*\n', '', prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^Good[^\.]*\.\s*', '', prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^Needs Improvement\.?\s*', '', prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^🎉 Excellent!\s*', '', prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^👍 Good!\s*', '', prefix, flags=re.IGNORECASE)
    prefix = re.sub(r'^⚠️ Needs Improvement\.\s*', '', prefix, flags=re.IGNORECASE)
    return prefix.strip()

def seed_domain(db, domain_name, days):
    print(f"Seeding {domain_name} sequentially...")
    
    # Pass 1: Create all objects day by day, forwards
    day_nodes = [] # List of DailyScenario objects per day
    for i in range(30):
        day_data = days[i]
        day_number = i + 1
        
        scenario_text = day_data['scenario']
        
        db_scenario = DailyScenario(
            domain=domain_name,
            day_number=day_number,
            step_number=1,
            scenario_text=scenario_text,
            question_text=day_data["question"],
            choice_a_text=day_data["choice_a"],
            choice_a_feedback_type="Excellent",
            choice_a_reason=f"{day_data['why']}\n\n{day_data['a_feedback']}",
            choice_b_text=day_data["choice_b"],
            choice_b_feedback_type="Good",
            choice_b_reason=f"{day_data['why']}\n\n{day_data['b_feedback']}",
            choice_c_text=day_data["choice_c"],
            choice_c_feedback_type="Needs Improvement",
            choice_c_reason=f"{day_data['why']}\n\n{day_data['c_feedback']}",
            is_active=True
        )
        db.add(db_scenario)
        db.flush() # gets ID assigned sequentially
        day_nodes.append(db_scenario)
        
    # Pass 2: Link next_scenario_id from day N to day N+1
    for i in range(29): # Day 1 (index 0) to Day 29 (index 28)
        current_day_obj = day_nodes[i]
        next_day_obj = day_nodes[i+1]
        
        current_day_obj.choice_a_next_scenario_id = next_day_obj.id
        current_day_obj.choice_b_next_scenario_id = next_day_obj.id
        current_day_obj.choice_c_next_scenario_id = next_day_obj.id

def run():
    db = SessionLocal()
    try:
        # Load backend
        with open(os.path.join(os.path.dirname(__file__), "parsed_scenarios.json"), "r", encoding="utf-8") as f:
            backend_days = json.load(f)
            
        import seed_frontend_scenarios
        frontend_days = seed_frontend_scenarios.days
        
        with open(os.path.join(os.path.dirname(__file__), "parsed_aiml_scenarios.json"), "r", encoding="utf-8") as f:
            aiml_days = json.load(f)
            
        with open(os.path.join(os.path.dirname(__file__), "parsed_ds_scenarios.json"), "r", encoding="utf-8") as f:
            ds_days = json.load(f)
            
        with open(os.path.join(os.path.dirname(__file__), "parsed_cloud_scenarios.json"), "r", encoding="utf-8") as f:
            cloud_days = json.load(f)
            
        with open(os.path.join(os.path.dirname(__file__), "parsed_cyber_scenarios.json"), "r", encoding="utf-8") as f:
            cyber_days = json.load(f)
        
        seed_domain(db, "Backend", backend_days)
        seed_domain(db, "Frontend", frontend_days)
        seed_domain(db, "AIML", aiml_days)
        seed_domain(db, "Data science", ds_days)
        seed_domain(db, "Cloud Technologies", cloud_days)
        seed_domain(db, "Cyber Security", cyber_days)
        
        db.commit()
        print("Successfully seeded all domains sequentially!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run()
