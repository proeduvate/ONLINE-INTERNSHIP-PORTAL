from sqlalchemy.orm import Session
try:
    from app.db import session as database, models, app
except ImportError:
    from . from app.db import session as database, models, app
import json
from datetime import datetime, timedelta

def seed():
    print("Seeding database...")
    
    db = next(database.get_db())
    print("Seeding database...")
    
    # Create Domains
    dom_react = models.Domain(name="Frontend", description="Learn components, state, context, and React Router.")
    dom_fastapi = models.Domain(name="Backend", description="Build asynchronous RESTful APIs, schemas, and database connectivity.")
    db.add(dom_react)
    db.add(dom_fastapi)
    db.commit()
    db.refresh(dom_react)
    db.refresh(dom_fastapi)
    
    # Create Admin
    admin = models.User(
        name="System Admin",
        email="admin@gmail.com",
        hashed_password=app.pwd_context.hash("admin123"),
        role=models.UserRole.ADMIN,
        attendance_pct=100
    )
    db.add(admin)
    
    # Create Mentor
    mentor = models.User(
        name="Sarah Connor (Senior Lead)",
        email="mentor@gmail.com",
        hashed_password=app.pwd_context.hash("mentor123"),
        role=models.UserRole.MENTOR,
        attendance_pct=100
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    
    # Create Intern
    intern = models.User(
        name="John Doe",
        email="intern@gmail.com",
        hashed_password=app.pwd_context.hash("intern123"),
        role=models.UserRole.INTERN,
        intern_id="INT-2026-0101",
        college="MIT University",
        domain_id=dom_react.id,
        mentor_id=mentor.id,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),
        attendance_pct=100,
        progress_pct=0
    )
    db.add(intern)
    db.commit()
    
    # Create Tasks (Curriculum Days 1 to 5) for React Frontend Development
    # Day 1
    t1 = models.Task(
        domain_id=dom_react.id,
        day_number=1,
        title="Introduction to React & JSX",
        description="Learn the fundamentals of React and how JSX translates into virtual DOM nodes. Set up your first development workspace.",
        video_url="https://www.youtube.com/embed/SqcY0GlETPk",
        document_url="https://react.dev/learn",
        notes="React is a Javascript library created by Facebook for building user interfaces. It uses a virtual DOM for selective rendering updates.",
        resources="React Docs: react.dev, Create React App starter bundle, Webpack boilerplate",
        mcq_questions=json.dumps([
            {"id": 1, "question": "What is React?", "options": ["A JavaScript Library for building UIs", "A CSS Framework", "A Programming Language", "A Database engine"], "correct_option": "A JavaScript Library for building UIs"},
            {"id": 2, "question": "Who created React?", "options": ["Google", "Facebook / Meta", "Microsoft", "Twitter"], "correct_option": "Facebook / Meta"}
        ]),
        coding_prompt="# Task: Return a greeting string.\n# Write a function greeting(name) that returns 'Hello, {name}!'\n\ndef greeting(name):\n    # Write your code here\n    pass",
        coding_solution="def greeting(name):\n    return f'Hello, {name}!'",
        test_cases=json.dumps([
            {"input": "John", "expected": "Hello, John!"},
            {"input": "Alice", "expected": "Hello, Alice!"}
        ]),
        deadline_days=1
    )
    
    # Day 2
    t2 = models.Task(
        domain_id=dom_react.id,
        day_number=2,
        title="React State Management (useState)",
        description="Understand how components maintain local state using the useState React hook. Implement reactive elements that update automatically.",
        video_url="https://www.youtube.com/embed/O6P86uwfdz0",
        document_url="https://react.dev/reference/react/useState",
        notes="Hooks allow functional components to hook into React state and lifecycle. useState takes default value and returns state variable and updating function.",
        resources="State management articles, Hook rules documentation",
        mcq_questions=json.dumps([
            {"id": 1, "question": "Which hook is used to maintain local component state?", "options": ["useEffect", "useContext", "useState", "useRef"], "correct_option": "useState"},
            {"id": 2, "question": "What is the correct syntax to initialize state with 0?", "options": ["const [count, setCount] = useState(0)", "const count = useState(0)", "const [count, update] = state(0)", "let count = 0"], "correct_option": "const [count, setCount] = useState(0)"}
        ]),
        coding_prompt="# Task: Counter Incrementer.\n# Write a function increment(value) that returns the value + 1.\n\ndef increment(value):\n    # Write code here\n    pass",
        coding_solution="def increment(value):\n    return value + 1",
        test_cases=json.dumps([
            {"input": "5", "expected": "6"},
            {"input": "0", "expected": "1"}
        ]),
        deadline_days=1
    )
    
    # Day 3
    t3 = models.Task(
        domain_id=dom_react.id,
        day_number=3,
        title="Props and Child Components",
        description="Learn how to pass configuration variables from parent to child components using read-only properties called 'props'.",
        video_url="https://www.youtube.com/embed/5yEgUz64Qrc",
        document_url="https://react.dev/learn/passing-props-to-a-component",
        notes="Props are immutable. They act as parameters passed into the component function.",
        resources="Props validation documentation, Component design patterns",
        mcq_questions=json.dumps([
            {"id": 1, "question": "Are props inside a React component mutable?", "options": ["Yes, they can be altered directly", "No, they are read-only", "Yes, but only in class components", "None of the above"], "correct_option": "No, they are read-only"}
        ]),
        coding_prompt="# Task: Render Prop Card string.\n# Write a function make_card(title, desc) that returns '<div class=\"card\"><h4>{title}</h4><p>{desc}</p></div>'\n\ndef make_card(title, desc):\n    # Write code here\n    pass",
        coding_solution="def make_card(title, desc):\n    return f'<div class=\"card\"><h4>{title}</h4><p>{desc}</p></div>'",
        test_cases=json.dumps([
            {"input": "Info, Text", "expected": "Info"},
            {"input": "Alert, Help", "expected": "Alert"}
        ]),
        deadline_days=1
    )
    
    # Day 4
    t4 = models.Task(
        domain_id=dom_react.id,
        day_number=4,
        title="Side Effects with useEffect Hook",
        description="Learn how to synchronise your UI with external systems or perform async network fetches using the useEffect lifecycle hook.",
        video_url="https://www.youtube.com/embed/0ZJgIjIuY7U",
        document_url="https://react.dev/reference/react/useEffect",
        notes="useEffect accepts dependency arrays. Leaving it empty triggers execution strictly once on component mount.",
        resources="Async API fetching examples, Clean-up function guidelines",
        mcq_questions=json.dumps([
            {"id": 1, "question": "When does useEffect run if the dependency array is empty []?", "options": ["On every render", "Only once when component mounts", "Only when state updates", "Never"], "correct_option": "Only once when component mounts"}
        ]),
        coding_prompt="# Task: Check dependency updates.\n# Write a function should_fetch(prev, curr) that returns True if prev != curr, else False.\n\ndef should_fetch(prev, curr):\n    # Write code here\n    pass",
        coding_solution="def should_fetch(prev, curr):\n    return prev != curr",
        test_cases=json.dumps([
            {"input": "1, 2", "expected": "True"},
            {"input": "5, 5", "expected": "False"}
        ]),
        deadline_days=1
    )
    
    # Day 5
    t5 = models.Task(
        domain_id=dom_react.id,
        day_number=5,
        title="Capstone - React To-Do Application",
        description="Build a comprehensive To-Do app using functional components, form control, list rendering, hooks, and local storage caching.",
        video_url="https://www.youtube.com/embed/hQAHJS17Gz0",
        document_url="https://react.dev/learn/thinking-in-react",
        notes="Combine state, lifting state up, child props, and styling arrays to create a fully operational interactive portal list.",
        resources="Storage mechanisms guide, DOM events reference",
        mcq_questions=json.dumps([
            {"id": 1, "question": "What function is used to convert JS arrays to local storage strings?", "options": ["JSON.stringify", "JSON.parse", "toString", "serialize"], "correct_option": "JSON.stringify"}
        ]),
        coding_prompt="# Task: Filter completed items.\n# Write a function filter_completed(todo_list) that accepts a list of dicts with 'text' and 'completed' keys, and returns a list of only completed items.\n\ndef filter_completed(todo_list):\n    # Write code here\n    pass",
        coding_solution="def filter_completed(todo_list):\n    return [item for item in todo_list if item.get('completed') == True]",
        test_cases=json.dumps([
            {"input": "[{'text': 'Task1', 'completed': True}, {'text': 'Task2', 'completed': False}]", "expected": "Task1"}
        ]),
        deadline_days=2
    )
    
    db.add(t1)
    db.add(t2)
    db.add(t3)
    db.add(t4)
    db.add(t5)
    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed()
