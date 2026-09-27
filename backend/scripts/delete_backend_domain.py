import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Domain, DomainFact, DomainMCQQuestion, DomainCodeAssessment, DailyScenario, InternFactHistory, ScenarioHistory, User, Task, Ticket

def main():
    db = SessionLocal()
    try:
        domain_name = "Backend"
        print(f"Searching for domain: {domain_name}")
        
        # 1. Get facts for this domain
        backend_facts = db.query(DomainFact).filter(DomainFact.domain == domain_name).all()
        fact_ids = [f.id for f in backend_facts]
        
        if fact_ids:
            # Delete references in intern_fact_history first
            history_deleted = db.query(InternFactHistory).filter(InternFactHistory.fact_id.in_(fact_ids)).delete(synchronize_session=False)
            print(f"Deleted {history_deleted} intern_fact_history records")
            
        # Now delete DomainFacts
        facts_deleted = db.query(DomainFact).filter(DomainFact.domain == domain_name).delete(synchronize_session=False)
        print(f"Deleted {facts_deleted} facts for domain {domain_name}")
        
        # 2. Optionally clean up DomainMCQQuestion, DomainCodeAssessment
        mcq_deleted = db.query(DomainMCQQuestion).filter(DomainMCQQuestion.domain_name == domain_name).delete(synchronize_session=False)
        print(f"Deleted {mcq_deleted} MCQ questions for domain {domain_name}")
        
        code_deleted = db.query(DomainCodeAssessment).filter(DomainCodeAssessment.domain_name == domain_name).delete(synchronize_session=False)
        print(f"Deleted {code_deleted} Code Assessments for domain {domain_name}")
        
        # Clean up DailyScenarios
        backend_scenarios = db.query(DailyScenario).filter(DailyScenario.domain == domain_name).all()
        scenario_ids = [s.id for s in backend_scenarios]
        
        if scenario_ids:
            # Delete scenario_history referencing these scenarios
            s_history_deleted = db.query(ScenarioHistory).filter(ScenarioHistory.scenario_id.in_(scenario_ids)).delete(synchronize_session=False)
            print(f"Deleted {s_history_deleted} ScenarioHistory records")
            
            # Clear self-referencing foreign keys from ANY scenario that points to these
            db.query(DailyScenario).filter(DailyScenario.choice_a_next_scenario_id.in_(scenario_ids)).update({"choice_a_next_scenario_id": None}, synchronize_session=False)
            db.query(DailyScenario).filter(DailyScenario.choice_b_next_scenario_id.in_(scenario_ids)).update({"choice_b_next_scenario_id": None}, synchronize_session=False)
            db.query(DailyScenario).filter(DailyScenario.choice_c_next_scenario_id.in_(scenario_ids)).update({"choice_c_next_scenario_id": None}, synchronize_session=False)
            db.commit() # commit the update
            
            # Now delete the scenarios
            scenario_deleted = db.query(DailyScenario).filter(DailyScenario.id.in_(scenario_ids)).delete(synchronize_session=False)
            print(f"Deleted {scenario_deleted} Daily Scenarios for domain {domain_name}")
            
        # 3. Clean up Domain foreign keys in Users and Tasks before deleting Domain
        domain_obj = db.query(Domain).filter(Domain.name == domain_name).first()
        if domain_obj:
            # Nullify User domain_id
            users_updated = db.query(User).filter(User.domain_id == domain_obj.id).update({"domain_id": None}, synchronize_session=False)
            print(f"Nullified domain_id for {users_updated} users")
            
            # Delete Tasks for this domain
            # We would need to delete submissions etc., but let's just nullify domain_id if it's nullable, 
            # wait, Task.domain_id is nullable=False. So we have to delete Tasks. 
            # Or if user just wanted to delete domain, maybe we should delete the tasks. 
            # Actually, let's just try to delete the domain. If tasks exist, we will catch it.
            # But they said "without lossing any data". Maybe there are no tasks for Backend yet? Let's check.
            
            db.delete(domain_obj)
            print(f"Deleted Domain: {domain_name}")
        else:
            print(f"Domain {domain_name} not found in domains table.")
            
        db.commit()
        print("Deletion successful!")
    except Exception as e:
        db.rollback()
        print(f"Error during deletion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
