import os
import json
import sys
from datetime import datetime

# SQLAlchemy setup
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import SessionLocal
from app import models
from app.models import Task, Domain, User, DailyScenario

raw_domain_data = """
------------------------------------------------------------
DOMAIN 1: BACKEND
------------------------------------------------------------

DAY 1:
Production API suddenly becomes slow.
DAY 2:
Database query discovered to be causing yesterday's problem.
DAY 3:
Database index needs to be introduced safely.
DAY 4:
Production deployment fails because of configuration mismatch.
DAY 5:
Sensitive authentication information appears in logs.
DAY 6:
Customer reports being charged twice.
DAY 7:
Duplicate payment requests are discovered.
DAY 8:
Frontend requests an API response change that could break existing clients.
DAY 9:
Orders exist without corresponding customer records.
DAY 10:
Code review identifies duplicated business logic.
DAY 11:
E-commerce traffic suddenly increases five times.
DAY 12:
Database connection pool reaches its limit.
DAY 13:
Product manager requests order cancellation without defining business rules.
DAY 14:
Cancellation causes payment and inventory inconsistency.
DAY 15:
Third-party payment provider becomes unavailable.
DAY 16:
Customer reports incorrect order total that cannot be reproduced locally.
DAY 17:
Large production database migration is required.
DAY 18:
Migration creates incorrect values for legacy records.
DAY 19:
Users suddenly receive authentication failures.
DAY 20:
Normal employee discovers an admin endpoint is accessible.
DAY 21:
Nightly reporting job silently fails.
DAY 22:
Backend route handlers contain too much business logic.
DAY 23:
Product manager requests a feature before the realistic deadline.
DAY 24:
Concurrent requests create inconsistent data.
DAY 25:
Major client demo is tomorrow and a performance problem exists.
DAY 26:
Production incident occurs during client demo.
DAY 27:
Root cause must be documented after the incident.
DAY 28:
Mentor gives the intern an independent backend feature.
DAY 29:
Feature is ready but production configuration has not been verified.
DAY 30:
Major production release requires final technical approval.

------------------------------------------------------------
DOMAIN 2: FRONTEND
------------------------------------------------------------

DAY 1:
Build a SaaS dashboard from an incomplete client requirement.
DAY 2:
Designer says the implemented dashboard does not match the approved design.
DAY 3:
Backend API contains missing activity data.
DAY 4:
Dashboard shows a blank screen while loading.
DAY 5:
Backend API temporarily fails.
DAY 6:
Dashboard breaks on mobile.
DAY 7:
Registration form accepts incomplete information.
DAY 8:
Product team changes registration requirements.
DAY 9:
Dashboard sends duplicate API requests.
DAY 10:
User session expires while using the application.
DAY 11:
Sensitive backend data is accidentally available to the UI.
DAY 12:
Multiple pages contain duplicated user-card components.
DAY 13:
Dashboard becomes slow with hundreds of records.
DAY 14:
Feature behaves differently in another browser.
DAY 15:
Keyboard users cannot properly navigate the application.
DAY 16:
New filter feature breaks existing search.
DAY 17:
Shared application state becomes inconsistent.
DAY 18:
Real-time notifications appear more than once.
DAY 19:
Product manager requests a major feature one day before demo.
DAY 20:
Frontend works locally but calls the wrong backend URL in staging.
DAY 21:
Production users see an empty dashboard that works locally.
DAY 22:
Large file uploads freeze the browser.
DAY 23:
User-controlled content creates a frontend security concern.
DAY 24:
Code review identifies maintainability problems.
DAY 25:
Client demo reveals unnecessary frontend processing.
DAY 26:
Two developers create a Git merge conflict.
DAY 27:
Release candidate contains a minor but real UI issue.
DAY 28:
Critical login, performance and UI issues must be prioritized.
DAY 29:
Mentor gives the intern an independent frontend feature.
DAY 30:
Final client release requires a release-readiness decision.

------------------------------------------------------------
DOMAIN 3: AIML
------------------------------------------------------------

DAY 1:
A training dataset contains missing values.
DAY 2:
Duplicate records appear in the dataset.
DAY 3:
Labels from different teams do not match.
DAY 4:
Initial model accuracy is much lower than expected.
DAY 5:
Training accuracy is high but validation accuracy is poor.
DAY 6:
Model performs poorly on new unseen data.
DAY 7:
One feature contains suspicious values.
DAY 8:
Training pipeline takes much longer than expected.
DAY 9:
Multiple data sources use different formats.
DAY 10:
Model performs significantly worse for one user group.
DAY 11:
Business team asks why a model made a particular prediction.
DAY 12:
Production predictions differ from testing results.
DAY 13:
Automated data pipeline fails overnight.
DAY 14:
New incoming data changes model performance.
DAY 15:
Team wants to add many new features.
DAY 16:
Team proposes retraining the model immediately.
DAY 17:
Training data contains sensitive information.
DAY 18:
ML inference API becomes slow.
DAY 19:
Production model gives unexpected predictions.
DAY 20:
Two models produce different results.
DAY 21:
Dataset is too small for the requested model.
DAY 22:
Business stakeholder demands unrealistic accuracy.
DAY 23:
Model works in notebook but fails after deployment.
DAY 24:
Monitoring shows model performance degradation.
DAY 25:
Team wants to remove a validation step to save time.
DAY 26:
Production model produces suspicious outputs.
DAY 27:
New model version is ready for production.
DAY 28:
Multiple ML problems appear before a deadline.
DAY 29:
Mentor gives the intern an independent ML investigation.
DAY 30:
Intern must decide whether the model is production-ready.

------------------------------------------------------------
DOMAIN 4: DATA SCIENCE
------------------------------------------------------------

DAY 1:
Sales dataset contains missing values.
DAY 2:
Duplicate transactions appear.
DAY 3:
Sales data contains extreme outliers.
DAY 4:
Management asks why sales dropped.
DAY 5:
Two business reports show different sales numbers.
DAY 6:
Dates from multiple systems use different formats.
DAY 7:
A business metric suddenly changes.
DAY 8:
Manager requests a dashboard without defining metrics.
DAY 9:
Strong correlation is discovered between two variables.
DAY 10:
A small sample produces an unusually strong result.
DAY 11:
Business asks for a prediction without sufficient historical data.
DAY 12:
Analysis produces an unexpected result.
DAY 13:
Important customer records are missing.
DAY 14:
Two teams use different definitions for the same KPI.
DAY 15:
Dashboard processing becomes slow.
DAY 16:
Stakeholder asks to remove inconvenient data from analysis.
DAY 17:
Sensitive customer information appears in the dataset.
DAY 18:
Management wants the report before validation is complete.
DAY 19:
A new dataset becomes available.
DAY 20:
Forecast performs poorly against actual results.
DAY 21:
Stakeholder incorrectly interprets a chart.
DAY 22:
Teams disagree about the definition of a business metric.
DAY 23:
Current analysis cannot answer the original business question.
DAY 24:
Data pipeline produces inconsistent results.
DAY 25:
Several possible insights compete for management attention.
DAY 26:
Stakeholder requests a conclusion not supported by the data.
DAY 27:
Final report contains suspicious numbers before presentation.
DAY 28:
Several analytical issues remain before the deadline.
DAY 29:
Mentor asks the intern to independently prepare a business analysis.
DAY 30:
Management asks for a final data-driven recommendation.

------------------------------------------------------------
DOMAIN 5: CLOUD
------------------------------------------------------------

DAY 1:
Cloud application suddenly becomes slow.
DAY 2:
Server CPU usage increases unexpectedly.
DAY 3:
Cloud storage is almost full.
DAY 4:
Application becomes unavailable.
DAY 5:
Cloud deployment fails.
DAY 6:
Cloud bill suddenly increases.
DAY 7:
Database connection limit is reached.
DAY 8:
Application works locally but fails in the cloud.
DAY 9:
Two cloud services cannot communicate.
DAY 10:
Cloud credentials are accidentally exposed.
DAY 11:
Application needs additional capacity.
DAY 12:
Traffic suddenly increases.
DAY 13:
Automated backup fails.
DAY 14:
Monitoring sends a production alert.
DAY 15:
Team proposes disabling monitoring to reduce noise.
DAY 16:
Unused cloud resources are discovered.
DAY 17:
Deployment causes service degradation.
DAY 18:
Multiple services depend on one component.
DAY 19:
Application needs high availability.
DAY 20:
Disaster recovery test exposes weaknesses.
DAY 21:
Infrastructure configuration differs between environments.
DAY 22:
Cloud cost continues increasing.
DAY 23:
A security group allows unnecessary access.
DAY 24:
Health checks fail intermittently.
DAY 25:
Infrastructure change conflicts with release deadline.
DAY 26:
Production resource requires an urgent change.
DAY 27:
Monitoring reveals repeated infrastructure failures.
DAY 28:
Multiple cloud services fail at the same time.
DAY 29:
Mentor gives the intern responsibility for a deployment.
DAY 30:
Intern must make the final cloud release decision.

------------------------------------------------------------
DOMAIN 6: CYBER SECURITY
------------------------------------------------------------

DAY 1:
Employee receives a suspicious email.
DAY 2:
Multiple failed login attempts appear.
DAY 3:
Unknown device accesses an employee account.
DAY 4:
API exposes information that users should not access.
DAY 5:
Password information appears in application logs.
DAY 6:
Employee reports a suspicious attachment.
DAY 7:
Unusual network traffic appears.
DAY 8:
Old employee accounts remain active.
DAY 9:
Application uses a weak password policy.
DAY 10:
Cloud storage is publicly accessible.
DAY 11:
Important security patch becomes available.
DAY 12:
A dependency has a known vulnerability.
DAY 13:
Developer wants to hardcode credentials.
DAY 14:
Employee has excessive permissions.
DAY 15:
Suspicious login occurs from an unusual location.
DAY 16:
Security alert appears during deployment.
DAY 17:
Sensitive information is stored without adequate protection.
DAY 18:
Security scan produces hundreds of findings.
DAY 19:
Team wants to ignore low-severity vulnerabilities.
DAY 20:
Possible phishing incident is reported.
DAY 21:
API endpoint lacks proper authorization.
DAY 22:
Security configuration differs between environments.
DAY 23:
Former employee account is still active.
DAY 24:
Suspicious process appears on a production server.
DAY 25:
Security incident affects production.
DAY 26:
Someone asks the intern to delete suspicious logs.
DAY 27:
Critical vulnerability is discovered before release.
DAY 28:
Multiple security findings must be prioritized.
DAY 29:
Intern participates in a security incident response.
DAY 30:
Intern must make the final incident-response decision.
"""

def parse_raw_data():
    domains = {}
    lines = raw_domain_data.split('\n')
    current_domain = None
    current_day = None
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith('-'):
            continue
            
        if line.startswith('DOMAIN'):
            current_domain = line.split(':')[1].strip()
            domains[current_domain] = {}
        elif line.startswith('DAY'):
            day_str = line.split(':')[0].replace('DAY', '').strip()
            try:
                current_day = int(day_str)
                # the next line should be the topic
                topic = lines[i+1].strip()
                domains[current_domain][current_day] = topic
            except:
                pass
                
    return domains

def generate_decision_tree(domain_name, day, topic):
    scenarios = []
    
    for step in range(1, 6):
        scenario_id = f"day{day}_s{step}"
        next_scenario_id = f"day{day}_s{step+1}" if step < 5 else None
        
        if step == 1:
            situation = topic
            question = "How do you respond to this initial situation?"
        elif step == 2:
            situation = "Following your initial decision, the team looks for more information."
            question = "What is your next step in the investigation?"
        elif step == 3:
            situation = "You receive additional data suggesting a deeper root cause."
            question = "How do you handle this new evidence?"
        elif step == 4:
            situation = "Your mentor asks you to propose a final solution."
            question = "Which approach do you recommend?"
        elif step == 5:
            situation = "The proposed solution must now be communicated and implemented."
            question = "How do you finalize this task?"

        # Generic choices that fit the required scoring
        choices = [
            {
                "id": "A",
                "type": "MAX",
                "text": "Analyze the situation carefully, consult documentation/mentor, and apply a safe, evidence-based solution.",
                "score": 10,
                "feedback": "Excellent choice. Professional and safe.",
                "consequence": f"Good decision. The issue is contained. Your mentor trusts your judgement. Now proceed to step {step+1}.",
                "dimension": "decision_quality",
                "next_scenario": next_scenario_id
            },
            {
                "id": "B",
                "type": "NEUTRAL",
                "text": "Apply a quick fix that resolves the immediate symptom but might not address the root cause.",
                "score": 5,
                "feedback": "Reasonable but incomplete.",
                "consequence": f"The immediate symptom is resolved, but the root cause remains. Your mentor asks you to dig deeper in step {step+1}.",
                "dimension": "technical_reasoning",
                "next_scenario": next_scenario_id
            },
            {
                "id": "C",
                "type": "NEGATIVE",
                "text": "Ignore proper process, rush a change to production, or delete evidence of the problem.",
                "score": -5,
                "feedback": "Reckless action.",
                "consequence": f"This caused further instability. Your mentor is concerned and asks you to immediately rectify the situation in step {step+1}.",
                "dimension": "risk_awareness",
                "next_scenario": next_scenario_id
            }
        ]
        
        # If it's the last step, adjust consequence
        if step == 5:
            for c in choices:
                c["consequence"] = c["consequence"].split(" Now proceed")[0].split(" in step")[0] + " The day's challenge is complete."
        
        scenarios.append({
            "scenario_id": scenario_id,
            "situation": situation,
            "question": question,
            "choices": choices
        })
        
    return scenarios

def seed_simulations():
    db = SessionLocal()
    domains_data = parse_raw_data()
    
    print(f"Parsed {len(domains_data)} domains.")
    
    for domain_name, days in domains_data.items():
        print(f"Seeding {domain_name}...")
        
        for day, topic in days.items():
            scenarios = generate_decision_tree(domain_name, day, topic)
            
            for step, scenario_data in enumerate(scenarios, start=1):
                choices = scenario_data.get("choices", [])
                
                # Check if scenario exists
                existing = db.query(models.DailyScenario).filter(
                    models.DailyScenario.domain == domain_name.capitalize(),
                    models.DailyScenario.day_number == day,
                    models.DailyScenario.step_number == step
                ).first()
                
                if existing:
                    existing.scenario_text = scenario_data["situation"]
                    existing.choice_a_text = choices[0]["text"] if len(choices) > 0 else ""
                    existing.choice_a_points = choices[0]["score"] if len(choices) > 0 else 0
                    existing.choice_a_reason = choices[0]["consequence"] if len(choices) > 0 else ""
                    
                    existing.choice_b_text = choices[1]["text"] if len(choices) > 1 else ""
                    existing.choice_b_points = choices[1]["score"] if len(choices) > 1 else 0
                    existing.choice_b_reason = choices[1]["consequence"] if len(choices) > 1 else ""
                    
                    existing.choice_c_text = choices[2]["text"] if len(choices) > 2 else ""
                    existing.choice_c_points = choices[2]["score"] if len(choices) > 2 else 0
                    existing.choice_c_reason = choices[2]["consequence"] if len(choices) > 2 else ""
                else:
                    new_scenario = models.DailyScenario(
                        domain=domain_name.capitalize(),
                        day_number=day,
                        step_number=step,
                        scenario_text=scenario_data["situation"],
                        choice_a_text=choices[0]["text"] if len(choices) > 0 else "",
                        choice_a_points=choices[0]["score"] if len(choices) > 0 else 0,
                        choice_a_reason=choices[0]["consequence"] if len(choices) > 0 else "",
                        choice_b_text=choices[1]["text"] if len(choices) > 1 else "",
                        choice_b_points=choices[1]["score"] if len(choices) > 1 else 0,
                        choice_b_reason=choices[1]["consequence"] if len(choices) > 1 else "",
                        choice_c_text=choices[2]["text"] if len(choices) > 2 else "",
                        choice_c_points=choices[2]["score"] if len(choices) > 2 else 0,
                        choice_c_reason=choices[2]["consequence"] if len(choices) > 2 else ""
                    )
                    db.add(new_scenario)
                
    db.commit()
    db.close()
    print("Seeding complete! 900 decision points generated into daily_scenarios.")

if __name__ == "__main__":
    seed_simulations()
