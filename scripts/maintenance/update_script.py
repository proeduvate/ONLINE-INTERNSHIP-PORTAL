import re

path = 'frontend/src/pages/admin/onboarding/AdminOnboardingDetails.js'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("import axios from 'axios';", "import api from '../../../api/axios';")
content = content.replace("axios.get(`http://127.0.0.1:8000/api/v1/users?role=mentor`)", "api.get(`/users?role=mentor`)")
content = content.replace("axios.get(`http://127.0.0.1:8000", "api.get(`")
content = content.replace("axios.post(`http://127.0.0.1:8000", "api.post(`")

with open(path, 'w') as f:
    f.write(content)
