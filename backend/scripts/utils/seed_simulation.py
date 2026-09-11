import json
from app.db.session import SessionLocal
from app import models

def seed_simulation():
    db = SessionLocal()
    try:
        # Get Backend domain
        domain = db.query(models.Domain).filter(models.Domain.name.ilike("%Backend%")).first()
        if not domain:
            print("Backend domain not found!")
            return

        # Check if simulation task already exists
        existing_task = db.query(models.Task).filter(
            models.Task.domain_id == domain.id,
            models.Task.day_number == 1,
            models.Task.task_type == "simulation"
        ).first()

        scenarios = [
            {
                "scenario_id": "1",
                "situation": "Your team is preparing a new application for a client demonstration tomorrow. During testing, you notice that some users are suddenly unable to log in, while other users can log in normally. You are asked to investigate.",
                "question": "What would you do first?",
                "choices": [
                    {
                        "id": "A",
                        "text": "Check the recent authentication-related code changes and application logs.",
                        "score": 10,
                        "consequence": "Good decision. The logs show that the failures started immediately after a recent authentication update. Only users with a specific account configuration are affected.",
                        "dimension": "problem_solving",
                        "next_scenario": "2"
                    },
                    {
                        "id": "B",
                        "text": "Ask the frontend developer to rebuild the login page.",
                        "score": -5,
                        "consequence": "The frontend rebuilds the page, but the issue remains. Valuable time is lost.",
                        "dimension": "technical_reasoning",
                        "next_scenario": "2"
                    },
                    {
                        "id": "C",
                        "text": "Delete the affected user accounts and create them again.",
                        "score": -5,
                        "consequence": "You destroyed user data. The underlying issue is still not fixed and will happen again to other users.",
                        "dimension": "risk_awareness",
                        "next_scenario": "2"
                    },
                    {
                        "id": "D",
                        "text": "Disable authentication temporarily so everyone can access the application.",
                        "score": -5,
                        "consequence": "Security risk! The application is exposed. The team quickly reverts your change.",
                        "dimension": "risk_awareness",
                        "next_scenario": "2"
                    }
                ]
            },
            {
                "scenario_id": "2",
                "situation": "The logs show that the problem began after a recent authentication update. You inspect the changed code and discover that the application now validates a user's account status before creating a session.",
                "question": "What would you investigate next?",
                "choices": [
                    {
                        "id": "A",
                        "text": "Check how account status is stored and how the backend reads that value.",
                        "score": 10,
                        "consequence": "Good investigation. You discover that older user records contain a missing account-status value, while newly created accounts contain the expected value.",
                        "dimension": "problem_solving",
                        "next_scenario": "3"
                    },
                    {
                        "id": "B",
                        "text": "Change the login button design.",
                        "score": -5,
                        "consequence": "This is completely irrelevant to the backend error. The login issue continues.",
                        "dimension": "technical_reasoning",
                        "next_scenario": "3"
                    },
                    {
                        "id": "C",
                        "text": "Increase the server's CPU capacity.",
                        "score": -5,
                        "consequence": "Resource usage is normal. Scaling up the server doesn't fix logic errors.",
                        "dimension": "cost_awareness",
                        "next_scenario": "3"
                    },
                    {
                        "id": "D",
                        "text": "Remove account-status validation completely.",
                        "score": -5,
                        "consequence": "You bypassed a required security/business check. The application works but the feature is broken.",
                        "dimension": "decision_quality",
                        "next_scenario": "3"
                    }
                ]
            },
            {
                "scenario_id": "3",
                "situation": "You have identified that older records do not contain the new account-status value. The client demo is tomorrow, so you need a safe solution that fixes the affected accounts without introducing another problem.",
                "question": "What would you do?",
                "choices": [
                    {
                        "id": "A",
                        "text": "Write a controlled update for the affected records and test it before applying it.",
                        "score": 10,
                        "consequence": "Good decision. A controlled update allows the team to correct existing data while minimizing the risk of changing unrelated records.",
                        "dimension": "decision_quality",
                        "next_scenario": "4"
                    },
                    {
                        "id": "B",
                        "text": "Manually change random users until login starts working.",
                        "score": -5,
                        "consequence": "This is reckless and unscalable. You might accidentally corrupt other data.",
                        "dimension": "risk_awareness",
                        "next_scenario": "4"
                    },
                    {
                        "id": "C",
                        "text": "Remove the new account-status feature.",
                        "score": -5,
                        "consequence": "You rolled back a planned feature right before the demo, angering the product manager.",
                        "dimension": "decision_quality",
                        "next_scenario": "4"
                    },
                    {
                        "id": "D",
                        "text": "Change the database structure immediately without testing.",
                        "score": -5,
                        "consequence": "A syntax error in your query causes a database crash. The team has to restore from a backup.",
                        "dimension": "risk_awareness",
                        "next_scenario": "4"
                    }
                ]
            },
            {
                "scenario_id": "4",
                "situation": "The affected records have been updated in a test environment. Login now works for the previously affected users. Before deploying the fix, what should you do?",
                "question": "What should you do?",
                "choices": [
                    {
                        "id": "A",
                        "text": "Test both existing and newly created accounts, including valid and invalid login cases.",
                        "score": 10,
                        "consequence": "Excellent. Testing different account states helps ensure the fix resolves the original problem without breaking normal authentication behaviour.",
                        "dimension": "technical_reasoning",
                        "next_scenario": "5"
                    },
                    {
                        "id": "B",
                        "text": "Deploy immediately because the original problem appears fixed.",
                        "score": -5,
                        "consequence": "You missed a side-effect. New accounts now fail to register. You have to hotfix it again.",
                        "dimension": "risk_awareness",
                        "next_scenario": "5"
                    },
                    {
                        "id": "C",
                        "text": "Test only the account that originally failed.",
                        "score": 5,
                        "consequence": "It works, but you should have regression tested other account types too. Luckily it didn't break anything else.",
                        "dimension": "technical_reasoning",
                        "next_scenario": "5"
                    },
                    {
                        "id": "D",
                        "text": "Skip testing because the client demo is tomorrow.",
                        "score": -5,
                        "consequence": "Very dangerous. If it fails during the demo, it will be catastrophic.",
                        "dimension": "decision_quality",
                        "next_scenario": "5"
                    }
                ]
            },
            {
                "scenario_id": "5",
                "situation": "The fix has been deployed successfully. Your mentor asks what should be done before considering the incident completely closed.",
                "question": "What would you do?",
                "choices": [
                    {
                        "id": "A",
                        "text": "Write a post-incident report documenting the root cause, fix, testing performed, and preventive action.",
                        "score": 10,
                        "consequence": "Excellent professional decision. Proper documentation gives the team a record of what happened and helps prevent similar issues in the future.",
                        "dimension": "communication",
                        "next_scenario": None
                    },
                    {
                        "id": "B",
                        "text": "Delete the logs to keep the server clean.",
                        "score": -5,
                        "consequence": "Deleting logs destroys valuable evidence and auditing history. Your mentor is concerned.",
                        "dimension": "risk_awareness",
                        "next_scenario": None
                    },
                    {
                        "id": "C",
                        "text": "Ignore the incident because the application is working now.",
                        "score": 5,
                        "consequence": "It's acceptable, but a missed learning opportunity. Documenting it would have been better.",
                        "dimension": "professionalism",
                        "next_scenario": None
                    },
                    {
                        "id": "D",
                        "text": "Tell the client that another team caused the issue without confirming it.",
                        "score": -5,
                        "consequence": "Unprofessional and harmful to team trust. Blaming others without evidence creates a toxic environment.",
                        "dimension": "professionalism",
                        "next_scenario": None
                    }
                ]
            }
        ]

        if not existing_task:
            new_task = models.Task(
                domain_id=domain.id,
                day_number=1,
                title="Authentication Bug Before a Client Demo",
                description="Real-World Workplace Simulation",
                difficulty="medium",
                task_type="simulation",
                mcq_questions=json.dumps(scenarios),
                is_active=True
            )
            db.add(new_task)
            db.commit()
            print("Successfully seeded simulation task for Backend Day 1.")
        else:
            existing_task.title = "Authentication Bug Before a Client Demo"
            existing_task.mcq_questions = json.dumps(scenarios)
            db.commit()
            print("Successfully updated simulation task for Backend Day 1.")

    except Exception as e:
        print(f"Error seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_simulation()
