import re

filepath = "frontend/src/pages/Dashboard/InternDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The grid div ends exactly here:
#                 </div>
#               </div>
# 
#               {/* Row 2: Meetings list */}

pattern = r'(<div className="stat-card">\s*<span className="stat-title">Attendance Rate</span>.*?</div>\s*</div>)'
replacement = r'\1\n              <InternCertificateCard />\n'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected InternCertificateCard into InternDashboard.jsx")
