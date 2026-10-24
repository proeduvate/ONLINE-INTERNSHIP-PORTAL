import json
import os
import sys

# Append the project root to sys.path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models import DomainCodeAssessment

data = """
Day 1 — Introduction to UI/UX Design
1.Analyze the UI and UX of a popular mobile application and identify 5 strengths and 5 weaknesses. 
2.Redesign a basic login screen using fundamental UI principles. 
3.Compare the UI/UX of two competing applications and document the differences. 
4.Identify 10 usability problems in a poorly designed website. 
5.Design a simple 3-screen application applying visual hierarchy and consistency. 

Day 2 — Design Thinking & Problem Solving
1.Identify a real-world problem faced by students and create a problem statement. 
2.Create 5 "How Might We?" questions for the identified problem. 
3.Generate at least 10 possible design solutions using brainstorming. 
4.Prioritize the proposed solutions using an impact-vs-effort matrix. 
5.Create a solution concept for the highest-priority problem. 

Day 3 — User Research & User Personas
1.Identify the target users for an online learning platform. 
2.Create a primary user persona for a college student. 
3.Create a secondary user persona for a mentor. 
4.Identify the goals, frustrations, needs and motivations of the users. 
5.Create two detailed user personas for a food-delivery application. 

Day 4 — User Interviews, Surveys & Research Analysis
1.Create 10 user interview questions for an online learning application. 
2.Design a 10-question user survey for a food-delivery application. 
3.Analyze a sample set of user responses and identify common problems. 
4.Group user feedback into at least 5 meaningful themes. 
5.Create a research-insight report based on the collected responses. 

Day 5 — User Journey Maps & Empathy Maps
1.Create an empathy map for an online shopping user. 
2.Create a user journey map for ordering food online. 
3.Identify user pain points at each stage of the journey. 
4.Identify opportunities for improving the user experience. 
5.Create an improved journey map based on the identified problems. 

Day 6 — Information Architecture
1.Create the sitemap for an e-commerce website. 
2.Organize the content structure of an online learning platform. 
3.Categorize products for an online shopping application. 
4.Design a navigation hierarchy for a university website. 
5.Redesign the information architecture of a website with confusing navigation. 

Day 7 — User Flows & Task Flows
1.Create a user flow for registering a new account. 
2.Design a complete checkout flow for an e-commerce application. 
3.Create a password-reset flow. 
4.Design a food-ordering task flow. 
5.Create a complete flow from login → product selection → payment → confirmation. 

Day 8 — UX Wireframing Fundamentals
1.Create a wireframe for a login screen. 
2.Create a wireframe for a registration screen. 
3.Design a dashboard wireframe. 
4.Create a profile-page wireframe. 
5.Create a product-details-page wireframe. 

Day 9 — Low-Fidelity Wireframes
1.Design a low-fidelity mobile banking application. 
2.Create low-fidelity wireframes for a food-delivery application. 
3.Design a 5-screen low-fidelity shopping flow. 
4.Create a low-fidelity learning-management dashboard. 
5.Design a low-fidelity social-media application flow. 

Day 10 — High-Fidelity Wireframes
1.Convert a login wireframe into a high-fidelity design. 
2.Convert an e-commerce wireframe into a high-fidelity UI. 
3.Create a high-fidelity admin dashboard. 
4.Design a high-fidelity profile page. 
5.Create a complete 5-screen high-fidelity application. 

Day 11 — UI Design Fundamentals
1.Design a modern login screen using proper visual hierarchy. 
2.Design a registration screen with clear form structure. 
3.Create a dashboard using alignment, contrast and hierarchy. 
4.Redesign an outdated application interface. 
5.Create a consistent UI for a 3-screen application. 

Day 12 — Layout, Grid & Spacing Systems
1.Create a 12-column grid for a desktop website. 
2.Create an 8-point spacing system for a mobile application. 
3.Redesign a webpage using consistent spacing and alignment. 
4.Create a responsive card layout using a grid system. 
5.Design an analytics dashboard using grid and spacing principles. 

Day 13 — Typography & Font Systems
1.Create a typography hierarchy for a website. 
2.Design heading, subtitle, body and caption styles. 
3.Compare two font combinations and select the more appropriate combination. 
4.Redesign a poorly formatted webpage using typography principles. 
5.Create a complete typography system for a mobile application. 

Day 14 — Color Theory & Color Systems
1.Create a primary and secondary color palette for a mobile application. 
2.Design both light and dark themes for the same interface. 
3.Create semantic colors for success, warning, error and information states. 
4.Redesign a website using an appropriate color system. 
5.Create a complete UI color system with usage guidelines. 

Day 15 — Icons, Images & Visual Elements
1.Design a consistent icon set for an admin dashboard. 
2.Create navigation icons for a mobile application. 
3.Design product cards using images and visual hierarchy. 
4.Create an avatar/profile component with different states. 
5.Create a visual asset library for a mobile application. 

Day 16 — Components & UI Patterns
1.Design a reusable button component with different states. 
2.Create input-field components for default, focus, error and disabled states. 
3.Design reusable card components. 
4.Create dropdown, checkbox and radio-button components. 
5.Build a reusable component library for a dashboard. 

Day 17 — Design Systems & Style Guides
1.Create a basic design system for a web application. 
2.Define typography, color and spacing tokens. 
3.Create buttons with default, hover, active and disabled states. 
4.Create form components with validation states. 
5.Prepare a UI style guide for a complete application. 

Day 18 — Responsive & Adaptive UI Design
1.Convert a desktop webpage into a mobile layout. 
2.Design desktop, tablet and mobile versions of the same screen. 
3.Create responsive navigation for a website. 
4.Design responsive cards and grids. 
5.Create a responsive dashboard for desktop, tablet and mobile. 

Day 19 — Mobile App UI/UX Design
1.Design a mobile login and registration flow. 
2.Design a mobile application home screen. 
3.Create bottom navigation for a mobile application. 
4.Design a mobile checkout flow. 
5.Create a complete 5-screen mobile application interface. 

Day 20 — Web UI/UX Design
1.Design a modern landing page. 
2.Design an e-commerce homepage. 
3.Create an admin dashboard. 
4.Design a SaaS application interface. 
5.Create a responsive multi-page website design. 

Day 21 — Interactive Prototyping
1.Create a clickable login prototype. 
2.Prototype a registration flow. 
3.Create an interactive e-commerce checkout. 
4.Connect multiple screens using interactive navigation. 
5.Build a complete clickable prototype for a mobile application. 

Day 22 — Microinteractions & UI Animations
1.Design a button hover and pressed interaction. 
2.Create a loading animation concept. 
3.Design success and error-state animations. 
4.Create an animated navigation/menu interaction. 
5.Add meaningful microinteractions to a complete application prototype. 

Day 23 — Usability Testing
1.Create a usability-testing plan for an e-commerce application. 
2.Prepare 5 usability-testing tasks for your prototype. 
3.Conduct a usability test with sample users. 
4.Categorize the problems discovered during testing. 
5.Redesign the affected screens based on the testing results. 

Day 24 — UX Evaluation & Heuristic Analysis
1.Perform a heuristic evaluation of a website. 
2.Identify usability problems in a mobile application. 
3.Analyze navigation and discoverability problems. 
4.Identify consistency, feedback and error-prevention issues. 
5.Create a UX audit report with recommended improvements. 

Day 25 — Accessibility & Inclusive Design
1.Audit a UI for color-contrast issues. 
2.Redesign a screen with improved accessibility. 
3.Create accessible form components. 
4.Design an interface that accommodates users with different abilities. 
5.Perform an accessibility audit of a complete application. 

Day 26 — UX Writing & Content Design
1.Write clear microcopy for a login screen. 
2.Create effective error messages for form validation. 
3.Write onboarding content for a mobile application. 
4.Design useful empty-state messages. 
5.Rewrite confusing UI text to make it clearer and more user-friendly.  

Day 27 — Figma Advanced Features & Collaboration
1.Create reusable components and variants in Figma. 
2.Create interactive components. 
3.Build a responsive interface using Auto Layout. 
4.Create variables for colors, typography and spacing. 
5.Build a reusable Figma design system for a small application. 

Day 28 — Dashboard & Data Visualization Design
1.Design an admin dashboard containing KPI cards and key metrics. 
2.Create a student performance dashboard with charts and tables. 
3.Design filters and sorting controls for an analytics dashboard. 
4.Create a data visualization screen that presents complex information clearly. 
5.Redesign a cluttered dashboard using hierarchy, grouping and visual prioritization. 

Day 29 — Design Trends & Modern UI Patterns
1.Redesign a website using a modern minimalist design approach. 
2.Create a modern dark-mode interface. 
3.Design a glassmorphism-based dashboard while maintaining usability. 
4.Redesign a mobile application using modern navigation patterns. 
5.Compare two modern UI trends and create a screen demonstrating the better approach. 

Day 30 — UX Strategy & Product Design Thinking
1.Define the user goals and business goals for a new application. 
2.Identify and prioritize the core features required for an MVP. 
3.Create a UX strategy for a student-learning application. 
4.Define UX metrics that can be used to measure product success. 
5.Create a complete product-design plan covering problem → users → features → user flow → UX strategy → UI direction.
"""

def parse_and_insert(db, text_data):
    lines = text_data.strip().split('\n')
    current_day = 0
    current_topic = ""
    domain = "UI/UX"
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("Day "):
            # Example: "Day 1 — Introduction to UI/UX Design"
            parts = line.split("—")
            if len(parts) > 1:
                day_str = parts[0].replace("Day", "").strip()
                current_day = int(day_str)
                current_topic = parts[1].strip()
        elif line[0].isdigit() and "." in line:
            # Example: "1.Analyze the UI and UX..."
            q_num_str, q_text = line.split(".", 1)
            q_num = int(q_num_str.strip())
            q_text = q_text.strip()
            
            question_id = f"UIUX-D{current_day}-Q{q_num:03d}"
            
            title = q_text
            if len(title) > 50:
                title = title[:47] + "..."
            
            # Check if it already exists
            existing = db.query(DomainCodeAssessment).filter_by(question_id=question_id).first()
            if not existing:
                assessment = DomainCodeAssessment(
                    domain_name=domain,
                    day_number=current_day,
                    question_id=question_id,
                    topic=current_topic,
                    title=title,
                    description=q_text,
                    requirements="[]"
                )
                db.add(assessment)
                
    db.commit()
    print("UI/UX Domain Code Assessments seeded successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        parse_and_insert(db, data)
    finally:
        db.close()
