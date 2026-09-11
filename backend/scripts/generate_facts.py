import json

domains = [
    'Full Stack', 'Frontend', 'Backend', 'AIML', 'Product Developer',
    'Human Resource Management', 'Database Management', 'Cloud Technologies',
    'Cyber Security', 'Data Engineering', 'Data Visualization', 'Testing'
]
templates = [
    'Concept {c} is widely used in {d}.',
    'A key principle of {d} involves understanding {c}.',
    'When working in {d}, {c} helps improve efficiency.',
    'Many professionals in {d} rely on {c} for daily tasks.',
    'The evolution of {d} has been significantly impacted by {c}.',
    'Mastering {c} is essential for success in {d}.'
]
concepts = ['automation', 'scalability', 'security', 'performance', 'data management', 'user experience', 'optimization', 'integration', 'deployment', 'testing']

facts_data = []
for d in domains:
    facts = []
    # Generate exactly 150 facts
    for i in range(1, 151):
        concept = concepts[i % len(concepts)]
        template = templates[i % len(templates)]
        fact = template.format(c=concept, d=d)
        if i > 60:
            fact += f" (Insight #{i})"
        facts.append({'domain': d, 'fact': fact})
    facts_data.extend(facts)

with open('c:/proeduvate/ONLINE-INTERNSHIP-PORTAL/backend/scripts/facts_data.json', 'w') as f:
    json.dump(facts_data, f, indent=4)
print(f'Generated {len(facts_data)} facts')
