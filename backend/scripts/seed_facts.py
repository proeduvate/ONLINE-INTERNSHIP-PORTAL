import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine, SessionLocal
from models import Base, DomainFact

Base.metadata.create_all(bind=engine)

def seed_facts():
    db = SessionLocal()
    
    if db.query(DomainFact).count() > 0:
        print("Facts already exist in the database. Clearing existing facts to re-seed...")
        from models import InternFactHistory
        db.query(InternFactHistory).delete()
        db.query(DomainFact).delete()
        db.commit()

    # Dictionary defining completely unique topics and phrases for each domain
    domain_data = {
        "Full Stack": {
            "topics": ["server-side rendering", "RESTful APIs", "NoSQL databases", "session management", "state management", "Docker containerization", "CI/CD pipelines", "authentication flows", "microservices architecture", "progressive web apps"],
            "phrases": [
                "{topic} is a critical skill for connecting frontend and backend systems.",
                "Mastering {topic} allows you to build scalable web applications.",
                "Modern full stack developers frequently utilize {topic} to optimize performance.",
                "Understanding {topic} is essential for secure data transmission.",
                "A deep knowledge of {topic} helps in debugging complex integration issues.",
                "Many enterprise applications rely heavily on {topic} for stability.",
                "Implementing {topic} correctly can significantly reduce server load."
            ]
        },
        "AIML": {
            "topics": ["neural networks", "gradient descent", "natural language processing", "computer vision", "reinforcement learning", "feature engineering", "hyperparameter tuning", "transfer learning", "generative adversarial networks", "predictive modeling"],
            "phrases": [
                "The concept of {topic} has revolutionized how machines learn from data.",
                "Optimizing {topic} is key to improving model accuracy.",
                "Research in {topic} is advancing the capabilities of artificial intelligence rapidly.",
                "Applying {topic} helps in solving complex, non-linear classification problems.",
                "A solid grasp of {topic} is necessary for building state-of-the-art algorithms.",
                "In the field of AI, {topic} is essential for handling unstructured data.",
                "The future of automation heavily depends on breakthroughs in {topic}."
            ]
        },
        "Database Management": {
            "topics": ["ACID properties", "database normalization", "indexing strategies", "query optimization", "sharding", "replication", "transaction isolation levels", "B-tree data structures", "relational algebra", "connection pooling"],
            "phrases": [
                "Understanding {topic} is fundamental to ensuring data integrity.",
                "Proper use of {topic} dramatically speeds up data retrieval.",
                "Database administrators use {topic} to prevent bottlenecks in high-traffic applications.",
                "Implementing {topic} correctly prevents data anomalies during concurrent operations.",
                "A deep dive into {topic} is required for designing scalable database architectures.",
                "Mastering {topic} allows for more efficient storage and memory usage.",
                "Many modern databases implement {topic} behind the scenes for fault tolerance."
            ]
        },
        "Testing": {
            "topics": ["test-driven development", "behavior-driven development", "mocking frameworks", "integration testing", "end-to-end testing", "code coverage metrics", "regression testing", "mutation testing", "fuzz testing", "automated test pipelines"],
            "phrases": [
                "Adopting {topic} significantly reduces the number of bugs shipped to production.",
                "Understanding {topic} is critical for maintaining a stable software lifecycle.",
                "Quality assurance teams rely on {topic} to validate complex user flows.",
                "Implementing {topic} helps developers refactor legacy code with confidence.",
                "A strong focus on {topic} ensures that edge cases are properly handled.",
                "Mastering {topic} allows teams to deploy software continuously and safely.",
                "The principles of {topic} are foundational to reliable software engineering."
            ]
        },
        "Product Developer": {
            "topics": ["user story mapping", "agile methodologies", "minimum viable product (MVP)", "product-market fit", "A/B testing", "user journey analysis", "rapid prototyping", "feature prioritization", "customer feedback loops", "sprint planning"],
            "phrases": [
                "Focusing on {topic} helps align engineering efforts with business goals.",
                "Understanding {topic} is crucial for delivering value to the end user quickly.",
                "Successful product developers use {topic} to validate assumptions early.",
                "Implementing {topic} correctly minimizes the risk of building unwanted features.",
                "A deep understanding of {topic} fosters better collaboration with stakeholders.",
                "Mastering {topic} allows for more effective iterations on product design.",
                "Many successful startups credit their growth to rigorous {topic}."
            ]
        },
        "Data Engineering": {
            "topics": ["ETL pipelines", "data warehousing", "data lakes", "stream processing", "batch processing", "Apache Kafka", "distributed computing", "data modeling", "workflow orchestration", "data governance"],
            "phrases": [
                "Designing robust {topic} is essential for handling big data efficiently.",
                "Understanding {topic} is critical for transforming raw data into actionable insights.",
                "Data engineers rely on {topic} to ensure data availability and reliability.",
                "Implementing {topic} allows organizations to scale their analytics capabilities.",
                "A strong grasp of {topic} is necessary for managing complex data ecosystems.",
                "Mastering {topic} helps in minimizing latency in real-time reporting.",
                "The modern data stack is built heavily upon the principles of {topic}."
            ]
        },
        "Backend": {
            "topics": ["RESTful API design", "caching mechanisms", "message queues", "database connection management", "authentication protocols", "load balancing", "serverless computing", "GraphQL", "rate limiting", "background job processing"],
            "phrases": [
                "Mastering {topic} is crucial for building highly available server architectures.",
                "Understanding {topic} helps backend engineers optimize response times.",
                "Implementing {topic} correctly prevents servers from being overwhelmed by traffic.",
                "A deep dive into {topic} is required for secure communication between services.",
                "Many scalable backend systems rely on {topic} for decoupling components.",
                "Focusing on {topic} ensures that applications can handle thousands of concurrent users.",
                "The foundation of a robust API heavily depends on {topic}."
            ]
        },
        "Cyber Security": {
            "topics": ["penetration testing", "cryptographic hashing", "cross-site scripting (XSS)", "SQL injection prevention", "zero-trust architecture", "network firewalls", "intrusion detection systems", "public key infrastructure (PKI)", "social engineering defense", "vulnerability scanning"],
            "phrases": [
                "A solid understanding of {topic} is essential for protecting sensitive user data.",
                "Implementing {topic} correctly defends against common malicious attacks.",
                "Cyber security experts use {topic} to identify and patch system vulnerabilities.",
                "Awareness of {topic} is critical for developing secure software from the ground up.",
                "Mastering {topic} helps organizations comply with strict data protection regulations.",
                "The evolving landscape of threats makes {topic} more important than ever.",
                "Many massive data breaches could have been prevented with proper {topic}."
            ]
        },
        "Data Visualization": {
            "topics": ["dashboard design", "interactive charts", "geospatial mapping", "color theory in data", "D3.js libraries", "time-series graphs", "data storytelling", "accessibility in charts", "exploratory data analysis", "infographic principles"],
            "phrases": [
                "Applying {topic} makes complex datasets immediately understandable to stakeholders.",
                "Understanding {topic} is critical for highlighting trends and outliers effectively.",
                "Data visualization experts use {topic} to craft compelling narratives.",
                "Implementing {topic} ensures that visual representations are not misleading.",
                "A deep knowledge of {topic} helps in choosing the right chart for the right data.",
                "Mastering {topic} allows users to interactively explore multidimensional data.",
                "The impact of a presentation often relies heavily on effective {topic}."
            ]
        },
        "Frontend": {
            "topics": ["virtual DOM", "CSS Grid and Flexbox", "responsive web design", "web accessibility (a11y)", "state management libraries", "single-page applications (SPAs)", "browser rendering engines", "cross-browser compatibility", "service workers", "component-based architecture"],
            "phrases": [
                "Mastering {topic} is essential for creating smooth, interactive user interfaces.",
                "Understanding {topic} helps frontend developers optimize page load speeds.",
                "Implementing {topic} correctly ensures that websites work seamlessly on any device.",
                "A strong focus on {topic} provides a better experience for all users, including those with disabilities.",
                "Many modern web frameworks are built around the concept of {topic}.",
                "A deep dive into {topic} is required to master modern JavaScript ecosystems.",
                "The visual polish of an application heavily depends on a solid grasp of {topic}."
            ]
        },
        "Human Resource Management": {
            "topics": ["talent acquisition strategies", "employee retention programs", "performance appraisal systems", "workplace diversity and inclusion", "conflict resolution", "compensation benchmarking", "onboarding processes", "employee engagement surveys", "HR analytics", "labor law compliance"],
            "phrases": [
                "Effective {topic} is crucial for building a high-performing company culture.",
                "Understanding {topic} helps organizations attract and keep top talent.",
                "HR professionals rely on {topic} to align workforce capabilities with business goals.",
                "Implementing {topic} correctly minimizes turnover and boosts morale.",
                "A solid foundation in {topic} is necessary for navigating complex workplace dynamics.",
                "Mastering {topic} allows HR to make data-driven decisions about human capital.",
                "The long-term success of any company depends heavily on strategic {topic}."
            ]
        },
        "Cloud Technologies": {
            "topics": ["Infrastructure as Code (IaC)", "serverless functions", "auto-scaling groups", "cloud-native architecture", "container orchestration (Kubernetes)", "multi-cloud strategies", "elastic block storage", "identity and access management (IAM)", "virtual private clouds (VPCs)", "cloud cost optimization"],
            "phrases": [
                "Understanding {topic} is essential for designing resilient and highly available systems.",
                "Mastering {topic} allows organizations to scale resources dynamically based on demand.",
                "Cloud architects rely on {topic} to ensure secure and isolated networking environments.",
                "Implementing {topic} significantly reduces the operational overhead of managing servers.",
                "A deep knowledge of {topic} is required to prevent unexpected spikes in cloud billing.",
                "Many modern enterprises use {topic} to deploy applications globally in minutes.",
                "The shift to the cloud is driven by the flexibility and power of {topic}."
            ]
        }
    }

    facts_inserted = 0
    all_generated_facts = []

    # 8 Generic phrases that apply to any technical topic to expand combinations to 150 per domain
    generic_phrases = [
        "Consistently applying {topic} is a hallmark of senior professionals.",
        "When interviewing for a role, discussing {topic} can set you apart.",
        "The tech community places a high value on mastering {topic}.",
        "Many recent technological advancements have roots in {topic}.",
        "To build robust systems, one must deeply comprehend {topic}.",
        "Companies are increasingly looking for experts skilled in {topic}.",
        "A common pitfall for juniors is ignoring the intricacies of {topic}.",
        "Investing time in {topic} yields high dividends in career growth."
    ]

    for domain, data in domain_data.items():
        topics = data["topics"]
        # Add generic phrases to get 15 total phrases * 10 topics = 150 facts
        phrases = data["phrases"] + generic_phrases
        
        # 10 topics * 7 phrases = exactly 150 unique facts per domain
        for topic in topics:
            for phrase in phrases:
                fact_text = phrase.format(topic=topic)
                # Capitalize the first letter if it starts with the topic
                if fact_text.startswith(topic):
                    fact_text = fact_text.replace(topic, topic.capitalize(), 1)
                
                fact = DomainFact(
                    domain=domain,
                    fact=fact_text
                )
                db.add(fact)
                facts_inserted += 1
                
                # Also save to a list to write to a JSON file for manager review
                all_generated_facts.append({
                    "domain": domain,
                    "fact": fact_text
                })

    db.commit()
    print(f"Successfully seeded {facts_inserted} domain-specific facts (150 per domain).")
    db.close()

    # Write the facts to a JSON file so they are visible in the codebase
    import json
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "domain_facts_list.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_generated_facts, f, indent=4)
    print(f"Also saved all {facts_inserted} facts to {json_path} for review.")

if __name__ == "__main__":
    seed_facts()
