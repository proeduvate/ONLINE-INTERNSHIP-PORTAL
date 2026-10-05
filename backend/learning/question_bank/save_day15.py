import json
import re

content = """{
  "day": 15,
  "topic": "JavaScript Functions, Scope and Closures",
  "total_questions": 50,
  "questions": [
    {
      "id": "Q-D15-001",
      "question": "Which keyword is used to declare a function in JavaScript?",
      "options": {
        "A": "function",
        "B": "def",
        "C": "func",
        "D": "method"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-002",
      "question": "What is used to execute a function?",
      "options": {
        "A": "Function declaration",
        "B": "Function invocation",
        "C": "Function comment",
        "D": "Function scope"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-003",
      "question": "What is the output of function greet() { return 'Hello'; } console.log(greet());?",
      "options": {
        "A": "undefined",
        "B": "greet",
        "C": "Hello",
        "D": "Error"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-004",
      "question": "What is a parameter?",
      "options": {
        "A": "A value returned by a function",
        "B": "A variable listed in a function definition",
        "C": "A loop variable only",
        "D": "A function error"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-005",
      "question": "What is an argument?",
      "options": {
        "A": "A value passed to a function when calling it",
        "B": "A function name",
        "C": "A return statement",
        "D": "A scope boundary"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-006",
      "question": "Which statement sends a value back from a function?",
      "options": {
        "A": "send",
        "B": "output",
        "C": "return",
        "D": "break"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-007",
      "question": "What does a function return if no return statement is used?",
      "options": {
        "A": "null",
        "B": "false",
        "C": "0",
        "D": "undefined"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-008",
      "question": "Which function declaration can be called before its declaration in the code?",
      "options": {
        "A": "Function declaration",
        "B": "Arrow function assigned to const",
        "C": "Function expression assigned to let",
        "D": "Anonymous function expression"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-009",
      "question": "Which is a valid function expression?",
      "options": {
        "A": "function = test() {}",
        "B": "const test = function() {};",
        "C": "function: test() {}",
        "D": "make test() {}"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-010",
      "question": "What is the main feature of an anonymous function?",
      "options": {
        "A": "It has no parameters",
        "B": "It cannot return values",
        "C": "It has no declared name",
        "D": "It cannot be executed"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-011",
      "question": "Which syntax creates an arrow function?",
      "options": {
        "A": "function => ()",
        "B": "() -> {}",
        "C": "arrow() {}",
        "D": "() => {}"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-012",
      "question": "What is the output of const add = (a, b) => a + b; console.log(add(2, 3));?",
      "options": {
        "A": "5",
        "B": "23",
        "C": "undefined",
        "D": "Error"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-013",
      "question": "What does an arrow function with an expression body return automatically?",
      "options": {
        "A": "Nothing",
        "B": "The expression result",
        "C": "Only undefined",
        "D": "A Promise always"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-014",
      "question": "Which syntax is valid for an arrow function with one parameter?",
      "options": {
        "A": "x -> x * 2",
        "B": "function x => x * 2",
        "C": "x => x * 2",
        "D": "arrow x: x * 2"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-015",
      "question": "What is the purpose of a default parameter?",
      "options": {
        "A": "To prevent function calls",
        "B": "To create a global variable",
        "C": "To force a string value",
        "D": "To use a value when an argument is undefined"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-016",
      "question": "What is the output of function greet(name = 'Guest') { return name; } console.log(greet());?",
      "options": {
        "A": "Guest",
        "B": "undefined",
        "C": "null",
        "D": "Error"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-017",
      "question": "Which syntax collects multiple arguments into an array?",
      "options": {
        "A": "Spread syntax only",
        "B": "Rest parameter",
        "C": "Default parameter",
        "D": "Optional chaining"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-018",
      "question": "Which symbol is used for a rest parameter?",
      "options": {
        "A": "&&",
        "B": "??",
        "C": "...",
        "D": "::"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-019",
      "question": "What is the output of function sum(...numbers) { return numbers.length; } console.log(sum(1, 2, 3));?",
      "options": {
        "A": "1",
        "B": "2",
        "C": "undefined",
        "D": "3"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-020",
      "question": "What is a callback function?",
      "options": {
        "A": "A function passed to another function",
        "B": "A function that cannot be called",
        "C": "A function without parameters",
        "D": "A function that always returns false"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-021",
      "question": "What is a higher-order function?",
      "options": {
        "A": "A function with many lines",
        "B": "A function that accepts or returns another function",
        "C": "A function declared globally",
        "D": "A function without a return statement"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-022",
      "question": "Which array method receives a callback for each element?",
      "options": {
        "A": "push",
        "B": "join",
        "C": "forEach",
        "D": "pop"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-023",
      "question": "Which method creates a new array by transforming each element?",
      "options": {
        "A": "filter",
        "B": "reduce",
        "C": "find",
        "D": "map"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-024",
      "question": "Which method returns a new array containing elements that pass a condition?",
      "options": {
        "A": "filter",
        "B": "map",
        "C": "forEach",
        "D": "every"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-025",
      "question": "What is lexical scope?",
      "options": {
        "A": "Scope based on execution speed",
        "B": "Scope determined by where code is written",
        "C": "Scope based only on user input",
        "D": "Scope created by loops only"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-026",
      "question": "Which scope is created by a function?",
      "options": {
        "A": "HTML scope",
        "B": "CSS scope",
        "C": "Function scope",
        "D": "Database scope"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-027",
      "question": "Which keywords are block-scoped?",
      "options": {
        "A": "var only",
        "B": "function only",
        "C": "global only",
        "D": "let and const"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-028",
      "question": "Which keyword is function-scoped rather than block-scoped?",
      "options": {
        "A": "var",
        "B": "let",
        "C": "const",
        "D": "class"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-029",
      "question": "What happens when a variable is declared with let inside a block?",
      "options": {
        "A": "It becomes automatically global",
        "B": "It is accessible only inside that block",
        "C": "It becomes available in every function",
        "D": "It cannot store values"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-030",
      "question": "What is variable shadowing?",
      "options": {
        "A": "Deleting a variable",
        "B": "Copying a variable to an array",
        "C": "Declaring a variable with the same name in an inner scope",
        "D": "Converting a variable to a string"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-031",
      "question": "What is hoisting?",
      "options": {
        "A": "Moving HTML elements",
        "B": "Converting functions to objects",
        "C": "Running loops faster",
        "D": "JavaScript processing declarations before execution"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-032",
      "question": "What value does a hoisted var variable have before assignment?",
      "options": {
        "A": "undefined",
        "B": "null",
        "C": "false",
        "D": "0"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-033",
      "question": "What is the Temporal Dead Zone?",
      "options": {
        "A": "The time before a function finishes",
        "B": "The period when let or const cannot be accessed before initialization",
        "C": "The delay in setTimeout",
        "D": "The time required to load a webpage"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-034",
      "question": "What happens when a let variable is accessed before initialization?",
      "options": {
        "A": "It returns null",
        "B": "It returns false",
        "C": "It throws a ReferenceError",
        "D": "It returns zero"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-035",
      "question": "What is a closure?",
      "options": {
        "A": "A closed browser tab",
        "B": "A function without a name",
        "C": "A loop that never ends",
        "D": "A function that remembers variables from its outer scope"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-036",
      "question": "Which feature allows a function to access variables after the outer function has finished?",
      "options": {
        "A": "Closure",
        "B": "Hoisting only",
        "C": "Strict equality",
        "D": "Destructuring"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-037",
      "question": "What is the output of function outer() { let x = 10; return function() { return x; }; } const fn = outer(); console.log(fn());?",
      "options": {
        "A": "undefined",
        "B": "10",
        "C": "null",
        "D": "Error"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-038",
      "question": "Closures are commonly used to create what?",
      "options": {
        "A": "HTML tables",
        "B": "CSS selectors",
        "C": "Private state",
        "D": "Database schemas"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-039",
      "question": "What does an IIFE stand for?",
      "options": {
        "A": "Internal Internet Function Event",
        "B": "Indexed Iteration Function Expression",
        "C": "Input Initialization For Execution",
        "D": "Immediately Invoked Function Expression"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-040",
      "question": "Which syntax is a valid IIFE?",
      "options": {
        "A": "(function() { console.log('Hi'); })();",
        "B": "function() { console.log('Hi'); }();",
        "C": "invoke function() {}",
        "D": "call(function) {}"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-041",
      "question": "What is recursion?",
      "options": {
        "A": "Calling a function from another file",
        "B": "A function calling itself",
        "C": "Calling a function only once",
        "D": "Returning an array"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-042",
      "question": "What is necessary to stop a recursive function?",
      "options": {
        "A": "A global variable",
        "B": "A callback",
        "C": "A base condition",
        "D": "A CSS rule"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-043",
      "question": "What may happen if recursion has no stopping condition?",
      "options": {
        "A": "The function returns automatically",
        "B": "The browser becomes faster",
        "C": "The value becomes null",
        "D": "A stack overflow may occur"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-044",
      "question": "What is a pure function?",
      "options": {
        "A": "A function that always produces the same output for the same input and has no side effects",
        "B": "A function that must be written in HTML",
        "C": "A function that modifies global data",
        "D": "A function that never accepts arguments"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-045",
      "question": "Which action is a side effect?",
      "options": {
        "A": "Adding two numbers locally",
        "B": "Updating a global variable",
        "C": "Returning a calculated value",
        "D": "Checking a condition"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-046",
      "question": "What does the bind() method do?",
      "options": {
        "A": "Deletes a function",
        "B": "Converts a function to JSON",
        "C": "Creates a new function with a fixed this value",
        "D": "Runs a function repeatedly"
      },
      "correct_answer": "C"
    },
    {
      "id": "Q-D15-047",
      "question": "What is the purpose of call()?",
      "options": {
        "A": "To define a class",
        "B": "To create a loop",
        "C": "To return a Promise automatically",
        "D": "To call a function with a specified this value and arguments"
      },
      "correct_answer": "D"
    },
    {
      "id": "Q-D15-048",
      "question": "What is the purpose of apply()?",
      "options": {
        "A": "To call a function using arguments provided as an array",
        "B": "To create a CSS style",
        "C": "To stop execution permanently",
        "D": "To declare a variable"
      },
      "correct_answer": "A"
    },
    {
      "id": "Q-D15-049",
      "question": "Which statement about arrow functions is correct?",
      "options": {
        "A": "They always have their own this value",
        "B": "They do not have their own this binding",
        "C": "They cannot accept parameters",
        "D": "They cannot return values"
      },
      "correct_answer": "B"
    },
    {
      "id": "Q-D15-050",
      "question": "What is the output of let count = 0; function increment() { count++; return count; } console.log(increment()); console.log(increment());?",
      "options": {
        "A": "0 and 0",
        "B": "1 and 1",
        "C": "1 and 2",
        "D": "2 and 2"
      },
      "correct_answer": "C"
    }
  ]
}"""

with open('day15_functions_scope_closures.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved successfully!")
