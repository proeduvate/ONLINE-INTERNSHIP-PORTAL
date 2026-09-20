const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/lsrin/OneDrive/Desktop/projects/ONLINE-INTERNSHIP-PORTAL/frontend/src/pages/Dashboard/InternDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/"Progress & Certificate"/g, '"Progress"');
content = content.replace(/"Progress & Certificate",/g, '"Progress",');
content = content.replace(/label: "Progress & Certificate"/g, 'label: "Progress"');
content = content.replace(/\/intern\/progress-and-certificate/g, '/intern/progress');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
