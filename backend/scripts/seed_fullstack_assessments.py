import sys
import os
import json
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import DomainCodeAssessment

data = """
Day 1 — HTML Fundamentals & Web Structure
1.Create a personal profile webpage using HTML.
2.Create a student registration webpage containing name, email, phone and department.
3.Build a webpage containing headings, paragraphs, links, images and lists.
4.Create a college homepage using different HTML sections.
5.Build an internship information webpage with multiple sections.

Day 2 — Semantic HTML5 & Forms
1.Create a webpage using header, nav, main, section, article and footer.
2.Build a student registration form using HTML5 input types.
3.Create an internship application form with appropriate validation attributes.
4.Build a contact form containing text, email, phone, dropdown and textarea fields.
5.Create an employee registration form using semantic HTML.

Day 3 — CSS Fundamentals & Selectors
1.Style a basic HTML webpage using external CSS.
2.Create different styles using element, class and ID selectors.
3.Design a student profile card.
4.Create a navigation bar using CSS.
5.Redesign a plain HTML page using CSS selectors and visual styling.

Day 4 — CSS Box Model, Typography & Colors
1.Create a profile card using margin, padding and borders.
2.Design a pricing card using typography and colors.
3.Create a styled registration form.
4.Build notification components for success, warning and error states.
5.Design a professional student dashboard using the CSS box model.

Day 5 — Flexbox & Layout
1.Create a navigation bar using Flexbox.
2.Create a three-card layout using Flexbox.
3.Build a centered login form using Flexbox.
4.Create a responsive header using Flexbox.
5.Design a dashboard layout using Flexbox.

Day 6 — CSS Grid & Responsive Design
1.Create a photo gallery using CSS Grid.
2.Build a responsive product-card grid.
3.Create a dashboard using CSS Grid.
4.Design a webpage that adapts to mobile, tablet and desktop.
5.Create a responsive e-commerce homepage.

Day 7 — CSS Transitions, Transforms & Animations
1.Create a button with hover and transition effects.
2.Create an animated card interaction.
3.Build a loading animation using CSS.
4.Create a navigation menu with animated transitions.
5.Build an animated landing page using CSS transforms and keyframes.

Day 8 — JavaScript Fundamentals & Variables
1.Create a JavaScript program to calculate student marks.
2.Build a basic calculator.
3.Create a temperature converter.
4.Create a program to calculate employee salary.
5.Build a student information processor using JavaScript.

Day 9 — Operators, Conditions & Loops
1.Create a program to determine whether a number is even or odd.
2.Build a grading system based on student marks.
3.Find the largest of three numbers.
4.Print all prime numbers within a given range.
5.Create an internship eligibility checker.

Day 10 — Functions, Scope & Closures
1.Create reusable calculator functions.
2.Create a function to calculate student percentage and grade.
3.Create a function to determine whether a number is prime.
4.Build a function that generates personalized greetings.
5.Create a closure-based counter application.

Day 11 — Arrays, Objects & Modern JavaScript
1.Find the largest and smallest number in an array.
2.Remove duplicate values from an array.
3.Create an array of student objects and display their information.
4.Filter students based on marks.
5.Build a student data-processing application using map(), filter() and reduce().

Day 12 — DOM Manipulation & Events
1.Create a button that dynamically changes page content.
2.Build a counter application.
3.Create a dynamic to-do list.
4.Build a show/hide password functionality.
5.Create a dynamic student table using JavaScript.

Day 13 — Forms & Client-Side Validation
1.Create a registration form with validation.
2.Validate email and phone number fields.
3.Build a password-strength checker.
4.Create a login form with validation messages.
5.Build an internship application form with complete client-side validation.

Day 14 — JSON, Local Storage & Session Storage
1.Store user information in Local Storage.
2.Create a to-do application using Local Storage.
3.Save and retrieve student records as JSON.
4.Build a shopping cart using Local Storage.
5.Create a login session using Session Storage.

Day 15 — Asynchronous JavaScript, Promises & Fetch API
1.Create a program using a JavaScript Promise.
2.Fetch and display data from a REST API.
3.Build a weather-data display application using an API.
4.Create a user directory using API data.
5.Build a search application that fetches results asynchronously.

Day 16 — React Fundamentals & Components
1.Create a React application with reusable components.
2.Build a React profile card.
3.Create a React navigation bar.
4.Build a reusable product-card component.
5.Create a React dashboard using multiple components.

Day 17 — JSX, Props & Component Composition
1.Create a reusable student component using props.
2.Build a product list using reusable components.
3.Create a profile component that accepts dynamic props.
4.Build reusable cards for an analytics dashboard.
5.Create a multi-component React page using component composition.

Day 18 — React State, Events & Conditional Rendering
1.Create a React counter using state.
2.Build a toggle button using state.
3.Create a dynamic login/logout interface.
4.Build a shopping-cart quantity controller.
5.Create a student attendance interface using state and conditional rendering.

Day 19 — React Hooks
1.Create a counter using useState.
2.Create a component that loads data using useEffect.
3.Build a search filter using React state.
4.Create a reusable custom hook.
5.Build a form-state management component using React hooks.

Day 20 — React Forms, API Integration & Routing
1.Create a React registration form.
2.Build a React login page with validation.
3.Fetch API data and display it in a React component.
4.Create multiple pages using React Router.
5.Build a React application containing Home, Login, Dashboard and Profile pages.

Day 21 — Node.js Fundamentals & NPM
1.Create a basic Node.js application.
2.Build a Node.js program that reads and writes files.
3.Create a simple command-line application using Node.js.
4.Create an NPM project and install external dependencies.
5.Build a Node.js application that processes JSON data.

Day 22 — Express.js & REST API Development
1.Create a basic Express.js server.
2.Create GET and POST endpoints.
3.Build a REST API for student records.
4.Create CRUD endpoints for products.
5.Build an Express API for an employee management system.

Day 23 — Middleware, Routing & Error Handling
1.Create custom Express middleware.
2.Build separate route modules for students and courses.
3.Create request-logging middleware.
4.Implement centralized error handling.
5.Build a structured REST API using routes, controllers and middleware.

Day 24 — MongoDB & Database Operations
1.Create a MongoDB database for student records.
2.Insert and retrieve student documents.
3.Update and delete records.
4.Create queries to filter students based on marks.
5.Build a MongoDB CRUD application for products.

Day 25 — MongoDB with Node.js & Data Modeling
1.Connect an Express application to MongoDB.
2.Create a student data model.
3.Build CRUD APIs using MongoDB.
4.Create relationships between users and courses.
5.Build an employee management API using database models.

Day 26 — Authentication & Authorization
1.Create a user registration API.
2.Build a login API.
3.Implement password hashing.
4.Create JWT-based authentication.
5.Build role-based access for Admin, Mentor and Student users.

Day 27 — Full Stack Integration
1.Connect a React registration form to an Express API.
2.Build a React login system connected to the backend.
3.Fetch MongoDB data through an Express API and display it in React.
4.Create a full-stack CRUD application.
5.Build a student management application using React, Node.js, Express and MongoDB.

Day 28 — Security, Validation & Performance
1.Add server-side validation to a registration API.
2.Implement input sanitization.
3.Protect API routes using authentication middleware.
4.Add pagination and filtering to a REST API.
5.Identify and fix common security and performance problems in a full-stack application.

Day 29 — Testing, Debugging & Deployment
1.Debug a React application containing functional and UI issues.
2.Create backend API test cases.
3.Test CRUD endpoints using an API testing tool.
4.Identify and fix frontend-backend integration errors.
5.Prepare a full-stack application for production deployment.

Day 30 — Web Application Architecture & Best Practices
1.Design a scalable folder structure for a React + Node.js + Express application.
2.Create a REST API following proper separation of routes, controllers, services and database logic.
3.Refactor a React application to use reusable components and avoid duplicated code.
4.Configure a full-stack application using environment variables for API URLs, database credentials and authentication secrets.
5.Analyze an existing full-stack application and identify at least 10 improvements related to code organization, scalability, maintainability, security and performance.
"""

def main():
    db = SessionLocal()
    domain_name = "Full Stack"
    
    try:
        lines = [line.strip() for line in data.split('\n') if line.strip()]
        
        current_day = 0
        current_topic = ""
        question_idx = 1
        
        assessments_to_add = []
        
        for line in lines:
            if line.startswith("Day"):
                parts = line.split("—")
                day_part = parts[0].strip()
                current_day = int(day_part.replace("Day", "").strip())
                current_topic = parts[1].strip() if len(parts) > 1 else ""
                question_idx = 1
            else:
                # It's a question line
                # e.g., "1.Create a personal profile webpage using HTML."
                if '.' in line:
                    title = line.split('.', 1)[1].strip()
                else:
                    title = line
                    
                question_id = f"CODE-FS-D{current_day}-Q{question_idx:03d}"
                
                # Check if it already exists to avoid duplicates
                existing = db.query(DomainCodeAssessment).filter(
                    DomainCodeAssessment.question_id == question_id
                ).first()
                
                if not existing:
                    assessment = DomainCodeAssessment(
                        domain_name=domain_name,
                        day_number=current_day,
                        question_id=question_id,
                        topic=current_topic,
                        title=title,
                        description=f"Implement the following task: {title}",
                        requirements=json.dumps(["Ensure the code runs without errors.", "Follow best practices."])
                    )
                    assessments_to_add.append(assessment)
                
                question_idx += 1
                
        if assessments_to_add:
            db.add_all(assessments_to_add)
            db.commit()
            print(f"Successfully added {len(assessments_to_add)} assessments to {domain_name} domain.")
        else:
            print("No new assessments to add (they might already exist).")
            
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
