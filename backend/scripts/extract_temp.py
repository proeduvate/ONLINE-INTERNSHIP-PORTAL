import json
import re
import os

with open(r'c:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend\learning\question_bank\uiux\temp.txt', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.strip()
text = re.sub(r'\}\s*\{', '},{', text)
text = f'[{text}]'

try:
    data = json.loads(text)
    for item in data:
        day = item['day']
        topic = item['topic']
        filename = f"day{day:02d}_{topic.lower().replace(' ', '_').replace('&', '').replace(',', '').replace('/', '_').replace('-', '_')}.json"
        filename = re.sub(r'_+', '_', filename)
        
        output_path = os.path.join(r'c:\proeduvate\ONLINE-INTERNSHIP-PORTAL\backend\learning\question_bank\uiux', filename)
        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(item, out, indent=2)
        print(f"Saved {output_path}")
except Exception as e:
    print(f"Error: {e}")
