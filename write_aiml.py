import os
import json

data_str = """
[
  {
    "curriculum": "Java",
    "day": 26,
    "topic": "Cloud Deployment and Environment Configuration",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Explain the core concepts involved in deploying Java applications to the cloud.",
      "Configure application settings using environment variables and external configuration.",
      "Design a deployment workflow that separates development and production environments."
    ],
    "activities": [
      {
        "id": "d26-a1",
        "type": "discover",
        "title": "Cloud Deployment Map",
        "instruction": "Map the application deployment components.",
        "content": {
          "concept": "Cloud deployment moves an application from source code to a managed runtime environment accessible through a network.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d26-a2",
        "type": "discover",
        "title": "Configuration Selector",
        "instruction": "Select where each setting belongs.",
        "content": {
          "concept": "Environment-specific values such as database URLs and credentials should be supplied through external configuration rather than hardcoded in source code.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d26-a3",
        "type": "discover",
        "title": "Deployment Pipeline",
        "instruction": "Arrange the cloud deployment stages.",
        "content": {
          "concept": "A deployment flow commonly builds an artifact or image, configures the environment, starts the application, and verifies its availability.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      },
      {
        "id": "d26-a4",
        "type": "discover",
        "title": "Environment Builder",
        "instruction": "Build a production configuration.",
        "content": {
          "concept": "Externalized configuration allows the same application artifact to run with different settings across environments.",
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
    "curriculum": "Java",
    "day": 27,
    "topic": "Logging, Monitoring, and Production Observability",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Explain how logging and monitoring support production applications.",
      "Identify useful application metrics and log levels.",
      "Design a basic observability workflow for diagnosing application behavior."
    ],
    "activities": [
      {
        "id": "d27-a1",
        "type": "discover",
        "title": "Observability Map",
        "instruction": "Connect logs, metrics, and traces.",
        "content": {
          "concept": "Observability combines signals such as logs, metrics, and traces to help understand application behavior.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d27-a2",
        "type": "discover",
        "title": "Log Level Selector",
        "instruction": "Choose the appropriate log level.",
        "content": {
          "concept": "Log levels such as DEBUG, INFO, WARN, and ERROR communicate different levels of application information and problems.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d27-a3",
        "type": "discover",
        "title": "Monitoring Dashboard",
        "instruction": "Select the metrics for each scenario.",
        "content": {
          "concept": "Metrics such as request rate, latency, error rate, and resource usage help reveal application performance and health.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "match"
        }
      },
      {
        "id": "d27-a4",
        "type": "discover",
        "title": "Incident Investigation",
        "instruction": "Arrange the troubleshooting workflow.",
        "content": {
          "concept": "Production diagnosis can combine alerts, metrics, logs, and traces to identify the source and impact of a problem.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
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
    "curriculum": "Java",
    "day": 28,
    "topic": "Capstone Architecture and System Design",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Translate application requirements into system components.",
      "Design a layered Java application architecture.",
      "Connect frontend, backend, database, authentication, and external services into a coherent system."
    ],
    "activities": [
      {
        "id": "d28-a1",
        "type": "discover",
        "title": "Requirement Mapper",
        "instruction": "Map requirements to system components.",
        "content": {
          "concept": "System design begins by translating user and business requirements into components, responsibilities, data, and interactions.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d28-a2",
        "type": "discover",
        "title": "Application Architecture",
        "instruction": "Build the capstone architecture.",
        "content": {
          "concept": "A full application can combine a client, REST API, service layer, persistence layer, database, authentication, and external integrations.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d28-a3",
        "type": "discover",
        "title": "Request Journey",
        "instruction": "Trace a request through the system.",
        "content": {
          "concept": "A user request can travel from the frontend through authentication and backend layers to persistence before returning a response.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
        }
      },
      {
        "id": "d28-a4",
        "type": "discover",
        "title": "Technology Selector",
        "instruction": "Select technologies for each layer.",
        "content": {
          "concept": "Technology choices should match the responsibilities and constraints of each application layer.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
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
    "curriculum": "Java",
    "day": 29,
    "topic": "Capstone Testing, Documentation, and Optimization",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Create a testing strategy covering important application layers.",
      "Identify documentation required for a production-ready Java project.",
      "Select optimization and quality improvements based on application requirements."
    ],
    "activities": [
      {
        "id": "d29-a1",
        "type": "discover",
        "title": "Testing Strategy Map",
        "instruction": "Map tests to application layers.",
        "content": {
          "concept": "A capstone testing strategy can combine unit, integration, API, and end-to-end tests according to the system's risks and requirements.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-map"
        }
      },
      {
        "id": "d29-a2",
        "type": "discover",
        "title": "Test Type Selector",
        "instruction": "Choose the appropriate test type.",
        "content": {
          "concept": "Different test types validate different boundaries, from individual methods to complete user workflows.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "selector-lab"
        }
      },
      {
        "id": "d29-a3",
        "type": "discover",
        "title": "Production Checklist",
        "instruction": "Build the project readiness checklist.",
        "content": {
          "concept": "Production readiness can include testing, security, configuration, documentation, logging, error handling, and deployment verification.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d29-a4",
        "type": "discover",
        "title": "Optimization Lab",
        "instruction": "Adjust the application performance factors.",
        "content": {
          "concept": "Performance improvements can target database queries, algorithms, network calls, resource usage, and application configuration.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "slider"
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
    "curriculum": "Java",
    "day": 30,
    "topic": "Capstone Demonstration, Review, and Future Enhancements",
    "version": 1,
    "learningMode": "interactive_deck",
    "learningObjectives": [
      "Present the architecture, features, and technical decisions of a Java capstone project.",
      "Review the project against functionality, quality, security, and deployment requirements.",
      "Identify realistic improvements and future development opportunities."
    ],
    "activities": [
      {
        "id": "d30-a1",
        "type": "discover",
        "title": "Capstone Architecture Review",
        "instruction": "Explore the completed system architecture.",
        "content": {
          "concept": "A capstone review connects requirements, architecture, implementation, integrations, and deployment into one complete system view.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "architecture"
        }
      },
      {
        "id": "d30-a2",
        "type": "discover",
        "title": "Demo Flow Builder",
        "instruction": "Build the ideal project demonstration flow.",
        "content": {
          "concept": "An effective technical demonstration can progress from the problem and architecture to key features, implementation, testing, and deployment.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "build"
        }
      },
      {
        "id": "d30-a3",
        "type": "discover",
        "title": "Quality Review",
        "instruction": "Match project areas with review checks.",
        "content": {
          "concept": "Final review can examine functionality, code quality, security, testing, performance, documentation, and deployment readiness.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "match"
        }
      },
      {
        "id": "d30-a4",
        "type": "discover",
        "title": "Future Roadmap",
        "instruction": "Arrange enhancements into a roadmap.",
        "content": {
          "concept": "A development roadmap organizes future improvements such as new features, scalability work, integrations, performance enhancements, and maintenance.",
          "tip": "Interact with the example first. Your progress is saved for this session."
        },
        "interaction": {
          "mode": "semantic-order"
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
    "frontend", "src", "features", "learning", "interactive", "data", "java"
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
