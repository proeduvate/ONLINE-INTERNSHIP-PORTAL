import os
filepath = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import React, { useState, useEffect } from "react";', 'import React, { useState, useEffect } from "react";\nimport api from "../../api/axios";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Imported api in MentorDashboard")
