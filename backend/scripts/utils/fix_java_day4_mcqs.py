import sys
sys.path.append('c:\\proeduvate\\ONLINE-INTERNSHIP-PORTAL\\backend')
from app.db.session import SessionLocal
from app.models import DomainMCQQuestion
import json

db = SessionLocal()

# The 10 real Java questions for Day 4 (Input, Output & Formatting)
real_questions = [
    {
        'q': 'What is the standard class used for taking input from the console in Java?',
        'o': ['Scanner', 'Printer', 'InputReader', 'Keyboard'],
        'c': 'Scanner'
    },
    {
        'q': 'Which method of the Scanner class is used to read an integer?',
        'o': ['nextInt()', 'getInt()', 'readInteger()', 'scanInt()'],
        'c': 'nextInt()'
    },
    {
        'q': 'What is the standard output stream in Java used to print to the console?',
        'o': ['System.out', 'System.in', 'Console.write', 'System.print'],
        'c': 'System.out'
    },
    {
        'q': 'Which method is used for formatted string output in Java?',
        'o': ['System.out.printf()', 'System.out.format()', 'Both A and B', 'Neither'],
        'c': 'Both A and B'
    },
    {
        'q': 'Which format specifier is used for formatting integer numbers in printf?',
        'o': ['%d', '%i', '%f', '%s'],
        'c': '%d'
    },
    {
        'q': 'Which method reads a full line of text including spaces in Java?',
        'o': ['nextLine()', 'readLine()', 'getLine()', 'nextString()'],
        'c': 'nextLine()'
    },
    {
        'q': 'How do you format a floating-point number to exactly two decimal places in Java?',
        'o': ['"%.2f"', '"%2f"', '"%0.2"', '"%2.0f"'],
        'c': '"%.2f"'
    },
    {
        'q': 'What package must be imported to use the Scanner class?',
        'o': ['java.util.Scanner', 'java.io.Scanner', 'java.lang.Scanner', 'java.net.Scanner'],
        'c': 'java.util.Scanner'
    },
    {
        'q': 'Which of these is NOT a valid way to print text in Java?',
        'o': ['System.out.writeLine', 'System.out.print', 'System.out.println', 'System.out.printf'],
        'c': 'System.out.writeLine'
    },
    {
        'q': 'What exception is thrown if you call nextInt() but the user enters a non-numeric string?',
        'o': ['InputMismatchException', 'NumberFormatException', 'IllegalArgumentException', 'IOException'],
        'c': 'InputMismatchException'
    }
]

# Fetch the Java Day 4 MCQs
mcqs = db.query(DomainMCQQuestion).filter(
    DomainMCQQuestion.domain_name.ilike('%java%'),
    DomainMCQQuestion.day_number == 4
).order_by(DomainMCQQuestion.id).limit(10).all()

if len(mcqs) == 10:
    for i, mcq in enumerate(mcqs):
        mcq.question_text = real_questions[i]['q']
        mcq.option_a = real_questions[i]['o'][0]
        mcq.option_b = real_questions[i]['o'][1]
        mcq.option_c = real_questions[i]['o'][2]
        mcq.option_d = real_questions[i]['o'][3]
        mcq.correct_option = real_questions[i]['c']
    db.commit()
    print('Successfully updated 10 Java MCQs for Day 4.')
else:
    print(f'Expected 10 MCQs but found {len(mcqs)}')
