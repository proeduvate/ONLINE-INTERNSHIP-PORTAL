import json
import os

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "question_bank", "day01_html_fundamentals_and_document_structure.json")

def generate_mock_questions():
    questions = []
    topics = [
        ("What does the <!DOCTYPE html> declaration do in HTML5?", "It tells the browser to use standard mode to render the document.", "It includes external CSS files.", "It declares the document language.", "It links JavaScript files."),
        ("Which element is used to specify metadata about an HTML document?", "<meta>", "<head>", "<title>", "<link>"),
        ("What is the correct HTML element for inserting a line break?", "<br>", "<break>", "<lb>", "<newline>"),
        ("Which attribute specifies a unique identifier for an HTML element?", "id", "class", "name", "key"),
        ("How do you create a hyperlink in HTML?", "<a href=\"url\">link text</a>", "<a>url</a>", "<link src=\"url\">", "<href=\"url\">link</a>"),
        ("Which tag is used to define an ordered list?", "<ol>", "<ul>", "<li>", "<list>"),
        ("What does HTML stand for?", "Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Markup Language"),
        ("Choose the correct HTML element to define important text.", "<strong>", "<b>", "<i>", "<important>"),
        ("Which character is used to indicate an end tag?", "/", "*", "<", "^"),
        ("How can you make a numbered list?", "<ol>", "<ul>", "<dl>", "<list>"),
    ]
    
    # Generate 50 questions by varying the topics
    for i in range(50):
        t = topics[i % len(topics)]
        q = {
            "id": f"D1-Q{i+1:03d}",
            "question": f"{t[0]} (Variant {i+1})",
            "options": {
                "A": t[1],
                "B": t[2],
                "C": t[3],
                "D": t[4]
            },
            "correct_answer": "A"
        }
        questions.append(q)

    data = {
        "day": 1,
        "topic": "HTML Fundamentals & Document Structure",
        "total_questions": 50,
        "questions": questions
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    print(f"Successfully generated {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_mock_questions()
