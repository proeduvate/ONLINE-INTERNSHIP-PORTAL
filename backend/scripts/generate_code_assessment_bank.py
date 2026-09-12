import os
import json
import re

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "code_assessment_bank")
os.makedirs(OUTPUT_DIR, exist_ok=True)

data_text = """
Day 1 — HTML Fundamentals & Document Structure
1. Personal Profile Page
Create an HTML page containing your name, profile photo, short bio, skills, and contact information.
Requirements: Use proper html, head, body, headings, paragraphs and image elements.
2. Student Resume
Create a one-page resume using only HTML.
Include: Name, Career objective, Education, Skills, Projects, Contact details 
3. My Portfolio Structure
Create the basic HTML structure for a portfolio website with: Header, About, Skills, Projects, Contact, Footer 
4. Product Information Page
Create a product page containing: Product name, Image, Description, Price, Features, Availability 
5. Complete Webpage Challenge
Build a complete static webpage for a fictional company using proper HTML document structure.
AI evaluation: semantic structure, nesting, attributes, completeness and HTML validity.

Day 2 — Semantic HTML5
1. Semantic Portfolio
Convert a basic portfolio into a semantic HTML5 structure using: header, nav, main, section, article, aside, footer.
2. News Article
Create a news article webpage containing: Header, Navigation, Article, Author information, Related articles, Footer 
3. Blog Layout
Build a blog page containing at least three <article> elements and a sidebar.
4. Company Website Structure
Create a company homepage using semantic HTML5 elements instead of generic <div> elements wherever appropriate.
5. Semantic Refactoring
Given a poorly structured HTML page, rewrite it using appropriate semantic elements.

Day 3 — HTML Forms & Input Elements
1. Registration Form
Create a student registration form with: Name, Email, Password, Date of birth, Gender, Course, Submit button 
2. Job Application Form
Create a job application form containing: Personal information, Resume upload, Experience, Skills, Availability, Submit button 
3. Login Form
Create a login form with: Email, Password, Remember me, Login button, Forgot password link 
4. Internship Application Form
Create an internship application form with multiple input types including radio buttons, checkboxes, select boxes and textarea.
5. Multi-Section Form
Create a complete employee onboarding form divided into: Personal details, Education, Employment, Emergency contact, Declaration 

Day 4 — HTML Media, Links, Lists & Tables
1. Media Page
Create a webpage containing an image gallery, audio player and video player.
2. Navigation Website
Create a multi-section website with navigation links that jump to different sections of the same page.
3. Restaurant Menu
Create a restaurant menu using ordered and unordered lists.
4. Student Marks Table
Create a table displaying: Student name, Subject, Marks, Grade, Result 
Include table headings and appropriate row/column structure.
5. Product Comparison Table
Create a product comparison table for three products with pricing, features, ratings and availability.

Day 5 — CSS Fundamentals & Selectors
1. Style a Portfolio
Create CSS styles for the portfolio developed earlier.
2. Selector Challenge
Create a page containing headings, paragraphs, lists and buttons and style them using: Element selectors, Class selectors, ID selectors, Attribute selectors 
3. Navigation Styling
Create a horizontal navigation bar and style its normal, hover and active states.
4. Card Component
Create a reusable product card using CSS.
5. Landing Page
Create a complete landing page using CSS selectors and reusable classes.

Day 6 — CSS Box Model
1. Profile Card
Create a profile card demonstrating: Margin, Border, Padding, Content area 
2. Pricing Cards
Create three pricing cards using consistent spacing and borders.
3. Box Model Demonstration
Create four boxes with different margin, padding and border values and visually demonstrate the difference.
4. Login Container
Create a centered login container with controlled width, padding, border and margin.
5. Debug the Layout
Create a webpage where spacing causes layout problems and fix it using correct box-model properties.

Day 7 — CSS Typography, Colors & Backgrounds
1. Typography Showcase
Create a webpage demonstrating different: Font sizes, Font weights, Line heights, Letter spacing, Text alignment 
2. Theme Design
Create a light-themed website using a consistent color palette.
3. Dark Mode Design
Create a dark-themed webpage with appropriate text and background contrast.
4. Gradient Hero
Create a hero section using gradients and background images.
5. Brand Style Page
Design a complete brand page using custom typography, colors, gradients and backgrounds.

Day 8 — Flexbox
1. Navigation with Flexbox
Create a responsive navigation bar using Flexbox.
2. Three-Card Layout
Create three equal-width cards using Flexbox.
3. Centering Challenge
Create a login box perfectly centered horizontally and vertically using Flexbox.
4. Dashboard Layout
Create a dashboard header with logo, navigation and user profile using Flexbox.
5. Responsive Flex Layout
Build a layout that changes from horizontal cards to vertical cards on smaller screens.

Day 9 — CSS Grid
1. Image Gallery
Create a responsive image gallery using CSS Grid.
2. Dashboard Grid
Build a dashboard containing: Sidebar, Header, Statistics, Main content using Grid.
3. Magazine Layout
Create a magazine/news layout using Grid with different column sizes.
4. Grid Areas
Build a webpage using: grid-template-areas.
5. Responsive Grid
Create a product grid that automatically changes the number of columns according to screen width.

Day 10 — Responsive Web Design
1. Responsive Portfolio
Make a portfolio responsive for desktop, tablet and mobile.
2. Responsive Navigation
Create a navigation layout that changes appropriately on mobile.
3. Responsive Cards
Build a card grid that changes from 4 → 2 → 1 columns.
4. Responsive Hero
Create a hero section that adapts its typography and layout for mobile.
5. Mobile-First Website
Build a complete mobile-first landing page and progressively enhance it for larger screens.

Day 11 — CSS Positioning & Layout
1. Positioned Badge
Create a product card with an "SALE" badge positioned over the image.
2. Fixed Navbar
Create a navigation bar that remains visible while scrolling.
3. Sticky Sidebar
Create a webpage with a sidebar that becomes sticky while scrolling.
4. Tooltip
Create a tooltip using CSS positioning.
5. Layered Hero
Create a hero section containing overlapping elements using position and z-index.

Day 12 — CSS Transitions, Transforms & Animations
1. Hover Button
Create an animated button with hover transition effects.
2. Card Hover Effect
Create a card that scales and changes its shadow when hovered.
3. Rotating Element
Create an element that continuously rotates using CSS animation.
4. Loading Animation
Create a CSS loading spinner.
5. Animated Hero
Create an animated hero section containing at least three coordinated CSS animations.

Day 13 — JavaScript Fundamentals
1. Greeting Program
Write JavaScript that asks for the user's name and displays a personalized greeting.
2. Simple Calculator
Create a calculator supporting: Addition, Subtraction, Multiplication, Division 
3. Temperature Converter
Convert Celsius to Fahrenheit and Fahrenheit to Celsius.
4. Age Calculator
Take the user's birth year and calculate their approximate age.
5. Interactive Profile
Create a webpage where JavaScript dynamically displays user information entered through prompts or form inputs.

Day 14 — Conditions, Loops & Control Flow
1. Even/Odd Checker
Determine whether a given number is even or odd.
2. Grade Calculator
Accept marks and calculate: A, B, C, D, Fail based on defined ranges.
3. Number Pattern
Use loops to generate a triangle pattern of numbers or stars.
4. Multiplication Table
Generate the multiplication table of a number using a loop.
5. Student Result System
Process multiple students and determine: Total, Average, Grade, Pass/Fail 

Day 15 — Functions, Scope & Closures
1. Calculator Functions
Create separate functions for arithmetic operations.
2. Reusable Validation Function
Create functions to validate email, password and required fields.
3. Counter Closure
Create a counter function using a closure so the counter's value cannot be directly accessed from outside.
4. Discount Calculator
Create reusable functions for calculating product discounts and final prices.
5. Function Factory
Create a function that returns another function for generating personalized greetings.

Day 16 — Arrays, Objects & Modern JavaScript
1. Student Array
Create an array of student objects and display their names and marks.
2. Array Filtering
Filter products based on price and category.
3. Shopping Cart
Create an array-based shopping cart supporting: Add, Remove, Quantity update, Total calculation 
4. Object Transformation
Transform an array of employee objects into a list containing only names and departments using modern JavaScript.
5. Product Analytics
Given an array of products, calculate: Total inventory value, Most expensive product, Average price, Products below a given price 

Day 17 — DOM Manipulation
1. Dynamic Greeting
Create an input where entering a name dynamically updates a greeting.
2. Dynamic To-Do List
Build a to-do list where users can add and remove tasks.
3. Theme Switcher
Create a button that changes the page between light and dark themes.
4. Dynamic Product Cards
Generate product cards dynamically from JavaScript data.
5. DOM Dashboard
Create a dashboard where statistics are dynamically generated and updated using JavaScript.

Day 18 — Events & Event Handling
1. Click Counter
Create a button counter that increments whenever the button is clicked.
2. Interactive Calculator
Build a calculator using event listeners instead of inline JavaScript.
3. Keyboard Event Tracker
Display the last key pressed by the user.
4. Event Bubbling Demo
Create nested elements and demonstrate event bubbling.
5. Event Delegation
Build a dynamic list where one event listener handles clicks for all list items, including newly added items.

Day 19 — Forms & Client-Side Validation
1. Registration Validation
Validate: Name, Email, Password, Confirm password 
2. Login Validation
Prevent form submission when credentials fields are empty or invalid.
3. Password Strength Checker
Create a password strength indicator based on: Length, Uppercase, Lowercase, Number, Special character 
4. Dynamic Error Messages
Create reusable validation functions that display error messages beside invalid fields.
5. Complete Form Validator
Build a multi-field internship application form with real-time validation and final submission validation.

Day 20 — JSON, Local Storage & Session Storage
1. JSON Profile
Create a JavaScript object, convert it to JSON and display the resulting JSON.
2. Local Storage To-Do
Create a to-do list whose tasks remain after refreshing the browser.
3. Theme Persistence
Save the user's selected theme in Local Storage.
4. Session Login
Create a simulated login system using Session Storage.
5. Shopping Cart Persistence
Create a shopping cart that saves products to Local Storage and restores them when the page reloads.

Day 21 — Asynchronous JavaScript & Promises
1. Delayed Message
Use setTimeout() to display a message after a delay.
2. Promise Simulator
Create a Promise that resolves after 2 seconds and displays a success message.
3. Promise Chain
Create a three-step Promise chain representing: Login, Fetch profile, Load dashboard 
4. Async/Await
Rewrite a Promise-based operation using async/await.
5. Async Error Handling
Create an asynchronous function that can succeed or fail and handle both cases using try/catch.

Day 22 — REST APIs & Fetch
1. Fetch Users
Fetch users from a public API and display them in cards.
2. Search Users
Create a search field that filters fetched users.
3. API Loading State
Display: Loading, Success, Error states while fetching data.
4. Product API
Fetch products from an API and display: Image, Name, Price, Category 
5. API Dashboard
Build a dashboard that fetches remote data and displays multiple statistics dynamically.

Day 23 — React Fundamentals & Components
1. React Profile Card
Create a reusable ProfileCard component.
2. Product Component
Create reusable product cards from an array of product data.
3. Component-Based Portfolio
Build a portfolio using: Header, About, Skills, Projects, Contact components.
4. Component Tree
Create a dashboard with multiple nested React components.
5. React Product Listing
Build a complete product listing page using reusable components and mapped data.

Day 24 — JSX, Props & Component Composition
1. Props Profile
Create a profile component receiving user information through props.
2. Product Props
Create a reusable product card accepting: Name, Image, Price, Rating through props.
3. Reusable Button
Create a Button component with configurable: Text, Type, Size, Disabled state 
4. Component Composition
Create a reusable Card component that accepts children.
5. Dashboard Composition
Build a dashboard by composing reusable components rather than creating one large component.

Day 25 — React State & Event Handling
1. Counter
Create a React counter with increment, decrement and reset.
2. Toggle
Create a component that toggles between two states.
3. Shopping Cart
Build a cart where users can add and remove products.
4. Interactive Form
Create a form whose input values are controlled using React state.
5. Task Manager
Build a task manager supporting: Add, Complete, Delete, Filter tasks 

Day 26 — React Hooks
1. useState Counter
Create a counter using useState.
2. useEffect Timer
Create a timer using useEffect and properly clean up the interval.
3. API Fetch Hook
Use useEffect to fetch data when a component loads.
4. Custom Hook
Create a reusable useFetch() custom hook.
5. Search Application
Build a search application using useState, useEffect and a custom hook.

Day 27 — React Forms & API Integration
1. Registration Form
Build a controlled React registration form.
2. Form Validation
Implement client-side validation for the React form.
3. API Submission
Submit form data to an API endpoint.
4. API Product Search
Build a React product search page using an API.
5. Complete CRUD Interface
Build a React interface capable of: Create, Read, Update, Delete records through an API.

Day 28 — React Router & Application Architecture
1. Multi-Page React App
Create routes for: Home, About, Contact 
2. Dashboard Routing
Create: Dashboard, Profile, Settings, Reports routes.
3. Dynamic Route
Create a product details route such as: /products/:id and display the selected product.
4. Protected Route
Create a simulated authentication system where Dashboard is accessible only after login.
5. React Application Architecture
Build a small application using a clean folder structure containing: Components, Pages, Services, Hooks, Routes, Utilities 

Day 29 — Frontend Performance, Debugging & Optimization
1. Debug Broken Application
Given an application containing multiple JavaScript/React bugs, identify and fix them.
2. Performance Optimization
Optimize a React application that unnecessarily re-renders components.
3. Lazy Loading
Implement lazy loading for application pages using React lazy loading.
4. Large List Optimization
Build and optimize a component rendering a large list of records.
5. Performance Audit
Analyze an existing frontend and identify at least five performance problems, then implement fixes for them.

Day 30 — Web Accessibility, Security & Deployment
1. Accessible Form
Create an accessible registration form using: Labels, Proper input types, Keyboard navigation, Error messages 
2. Accessible Website
Build a webpage that properly uses: Semantic HTML, ARIA where necessary, Keyboard-accessible controls, Accessible images 
3. XSS Prevention
Create a simple application that accepts user input and safely displays it without executing injected HTML/JavaScript.
4. Secure Frontend
Review a frontend application and fix issues involving: Unsafe HTML injection, Exposed secrets, Unsafe user input, Insecure links 
5. Deployment-Ready React App
Prepare a React application for production deployment: Configure production build, Set environment variables correctly, Remove development/debug code, Optimize assets, Create deployment documentation
"""

def generate():
    days_split = re.split(r'Day (\d+) — (.*)', data_text)
    # the first element is empty string before "Day 1"
    
    current_day = 0
    topic_title = ""
    
    for i in range(1, len(days_split), 3):
        day_num = int(days_split[i])
        topic = days_split[i+1].strip()
        content = days_split[i+2].strip()
        
        q_split = re.split(r'\n(\d+)\. ', '\n' + content)
        
        questions = []
        for j in range(1, len(q_split), 2):
            q_num = int(q_split[j])
            q_text = q_split[j+1].strip().split('\n')
            title = q_text[0].strip()
            desc = []
            reqs = []
            
            parsing_reqs = False
            for line in q_text[1:]:
                line = line.strip()
                if "using:" in line.lower() or "with:" in line.lower() or "containing:" in line.lower() or "include:" in line.lower() or "requirements:" in line.lower():
                    desc.append(line)
                    parsing_reqs = True
                elif parsing_reqs:
                    if line:
                        reqs.append(line.strip(' ,;.'))
                else:
                    if line:
                        desc.append(line)
            
            # If no reqs found, maybe split from last desc line if it's comma separated
            if not reqs and len(desc) > 0 and ":" in desc[-1]:
                parts = desc[-1].split(":", 1)
                reqs = [r.strip(' ,;.') for r in parts[1].split(',') if r.strip()]
                desc[-1] = parts[0] + ":"
            elif not reqs and len(desc) > 0 and desc[-1].count(',') > 1:
                # Only split by comma if there are multiple commas (looks like a list)
                reqs = [r.strip(' ,;.') for r in desc[-1].split(',') if r.strip()]
                desc.pop()
            
            questions.append({
                "id": f"CODE-D{day_num}-Q{q_num:03d}",
                "title": title,
                "description": " ".join(desc),
                "requirements": reqs
            })
            
        # Write JSON
        data = {
            "day": day_num,
            "topic": topic,
            "total_questions": len(questions),
            "questions": questions
        }
        filename = f"day{day_num:02d}_{topic.replace(' & ', '_').replace(' ', '_').lower()}.json"
        
        with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
            
    print("Code assessment bank generation complete!")

if __name__ == "__main__":
    generate()
