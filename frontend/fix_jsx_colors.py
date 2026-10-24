import os, re

color_map = {
    '#313338': 'var(--text-primary)',
    '#4b4d54': 'var(--text-primary)',
    '#475569': 'var(--text-primary)',
    '#5c5e66': 'var(--text-secondary)',
    '#80848e': 'var(--text-muted)',
    '#f8f9fa': 'var(--bg-light)',
    '#ebedef': 'var(--bg-surface)',
    '#e3e5e8': 'var(--border-color)',
    '#d1d5db': 'var(--border-color)',
    '#d3d4d5': 'var(--border-color)',
    '#e2e8f0': 'var(--border-color)',
    '#ffffff': 'var(--bg-surface)',
    '#fff': 'var(--bg-surface)'
}

# we only replace if it's inside quotes for a style object
def replacer(match):
    quote = match.group(1)
    hex_color = match.group(2).lower()
    if hex_color in color_map:
        return f"{quote}{color_map[hex_color]}{quote}"
    # Wait, some #fff might be text color inside a red button. Let's not blindly replace #fff.
    if hex_color in ['#fff', '#ffffff']:
        return match.group(0) # Keep #fff as is to avoid breaking badge text color
    return match.group(0)

directory = 'src/pages/breakout-rooms'
for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith('.jsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Match 'color: "#313338"' or "backgroundColor: '#e3e5e8'" etc
            # Actually, just match any hex code in quotes if it matches our list
            new_content = re.sub(r'([\'"])(#[0-9a-fA-F]{3,6})\1', replacer, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Updated {f}")
