import os
import json

data_str = """
[
  {
    "curriculum": "UI/UX",
    "day": 26,
    "topic": "Capstone Project Discovery, Research Synthesis, and Problem Framing",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Synthesize user research findings into actionable insights.",
      "Identify and prioritize the core user problem for a capstone project.",
      "Create a clear problem statement and measurable design goals."
    ],
    "activities": [
      {
        "id": "d26-a1",
        "type": "discover",
        "title": "Research Insight Map",
        "instruction": "Connect research findings to recurring user needs.",
        "content": {
          "concept": "Research synthesis groups observations into patterns, themes, and actionable insights.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d26-a2",
        "type": "discover",
        "title": "Problem Framing",
        "instruction": "Arrange the elements into a focused problem statement.",
        "content": {
          "concept": "A strong problem statement identifies the target user, their need, and the context or challenge.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      },
      {
        "id": "d26-a3",
        "type": "discover",
        "title": "Insight Prioritizer",
        "instruction": "Adjust priority values to identify the most important insights.",
        "content": {
          "concept": "Prioritization helps teams focus design effort on problems with meaningful user impact.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "slider"
        }
      },
      {
        "id": "d26-a4",
        "type": "discover",
        "title": "Design Goal Builder",
        "instruction": "Select goals that directly address the defined problem.",
        "content": {
          "concept": "Design goals translate user problems into specific outcomes the solution should achieve.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      }
    ],
    "assessmentRef": "assessment-day-26.json",
    "practicalTaskRef": "practical-day-26.json",
    "progression": {
      "nextActivityLockedUntilComplete": true,
      "nextDayLockedUntilComplete": true
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "UI/UX",
    "day": 27,
    "topic": "Capstone Information Architecture, User Flows, and Wireframes",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Organize capstone content into a clear information architecture.",
      "Design task-focused user flows for primary user goals.",
      "Translate flows into structured low-fidelity wireframes."
    ],
    "activities": [
      {
        "id": "d27-a1",
        "type": "discover",
        "title": "Content Structure Map",
        "instruction": "Arrange content into a logical information hierarchy.",
        "content": {
          "concept": "Information architecture organizes content and features so users can find and understand them efficiently.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d27-a2",
        "type": "discover",
        "title": "User Flow Builder",
        "instruction": "Build the shortest logical path to the user's goal.",
        "content": {
          "concept": "User flows represent the sequence of actions users take to complete a specific task.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d27-a3",
        "type": "discover",
        "title": "Flow Sequence Challenge",
        "instruction": "Drag each screen into the correct task sequence.",
        "content": {
          "concept": "A well-structured flow reduces unnecessary steps and keeps users oriented toward their goal.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      },
      {
        "id": "d27-a4",
        "type": "discover",
        "title": "Wireframe Anatomy",
        "instruction": "Identify the purpose of each wireframe region.",
        "content": {
          "concept": "Wireframes define hierarchy, structure, navigation, and content placement before visual styling.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "anatomy"
        }
      }
    ],
    "assessmentRef": "assessment-day-27.json",
    "practicalTaskRef": "practical-day-27.json",
    "progression": {
      "nextActivityLockedUntilComplete": true,
      "nextDayLockedUntilComplete": true
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "UI/UX",
    "day": 28,
    "topic": "Capstone High-Fidelity UI, Design System, and Prototype",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Transform wireframes into consistent high-fidelity interfaces.",
      "Apply reusable components and design tokens.",
      "Build an interactive prototype representing the primary user journey."
    ],
    "activities": [
      {
        "id": "d28-a1",
        "type": "discover",
        "title": "Design System Assembly",
        "instruction": "Combine reusable components into a consistent interface.",
        "content": {
          "concept": "Design systems provide reusable components, styles, and rules that maintain consistency across screens.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d28-a2",
        "type": "discover",
        "title": "Token Selector",
        "instruction": "Choose appropriate values for spacing, type, and color tokens.",
        "content": {
          "concept": "Design tokens store reusable design values such as colors, typography, spacing, and component dimensions.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d28-a3",
        "type": "discover",
        "title": "High-Fidelity Builder",
        "instruction": "Build a polished screen from reusable UI elements.",
        "content": {
          "concept": "High-fidelity UI combines hierarchy, typography, color, spacing, imagery, and components into a realistic interface.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d28-a4",
        "type": "discover",
        "title": "Prototype Flow",
        "instruction": "Connect screens to create the primary interaction path.",
        "content": {
          "concept": "Interactive prototypes simulate navigation and key interactions before implementation.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      }
    ],
    "assessmentRef": "assessment-day-28.json",
    "practicalTaskRef": "practical-day-28.json",
    "progression": {
      "nextActivityLockedUntilComplete": true,
      "nextDayLockedUntilComplete": true
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "UI/UX",
    "day": 29,
    "topic": "Capstone Usability Testing, Iteration, Accessibility, and Handoff",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Evaluate the capstone prototype through usability testing.",
      "Prioritize findings and iterate on the design.",
      "Prepare accessible designs and implementation-ready developer handoff."
    ],
    "activities": [
      {
        "id": "d29-a1",
        "type": "discover",
        "title": "Usability Test Planner",
        "instruction": "Arrange the stages of a focused usability test.",
        "content": {
          "concept": "Usability testing observes users completing representative tasks to uncover interaction problems.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      },
      {
        "id": "d29-a2",
        "type": "discover",
        "title": "Finding Prioritizer",
        "instruction": "Select findings that require attention first.",
        "content": {
          "concept": "Usability findings can be prioritized using factors such as severity, frequency, and impact on task completion.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d29-a3",
        "type": "discover",
        "title": "Accessibility Check",
        "instruction": "Match interface issues with appropriate accessibility improvements.",
        "content": {
          "concept": "Accessible interfaces consider keyboard access, contrast, labels, focus states, readable content, and assistive technologies.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "match"
        }
      },
      {
        "id": "d29-a4",
        "type": "discover",
        "title": "Developer Handoff Builder",
        "instruction": "Assemble the essential assets and specifications for handoff.",
        "content": {
          "concept": "Design handoff communicates components, measurements, states, assets, interactions, and implementation requirements to developers.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      }
    ],
    "assessmentRef": "assessment-day-29.json",
    "practicalTaskRef": "practical-day-29.json",
    "progression": {
      "nextActivityLockedUntilComplete": true,
      "nextDayLockedUntilComplete": true
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "UI/UX",
    "day": 30,
    "topic": "Capstone Presentation, Portfolio Case Study, and Design Documentation",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Present the capstone project using a clear UX case-study structure.",
      "Document the design process, decisions, iterations, and outcomes.",
      "Create a portfolio-ready project narrative and future improvement roadmap."
    ],
    "activities": [
      {
        "id": "d30-a1",
        "type": "discover",
        "title": "Case Study Story Map",
        "instruction": "Arrange the project stages into a clear UX story.",
        "content": {
          "concept": "A UX case study connects the problem, research, design decisions, iterations, and outcome into a coherent narrative.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      },
      {
        "id": "d30-a2",
        "type": "discover",
        "title": "Presentation Structure",
        "instruction": "Build a concise structure for the final project presentation.",
        "content": {
          "concept": "A strong design presentation communicates the problem, process, solution, evidence, and key learnings clearly.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d30-a3",
        "type": "discover",
        "title": "Portfolio Evidence Selector",
        "instruction": "Select artifacts that best demonstrate the design process.",
        "content": {
          "concept": "Portfolio evidence should demonstrate reasoning, iteration, user-centered decisions, and the final solution.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d30-a4",
        "type": "discover",
        "title": "Future Roadmap Builder",
        "instruction": "Connect project findings to meaningful next steps.",
        "content": {
          "concept": "A UX roadmap identifies future improvements, validation opportunities, and product extensions based on current evidence.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      }
    ],
    "assessmentRef": "assessment-day-30.json",
    "practicalTaskRef": "practical-day-30.json",
    "progression": {
      "nextActivityLockedUntilComplete": true,
      "nextDayLockedUntilComplete": true
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  }
]
"""
data = json.loads(data_str)

dest_dir = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "frontend", "src", "features", "learning", "interactive", "data", "ui-ux"
)

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for day_data in data:
    day_num = day_data['day']
    filename = f"day-{day_num:02d}.json"
    filepath = os.path.join(dest_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(day_data, f, indent=2)
    print(f"Wrote {filepath}")
