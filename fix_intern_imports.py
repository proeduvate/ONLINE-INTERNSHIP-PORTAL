import os

filepath_intern = "frontend/src/pages/Dashboard/InternDashboard.jsx"
with open(filepath_intern, 'r', encoding='utf-8') as f:
    content_intern = f.read()

if "import { Award, Clock, Download } from \"lucide-react\";" not in content_intern:
    content_intern = content_intern.replace('import api from "../../api/axios";', 'import api from "../../api/axios";\nimport { Award, Clock, Download } from "lucide-react";')
    with open(filepath_intern, 'w', encoding='utf-8') as f:
        f.write(content_intern)
    print("Fixed InternDashboard missing lucide-react imports.")
