import os
import json
import time
import google.generativeai as genai
from typing import Dict, List

# Load configuration from environment or .env if present
from dotenv import load_dotenv
load_dotenv()

# We expect GEMINI_API_KEY to be set
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is missing. Please set it to generate the question bank.")

genai.configure(api_key=api_key)

DAYS_TOPICS = {
    1: "HTML Fundamentals & Document Structure",
    2: "Semantic HTML5",
    3: "HTML Forms & Input Elements",
    4: "HTML Media, Links, Lists & Tables",
    5: "CSS Fundamentals & Selectors",
    6: "CSS Box Model",
    7: "CSS Typography, Colors & Backgrounds",
    8: "Flexbox",
    9: "CSS Grid",
    10: "Responsive Web Design",
    11: "CSS Positioning & Layout",
    12: "CSS Transitions, Transforms & Animations",
    13: "JavaScript Fundamentals",
    14: "Conditions, Loops & Control Flow",
    15: "Functions, Scope & Closures",
    16: "Arrays, Objects & Modern JavaScript",
    17: "DOM Manipulation",
    18: "Events & Event Handling",
    19: "Forms & Client-Side Validation",
    20: "JSON, Local Storage & Session Storage",
    21: "Asynchronous JavaScript & Promises",
    22: "REST APIs & Fetch",
    23: "React Fundamentals & Components",
    24: "JSX, Props & Component Composition",
    25: "React State & Event Handling",
    26: "React Hooks",
    27: "React Forms & API Integration",
    28: "React Router & Application Architecture",
    29: "Frontend Performance, Debugging & Optimization",
    30: "Web Accessibility, Security & Deployment"
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "question_bank")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_questions_for_day(day: int, topic: str) -> List[Dict]:
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
You are an expert technical interviewer and curriculum developer for an advanced web development internship.
Generate exactly 50 UNIQUE, HIGH-QUALITY multiple-choice questions for Day {day}: "{topic}".

## NEW MCQ QUALITY RULES
Every question must be a real technical assessment question related specifically to {topic}.
Do NOT generate generic questions. Do NOT generate filler questions.
Do NOT generate questions where one option is obviously correct because it sounds more professional.
Do NOT use meaningless options such as "Always testing...", "Ignoring...", "Using excessively...", "Never using...", "Following best practices appropriately..." unless they are genuinely technically meaningful alternatives.
Every option A, B, C and D must be a plausible technical answer.
There must be exactly ONE objectively correct answer.
The incorrect options must be technically plausible but incorrect.

## QUESTION TYPES
Use a mixture of:
1. Conceptual questions
2. Syntax questions
3. Code/output questions
4. Scenario-based questions
5. Debugging questions
6. Best-practice questions
7. Comparison questions
8. Behavior-based questions
9. Practical development questions
10. Edge-case questions where appropriate

For programming topics, include actual code snippets where useful. Use \n for newlines in code strings.

## DIFFICULTY
Mixture: 20% Easy, 50% Medium, 30% Difficult.
Do not make all questions basic definition questions.

## CORRECT ANSWER DISTRIBUTION
Distribute correct answers across A, B, C, D reasonably throughout the 50 questions.

## NO DUPLICATES
All 50 questions must test a different concept, behavior, syntax rule, scenario, or application.

## JSON FORMAT
Return ONLY valid JSON format exactly matching this schema. Do not include markdown codeblocks or text outside the JSON array.
[
  {{
    "id": "D{day}-Q001",
    "question": "...",
    "options": {{
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    }},
    "correct_answer": "A"
  }},
  ... up to Q050
]
"""
    
    # We may need to retry if it fails or doesn't return JSON
    retries = 3
    for attempt in range(retries):
        try:
            print(f"  Attempt {attempt+1} for Day {day}...")
            response = model.generate_content(prompt)
            content = response.text.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            questions = json.loads(content)
            
            if len(questions) == 50:
                # Format IDs properly just in case
                for i, q in enumerate(questions):
                    q["id"] = f"D{day}-Q{str(i+1).zfill(3)}"
                return questions
            else:
                print(f"  Warning: Expected 50 questions, got {len(questions)}. Retrying...")
        except Exception as e:
            print(f"  Error parsing response: {e}. Retrying...")
            time.sleep(2)
            
    raise ValueError(f"Failed to generate 50 valid questions for Day {day} after {retries} attempts.")


def main():
    print("Starting generation of 1500 high-quality MCQ questions...")
    for day, topic in DAYS_TOPICS.items():
        filename = f"day{day:02d}_{topic.lower().replace(' ', '_').replace(',', '').replace('&', 'and')}.json"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        print(f"Generating Day {day}: {topic}...")
        questions = generate_questions_for_day(day, topic)
        
        day_data = {
            "day": day,
            "topic": topic,
            "questions": questions
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(day_data, f, indent=4)
            
        print(f"Saved {len(questions)} questions to {filename}")
        
    print("All 1500 questions generated successfully.")

if __name__ == "__main__":
    main()
