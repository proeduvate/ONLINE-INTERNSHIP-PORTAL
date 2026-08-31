import os

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'styles/Dashboard.css' in content or '../Dashboard/Dashboard.css' in content:
                print(f"Fixing {filepath}")
                # We know Dashboard.css is at frontend/src/pages/Dashboard/Dashboard.css
                # Calculate relative path
                depth = filepath.count(os.sep) - 1 # from frontend/src
                # Let's just do a naive replace based on known files
                if "AdminDashboard" in filepath or "InternDashboard" in filepath or "MentorDashboard" in filepath or "InternDetails" in filepath or "Taskpage" in filepath:
                    content = content.replace('../../styles/Dashboard.css', './Dashboard.css')
                    content = content.replace('../styles/Dashboard.css', './Dashboard.css')
                    content = content.replace('../Dashboard/Dashboard.css', './Dashboard.css')
                elif "Home" in filepath:
                    content = content.replace('../../styles/Dashboard.css', '../Dashboard/Dashboard.css')
                    content = content.replace('../Dashboard/Dashboard.css', '../Dashboard/Dashboard.css')
                elif "DailyScenarioCalendar" in filepath:
                    content = content.replace('../../styles/Dashboard.css', '../../pages/Dashboard/Dashboard.css')
                    content = content.replace('../Dashboard/Dashboard.css', '../../pages/Dashboard/Dashboard.css')

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
