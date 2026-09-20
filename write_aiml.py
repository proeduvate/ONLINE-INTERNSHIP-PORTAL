import os
import json

data = [
  {
    "curriculum": "Data Science",
    "day": 26,
    "topic": "Machine Learning Model Deployment and REST APIs",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Explain how a trained machine learning model is exposed through an API.",
      "Design a basic REST API workflow for model predictions.",
      "Connect an application to a deployed machine learning endpoint."
    ],
    "activities": [
      {
        "id": "d26-a1",
        "type": "discover",
        "title": "Deployment Pipeline",
        "instruction": "Explore the path from model training to prediction.",
        "content": {
          "concept": "Model deployment makes a trained model available to applications through a serving layer.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d26-a2",
        "type": "discover",
        "title": "API Anatomy",
        "instruction": "Identify the parts of a prediction API.",
        "content": {
          "concept": "A prediction API receives input data, runs inference, and returns a model prediction.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "anatomy"
        }
      },
      {
        "id": "d26-a3",
        "type": "discover",
        "title": "Request Builder",
        "instruction": "Build a valid prediction request.",
        "content": {
          "concept": "API clients send structured input to an endpoint using an HTTP request.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d26-a4",
        "type": "discover",
        "title": "Prediction Workflow",
        "instruction": "Order the API prediction steps.",
        "content": {
          "concept": "A prediction request follows a sequence from client input through validation, inference, and response.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      }
    ],
    "assessmentRef": "assessment-day-26.json",
    "practicalTaskRef": "practical-day-26.json",
    "progression": {
      "nextActivityLockedUntilComplete": True,
      "nextDayLockedUntilComplete": True
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "Data Science",
    "day": 27,
    "topic": "MLOps, Experiment Tracking, and Model Versioning",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Explain why experiment tracking is important in machine learning projects.",
      "Track model versions, parameters, metrics, and artifacts.",
      "Design a basic workflow for reproducible machine learning experiments."
    ],
    "activities": [
      {
        "id": "d27-a1",
        "type": "discover",
        "title": "MLOps Lifecycle",
        "instruction": "Map the stages of an ML lifecycle.",
        "content": {
          "concept": "MLOps organizes model development, deployment, monitoring, and maintenance into a repeatable lifecycle.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d27-a2",
        "type": "discover",
        "title": "Experiment Anatomy",
        "instruction": "Identify what belongs in an experiment record.",
        "content": {
          "concept": "Experiment records can contain parameters, metrics, datasets, code versions, and model artifacts.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "anatomy"
        }
      },
      {
        "id": "d27-a3",
        "type": "discover",
        "title": "Version Control Lab",
        "instruction": "Match model versions to their changes.",
        "content": {
          "concept": "Model versioning allows teams to identify, compare, reproduce, and roll back model releases.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "match"
        }
      },
      {
        "id": "d27-a4",
        "type": "discover",
        "title": "Reproducible Workflow",
        "instruction": "Build a repeatable experiment workflow.",
        "content": {
          "concept": "Reproducibility requires consistent data, code, configuration, tracking, and evaluation.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      }
    ],
    "assessmentRef": "assessment-day-27.json",
    "practicalTaskRef": "practical-day-27.json",
    "progression": {
      "nextActivityLockedUntilComplete": True,
      "nextDayLockedUntilComplete": True
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "Data Science",
    "day": 28,
    "topic": "Data Science Capstone Architecture and Implementation",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Define a complete data science problem and its success criteria.",
      "Design an end-to-end architecture for a data science solution.",
      "Connect data ingestion, processing, modeling, and prediction components."
    ],
    "activities": [
      {
        "id": "d28-a1",
        "type": "discover",
        "title": "Problem Definition",
        "instruction": "Match project goals to measurable outcomes.",
        "content": {
          "concept": "A strong data science project starts with a clearly defined problem, target, constraints, and success metric.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "match"
        }
      },
      {
        "id": "d28-a2",
        "type": "discover",
        "title": "Capstone Architecture",
        "instruction": "Arrange the major project components.",
        "content": {
          "concept": "A data science architecture connects data sources, processing, feature engineering, models, and outputs.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d28-a3",
        "type": "discover",
        "title": "Pipeline Builder",
        "instruction": "Build the end-to-end data workflow.",
        "content": {
          "concept": "An end-to-end pipeline transforms raw data into validated predictions or analytical insights.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d28-a4",
        "type": "discover",
        "title": "Component Sequence",
        "instruction": "Order the capstone implementation stages.",
        "content": {
          "concept": "A structured implementation sequence reduces integration issues and keeps development measurable.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      }
    ],
    "assessmentRef": "assessment-day-28.json",
    "practicalTaskRef": "practical-day-28.json",
    "progression": {
      "nextActivityLockedUntilComplete": True,
      "nextDayLockedUntilComplete": True
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "Data Science",
    "day": 29,
    "topic": "Capstone Testing, Visualization, Documentation, and Presentation",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Validate the capstone pipeline and model using appropriate tests and metrics.",
      "Create visualizations that communicate project findings clearly.",
      "Prepare concise technical documentation and a project presentation."
    ],
    "activities": [
      {
        "id": "d29-a1",
        "type": "discover",
        "title": "Testing Strategy",
        "instruction": "Map tests to each project component.",
        "content": {
          "concept": "Testing verifies data processing, model behavior, API responses, and pipeline reliability.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d29-a2",
        "type": "discover",
        "title": "Visualization Selector",
        "instruction": "Choose the right chart for each insight.",
        "content": {
          "concept": "Effective visualizations match the chart type to the data relationship and communication goal.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d29-a3",
        "type": "discover",
        "title": "Documentation Anatomy",
        "instruction": "Identify the essential documentation sections.",
        "content": {
          "concept": "Technical documentation explains project objectives, data, methodology, results, setup, and usage.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "anatomy"
        }
      },
      {
        "id": "d29-a4",
        "type": "discover",
        "title": "Presentation Builder",
        "instruction": "Build the capstone presentation flow.",
        "content": {
          "concept": "A clear presentation connects the problem, approach, evidence, results, limitations, and future work.",
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
      "nextActivityLockedUntilComplete": True,
      "nextDayLockedUntilComplete": True
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  },
  {
    "curriculum": "Data Science",
    "day": 30,
    "topic": "Capstone Demonstration, Review, and Future Enhancements",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Demonstrate the complete data science solution from input to output.",
      "Evaluate project results against defined success criteria.",
      "Identify practical improvements and future extensions for the solution."
    ],
    "activities": [
      {
        "id": "d30-a1",
        "type": "discover",
        "title": "Capstone Walkthrough",
        "instruction": "Explore the complete solution flow.",
        "content": {
          "concept": "A capstone demonstration shows how each component works together to solve the defined problem.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d30-a2",
        "type": "discover",
        "title": "System Architecture Review",
        "instruction": "Inspect how the final components connect.",
        "content": {
          "concept": "Architecture review verifies that data, models, APIs, storage, and user outputs work together coherently.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d30-a3",
        "type": "discover",
        "title": "Results Review",
        "instruction": "Match project results to success criteria.",
        "content": {
          "concept": "Project evaluation compares observed results with predefined technical and business objectives.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "match"
        }
      },
      {
        "id": "d30-a4",
        "type": "discover",
        "title": "Enhancement Planner",
        "instruction": "Build a roadmap for future improvements.",
        "content": {
          "concept": "Future enhancements can target data quality, model performance, scalability, usability, monitoring, or new capabilities.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      }
    ],
    "assessmentRef": "assessment-day-30.json",
    "practicalTaskRef": "practical-day-30.json",
    "progression": {
      "nextActivityLockedUntilComplete": True,
      "nextDayLockedUntilComplete": True
    },
    "separation": {
      "learning": "Teach the concept through an interactive experience.",
      "assessment": "Stored separately and completed after learning.",
      "practical": "Stored separately and completed after assessment."
    }
  }
]

dest_dir = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "frontend", "src", "features", "learning", "interactive", "data", "data-science"
)

for day_data in data:
    day_num = day_data['day']
    filename = f"day-{day_num:02d}.json"
    filepath = os.path.join(dest_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(day_data, f, indent=2)
    print(f"Wrote {filepath}")
