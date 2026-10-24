import re

file_path = 'src/pages/breakout-rooms/BreakoutRooms.css'
with open(file_path, 'r', encoding='utf-8') as f:
    css = f.read()

replacements = [
    (r'color:\s*#313338;', 'color: var(--text-primary, #ffffff);'),
    (r'color:\s*#4e5058;', 'color: var(--text-primary, #ffffff);'),
    (r'color:\s*#060607;', 'color: var(--text-primary, #ffffff);'),
    (r'color:\s*#5c5e66;', 'color: var(--text-secondary, #94a3b8);'),
    (r'color:\s*#80848e;', 'color: var(--text-muted, #64748b);'),
    (r'background-color:\s*#e3e5e8;', 'background-color: var(--card-bg, #0f172a);'),
    (r'background-color:\s*#f2f3f5;', 'background-color: var(--bg-surface-elevated, #1e293b);'),
    (r'background-color:\s*#ebedef;', 'background-color: var(--bg-surface, #334155);'),
    (r'background-color:\s*#f8f9fa;', 'background-color: var(--bg-light, #020617);'),
    (r'background-color:\s*#313338;', 'background-color: var(--text-primary, #ffffff);'),
    (r'background-color:\s*rgba\(255,255,255,0\.85\);', 'background-color: var(--bg-surface-elevated, rgba(15,23,42,0.85));'),
    (r'border-right:\s*1px solid #d3d4d5;', 'border-right: 1px solid var(--border-color, #334155);'),
    (r'border-right:\s*1px solid #e3e5e8;', 'border-right: 1px solid var(--border-color, #334155);'),
    (r'border-left:\s*1px solid #e3e5e8;', 'border-left: 1px solid var(--border-color, #334155);'),
    (r'border-bottom:\s*1px solid #e3e5e8;', 'border-bottom: 1px solid var(--border-color, #334155);'),
    (r'border-top:\s*1px solid #e3e5e8;', 'border-top: 1px solid var(--border-color, #334155);'),
    (r'border:\s*1px solid #d3d4d5;', 'border: 1px solid var(--border-color, #334155);'),
    (r'background-color:\s*#d3d4d5;', 'background-color: var(--border-color, #334155);')
]

for pattern, repl in replacements:
    css = re.sub(pattern, repl, css)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS Fixed")
