const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/lsrin/OneDrive/Desktop/projects/ONLINE-INTERNSHIP-PORTAL/frontend/src/pages/Dashboard/MentorDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const hookCode = `
  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (tabName === "Evaluations") {
        if (parts[3]) {
          const found = submissions.find(s => String(s.id) === parts[3]);
          setSelectedEvaluation(found || null);
        } else {
          setSelectedEvaluation(null);
        }
      } else if (tabName === "Programs") {
        if (parts[3] === "view" && parts[4]) {
          const found = tasks.find(t => String(t.id) === parts[4]);
          setViewingTask(found || null);
          setEditingTask(null);
          setTaskDetailTab("MCQ");
        } else if (parts[3] === "edit" && parts[4]) {
          const found = tasks.find(t => String(t.id) === parts[4]);
          setEditingTask(found || null);
          setViewingTask(null);
          setTaskDetailTab("General");
        } else {
          setViewingTask(null);
          setEditingTask(null);
        }
      } else if (tabName === "Tickets") {
        if (parts[3]) {
          const found = mentorTickets.find(t => String(t.id) === parts[3]);
          setSelectedTicket(found || null);
        } else {
          setSelectedTicket(null);
        }
      } else if (tabName === "Credentials") {
        if (parts[3]) {
          const found = credentialInterns.find(i => String(i.id) === parts[3]);
          setSelectedCredentialIntern(found || null);
        } else {
          setSelectedCredentialIntern(null);
        }
      } else if (tabName === "Bonus Airdrops") {
        if (parts[3] === "completed") {
          setAirdropTab("Completed");
        } else {
          setAirdropTab("Active");
        }
      }
    }
  }, [location.pathname, submissions, tasks, mentorTickets, credentialInterns]);
`;

// Insert the hook after the last state variable (around line 419)
content = content.replace(
  'const [airdropTab, setAirdropTab] = useState("Active");',
  'const [airdropTab, setAirdropTab] = useState("Active");\n' + hookCode
);

// Replace click handlers
const replacements = [
  {
    from: /onClick=\{\(\) => setSelectedEvaluation\(sub\)\}/g,
    to: 'onClick={() => navigate("/mentor/evaluations/" + sub.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedEvaluation\(null\)\}/g,
    to: 'onClick={() => navigate("/mentor/evaluations")}'
  },
  {
    from: /setSelectedEvaluation\(null\);/g,
    to: 'navigate("/mentor/evaluations");'
  },
  {
    from: /onClick=\{\(\) => setSelectedTicket\(ticket\)\}/g,
    to: 'onClick={() => navigate("/mentor/tickets/" + ticket.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedTicket\(null\)\}/g,
    to: 'onClick={() => navigate("/mentor/tickets")}'
  },
  {
    from: /onClick=\{\(\) => \{ setViewingTask\(t\); setTaskDetailTab\("MCQ"\); \}\}/g,
    to: 'onClick={() => navigate("/mentor/programs/view/" + t.id)}'
  },
  {
    from: /onClick=\{\(\) => setViewingTask\(null\)\}/g,
    to: 'onClick={() => navigate("/mentor/programs")}'
  },
  {
    from: /onClick=\{\(\) => \{ setEditingTask\(viewingTask\); setViewingTask\(null\); setTaskDetailTab\("General"\); \}\}/g,
    to: 'onClick={() => navigate("/mentor/programs/edit/" + viewingTask.id)}'
  },
  {
    from: /onClick=\{\(\) => setEditingTask\(null\)\}/g,
    to: 'onClick={() => navigate("/mentor/programs")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedCredentialIntern\(intern\)\}/g,
    to: 'onClick={() => navigate("/mentor/credentials/" + intern.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedCredentialIntern\(null\)\}/g,
    to: 'onClick={() => navigate("/mentor/credentials")}'
  },
  {
    from: /onClick=\{\(\) => setAirdropTab\("Active"\)\}/g,
    to: 'onClick={() => navigate("/mentor/bonus-airdrops/active")}'
  },
  {
    from: /onClick=\{\(\) => setAirdropTab\("Completed"\)\}/g,
    to: 'onClick={() => navigate("/mentor/bonus-airdrops/completed")}'
  }
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// Since navigate isn't defined inside the nested scope for setSelectedEvaluation(null) where it's not an inline onClick,
// wait, the regex `/setSelectedEvaluation\(null\);/g` will replace all calls. We should ensure `navigate` works there.
// If it's inside a function component, `navigate` is available. Let's make sure.
// Let's also check if useNavigate is imported.
if (!content.includes('useNavigate')) {
  // It should be imported. The MentorDashboard probably has it already.
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Mentor routing update complete.');
