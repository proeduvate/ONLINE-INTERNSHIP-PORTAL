import os
import re

replacements = {
    "A,?o": "📚",
    "A,?": "👥",
    "A,": "📋",
    "A,?": "🎓",  # Wait, this might conflict
    "A,?": "🎁",
    "AŸŽ": "🎁",
    "AŸ“š": "📚",
    "AŸ‘¥": "👥",
    "AŸ“‹": "📋",
    "AŸŽ“": "🎓",
    "AŸ”Ž": "🔍",
    "ðŸ“š": "📚",
    "ðŸ‘¥": "👥",
    "ðŸ“‹": "📋",
    "ðŸŽ“": "🎓",
    "ðŸŽ": "🎁",
    "ðŸ”Ž": "🔍",
    "ðŸ’¼": "💼",
    "ðŸ”§": "🔧",
    "âš™ï¸": "⚙️",
    "â˜Žï¸": "☎️",
    "ðŸ“š": "📚",
    "ðŸ“ˆ": "📈",
    "ðŸŽ“": "🎓",
    "ðŸ”§": "🔧",
    "ðŸ’¡": "💡",
    "âœ…": "✅",
    "ðŸš€": "🚀",
    "ðŸ“Š": "📊",
    "ðŸ¤": "🤝",
    "âš™ï¸": "⚙️",
    "ðŸ“…": "📅",
    "ðŸ’¬": "💬",
    "ðŸŽ‰": "🎉",
    "ðŸ“£": "📢",
    "ðŸ”—": "🔗",
    "ðŸŒŸ": "🌟",
    "ðŸŽ": "🎁",
    "â˜Žï¸": "☎️",
}

def fix_mojibake(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # We need a more robust way to fix the sidebar. 
        # Since I can just replace the explicit icon fields:
        content = re.sub(r'icon:\s*".*?"', lambda m: m.group(0), content)
        
        for bad, good in replacements.items():
            content = content.replace(bad, good)
            
        # specifically fix the Mentor tabs
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Overview"', 'icon: "📚", label: "Overview"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Cohort"', 'icon: "👥", label: "Cohort"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Evaluations"', 'icon: "📋", label: "Evaluations"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Programs"', 'icon: "🎓", label: "Programs"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Bonus Airdrops"', 'icon: "🎁", label: "Bonus Airdrops"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Breakout Rooms"', 'icon: "🔍", label: "Breakout Rooms"', content)
        
        # fix admin tabs
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Dashboard"', 'icon: "📊", label: "Dashboard"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Users"', 'icon: "👥", label: "Users"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Tasks"', 'icon: "📋", label: "Tasks"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Support"', 'icon: "☎️", label: "Support"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Settings"', 'icon: "⚙️", label: "Settings"', content)
        
        # fix intern tabs
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"My Tasks"', 'icon: "📚", label: "My Tasks"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Certificates"', 'icon: "🎓", label: "Certificates"', content)
        content = re.sub(r'icon:\s*"[^"]*",\s*label:\s*"Support & Ticketing"', 'icon: "☎️", label: "Support & Ticketing"', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            fix_mojibake(os.path.join(root, file))
