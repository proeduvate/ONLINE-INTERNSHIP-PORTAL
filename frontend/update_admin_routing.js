const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/lsrin/OneDrive/Desktop/projects/ONLINE-INTERNSHIP-PORTAL/frontend/src/pages/Dashboard/AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const hookCode = `
  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (tabName === "Users") {
        if (parts[3] === "intern" && parts[4]) {
          const found = usersList.find(u => String(u.id) === parts[4]);
          setSelectedIntern(found || null);
          setSelectedMentor(null);
        } else if (parts[3] === "mentor" && parts[4]) {
          const found = usersList.find(u => String(u.id) === parts[4]);
          setSelectedMentor(found || null);
          setSelectedIntern(null);
        } else {
          setSelectedIntern(null);
          setSelectedMentor(null);
        }
      } else if (tabName === "Programs") {
        if (parts[3]) {
          // Decode URL component because domain names might have spaces
          setSelectedProgramDomain(decodeURIComponent(parts[3]));
        } else {
          setSelectedProgramDomain(null);
        }
      } else if (tabName === "Tickets") {
        if (parts[3]) {
          const found = ticketsList.find(t => String(t.id) === parts[3]);
          setSelectedTicket(found || null);
        } else {
          setSelectedTicket(null);
        }
      } else if (tabName === "Credentials") {
        if (parts[3]) {
          const found = adminCredentialInterns.find(i => String(i.id) === parts[3]);
          setSelectedAdminCredentialIntern(found || null);
        } else {
          setSelectedAdminCredentialIntern(null);
        }
      } else if (tabName === "Bonus Airdrops") {
        if (parts[3]) {
          const found = bonusAirdrops.find(a => String(a.id) === parts[3]);
          setSelectedAirdrop(found || null);
        } else {
          setSelectedAirdrop(null);
        }
      }
    }
  }, [location.pathname, usersList, ticketsList, adminCredentialInterns, bonusAirdrops]);
`;

// Insert the hook after the last state variable (around line 264)
content = content.replace(
  'const [assignMentorId, setAssignMentorId] = useState("");',
  'const [assignMentorId, setAssignMentorId] = useState("");\n' + hookCode
);

// Replace click handlers
const replacements = [
  {
    from: /onClick=\{\(\) => setSelectedIntern\(null\)\}/g,
    to: 'onClick={() => navigate("/admin/users")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedMentor\(null\)\}/g,
    to: 'onClick={() => navigate("/admin/users")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedIntern\(user\)\}/g,
    to: 'onClick={() => navigate("/admin/users/intern/" + user.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedMentor\(user\)\}/g,
    to: 'onClick={() => navigate("/admin/users/mentor/" + user.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedProgramDomain\(dom\.name\)\}/g,
    to: 'onClick={() => navigate("/admin/programs/" + encodeURIComponent(dom.name))}'
  },
  {
    from: /onClick=\{\(\) => setSelectedProgramDomain\(null\)\}/g,
    to: 'onClick={() => navigate("/admin/programs")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedTicket\(ticket\)\}/g,
    to: 'onClick={() => navigate("/admin/tickets/" + ticket.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedTicket\(null\)\}/g,
    to: 'onClick={() => navigate("/admin/tickets")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedAdminCredentialIntern\(intern\)\}/g,
    to: 'onClick={() => navigate("/admin/credentials/" + intern.id)}'
  },
  {
    from: /onClick=\{\(\) => setSelectedAdminCredentialIntern\(null\)\}/g,
    to: 'onClick={() => navigate("/admin/credentials")}'
  },
  {
    from: /onClick=\{\(\) => setSelectedAirdrop\(airdrop\)\}/g,
    to: 'onClick={() => navigate("/admin/bonus-airdrops/" + airdrop.id)}'
  },
  {
    from: /onBack=\{\(\) => setSelectedAirdrop\(null\)\}/g,
    to: 'onBack={() => navigate("/admin/bonus-airdrops")}'
  }
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

// also fix the one inside tab mapping
content = content.replace(
  'if (tab.id === "Bonus Airdrops") setSelectedAirdrop(null);',
  'if (tab.id === "Bonus Airdrops") navigate("/admin/bonus-airdrops");'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Admin routing update complete.');
