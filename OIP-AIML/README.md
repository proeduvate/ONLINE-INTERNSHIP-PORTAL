# OIP-AIML

AI/ML module for the Online Internship Portal.

This project contains two AI-powered features:

1. AI-Powered Code Evaluation and AI-Derived Score Explanation
2. AI Client for Complex Internship Tasks

---

## Features

### Feature 1 - AI-Powered Code Evaluation

The feature automatically evaluates intern code submissions.

Workflow:

Intern Submission
        |
        v
FastAPI
        |
        v
Judge0
        |
        v
Code Execution
        |
        v
Execution Results
        |
        v
Gemini 2.5 Flash-Lite
        |
        v
AI Evaluation
        |
        v
Score + Explanation

Judge0 is responsible for actual code execution.

Gemini is responsible for reasoning, evaluation,
scoring and explanation.

The evaluation contains:

- Final score
- Code quality
- Logic
- Requirement adherence
- Complexity
- Strengths
- Weaknesses
- Score explanation
- Confidence
- Test case results

---

### Feature 2 - AI Client

The AI Client is intended for selected complex tasks.

The mentor can enable the AI Client for skilled interns.

The AI acts as a demanding client rather than simply
accepting the intern's implementation.

Workflow:

Mentor enables AI Client
        |
        v
Complex Internship Task
        |
        v
Intern Implementation
        |
        v
AI Client Review
        |
        v
Satisfied?
   /          \
 Yes          No
 |             |
Approve      Additional
             Requirements
                 |
                 v
             Intern Revision
                 |
                 v
             AI Re-review

---

## Technology Stack

- Python
- FastAPI
- Judge0
- Docker
- Ubuntu
- VirtualBox
- Gemini 2.5 Flash-Lite
- Pydantic

---

## Project Structure

OIP-AIML/
|
├── app/
│   ├── main.py
│   ├── config.py
│   ├── schemas.py
│   |
│   ├── services/
│   │   ├── judge0_service.py
│   │   ├── gemini_service.py
│   │   ├── code_evaluation_service.py
│   │   └── ai_client_service.py
│   |
│   └── prompts/
│       ├── code_evaluation_prompt.py
│       └── ai_client_prompt.py
|
├── tests/
├── .env
├── .gitignore
├── requirements.txt
└── README.md

---

## Setup

Create a virtual environment:

python -m venv .venv

Activate it on Windows:

.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Configure the .env file:

GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash-lite
JUDGE0_URL=http://127.0.0.1:2358

---

## Run

Start the FastAPI application:

uvicorn app.main:app --reload

API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

---

## Judge0

Judge0 is self-hosted inside Ubuntu running through
VirtualBox.

The Judge0 API is exposed on:

http://127.0.0.1:2358

Before testing Feature 1, make sure Judge0 is running.

---

## Security

Do not commit the .env file.

Never expose the Gemini API key in source code,
screenshots, documentation or GitHub repositories.