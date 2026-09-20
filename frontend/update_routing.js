const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/lsrin/OneDrive/Desktop/projects/ONLINE-INTERNSHIP-PORTAL/frontend/src/pages/Dashboard/InternDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add the useEffect hook right after line 347 (const [inputMsg, setInputMsg] = useState("");)
const hookCode = `
  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (tabName === "Learning") {
        if (parts[3] === "live-meetings") {
          setActiveLearningTab("Live Meetings");
        } else if (parts[3] === "ai-client") {
          setActiveLearningTab("AI Client");
        } else if (parts[3] === "reading-materials") {
          setActiveLearningTab("Reading Materials");
        }
      } else if (tabName === "Tickets") {
        if (parts[3] === "new") {
          setShowTicketForm(true);
          setSelectedTicket(null);
        } else if (parts[3]) {
          setShowTicketForm(false);
          const foundTicket = ticketsData.find(t => t.id === parts[3]);
          setSelectedTicket(foundTicket || null);
        } else {
          setShowTicketForm(false);
          setSelectedTicket(null);
        }
      } else if (tabName === "Progress & Certificate") {
        if (parts[3] === "certificate") {
          setShowCertificateView(true);
        } else {
          setShowCertificateView(false);
        }
      } else if (tabName === "Bonus Airdrops") {
        if (parts[3] === "completed") {
          setAirdropTab("Completed");
        } else {
          setAirdropTab("Active");
        }
      }
    }
  }, [location.pathname, ticketsData]);
`;

content = content.replace(
  'const [inputMsg, setInputMsg] = useState("");',
  'const [inputMsg, setInputMsg] = useState("");\n' + hookCode
);

// 2. Replace click handlers
const replacements = [
  {
    from: /onClick=\{\(\) => setActiveLearningTab\("Reading Materials"\)\}/g,
    to: 'onClick={() => navigate("/intern/learning/reading-materials")}'
  },
  {
    from: /onClick=\{\(\) => setActiveLearningTab\("Live Meetings"\)\}/g,
    to: 'onClick={() => navigate("/intern/learning/live-meetings")}'
  },
  {
    from: /onClick=\{\(\) => setActiveLearningTab\("AI Client"\)\}/g,
    to: 'onClick={() => navigate("/intern/learning/ai-client")}'
  },
  {
    from: /onClick=\{\(\) => setShowTicketForm\true\)\}/g,
    to: 'onClick={() => navigate("/intern/tickets/new")}'
  },
  {
    from: /onClick=\{\(\) => setShowTicketForm\(false\)\}/g,
    to: 'onClick={() => navigate("/intern/tickets")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedTicket\(selectedTicket\?\.id === ticket\.id \? null : ticket\)\}/g,
    to: 'onClick={() => navigate(selectedTicket?.id === ticket.id ? "/intern/tickets" : "/intern/tickets/" + ticket.id)}'
  },
  {
    from: /onClick=\{\(\) => setAirdropTab\("Active"\)\}/g,
    to: 'onClick={() => navigate("/intern/bonus-airdrops/active")}'
  },
  {
    from: /onClick=\{\(\) => setAirdropTab\("Completed"\)\}/g,
    to: 'onClick={() => navigate("/intern/bonus-airdrops/completed")}'
  },
  {
    from: /onClick=\{\(\) => setShowCertificateView\(false\)\}/g,
    to: 'onClick={() => navigate("/intern/progress-and-certificate")}'
  },
  {
    from: /onClick=\{\(\) => setShowCertificateView\(true\)\}/g,
    to: 'onClick={() => navigate("/intern/progress-and-certificate/certificate")}'
  },
  {
    from: /onClick=\{\(\) => setShowTicketForm\true\)\}/g, // double check
    to: 'onClick={() => navigate("/intern/tickets/new")}'
  },
  {
    from: /onClick=\{\(\) => setShowTicketForm\(true\)\}/g,
    to: 'onClick={() => navigate("/intern/tickets/new")}'
  }
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// also fix handleCreateTicket
content = content.replace(
  'setShowTicketForm(false);',
  'navigate("/intern/tickets");'
);

// fix handleTabClick edge case: we shouldn't necessarily override parts[3] on tab click, but navigate just pushes the base url.
// That is fine, it will reset to default view.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete.');
