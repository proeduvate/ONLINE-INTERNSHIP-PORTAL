import sys
import json
from app.db.session import SessionLocal
from app import models

def main():
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.email=='p.sushmitha141@gmail.com').first()
    if not user:
        print("User not found")
        return
        
    tasks = db.query(models.Task).filter(
        models.Task.domain_id == user.domain_id,
        models.Task.day_number <= 5,
        models.Task.task_type == 'simulation' # Wait, earlier I verified all her tasks are 'simulation' type!
    ).all()
    
    mcqs = [
        {'id': 'q1', 'text': 'What is the primary role of a backend developer?', 'options': [{'val': 'a', 'label': 'Creating UI'}, {'val': 'b', 'label': 'Managing servers and databases'}, {'val': 'c', 'label': 'Designing logos'}], 'correct': 'b'},
        {'id': 'q2', 'text': 'Which of the following is a backend language?', 'options': [{'val': 'a', 'label': 'HTML'}, {'val': 'b', 'label': 'CSS'}, {'val': 'c', 'label': 'Python'}], 'correct': 'c'},
        {'id': 'q3', 'text': 'What does API stand for?', 'options': [{'val': 'a', 'label': 'Application Programming Interface'}, {'val': 'b', 'label': 'Advanced Programming Integration'}, {'val': 'c', 'label': 'Automated Processing Interface'}], 'correct': 'a'}
    ]
    coding = 'Write a function in Python that takes a list of integers and returns the sum of all even numbers. For example, sum_even([1, 2, 3, 4]) should return 6.'
    
    for t in tasks:
        t.mcq_questions = json.dumps(mcqs)
        t.coding_prompt = coding
        
    db.commit()
    print(f"Updated {len(tasks)} tasks for Day 1 to 5")

if __name__ == '__main__':
    main()
