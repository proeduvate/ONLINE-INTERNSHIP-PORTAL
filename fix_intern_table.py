import re

filepath = "frontend/src/pages/Dashboard/InternDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="data-table"', 'className="table"')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Changed data-table to table in InternDashboard")
