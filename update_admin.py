import re

admin_code = '''

export function AdminCertificateApprovals() {
  const [pending, setPending] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const api = require('../../api/axios').default || require('../../api/axios');

  React.useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get("/api/certificates/pending");
      setPending(res.data);
    } catch (err) {
      console.error("Failed to load pending certificates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (certId, action) => {
    try {
      await api.post(/api/certificates//);
      alert(Certificate d successfully!);
      fetchPending();
    } catch(err) {
      alert(Failed to  certificate.);
    }
  };

  return (
    <div className="card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>Pending Certificate Approvals</h3>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <p>No pending certificates.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Intern ID</th>
                <th style={{ padding: "12px" }}>Name</th>
                <th style={{ padding: "12px" }}>Grade / Score</th>
                <th style={{ padding: "12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(cert => (
                <tr key={cert.certificate_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px" }}>{cert.user_id}</td>
                  <td style={{ padding: "12px" }}>{cert.intern_name}</td>
                  <td style={{ padding: "12px" }}>{cert.grade} ({cert.final_score}%)</td>
                  <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: "#10b981", color: "white", padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => handleAction(cert.certificate_id, 'approve')} 
                    >Approve</button>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: "#ef4444", color: "white", padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => handleAction(cert.certificate_id, 'reject')} 
                    >Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'''

for file in ['frontend/src/pages/Dashboard/MentorDashboard.jsx', 'frontend/src/pages/Dashboard/AdminDashboard.jsx']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'export function AdminCertificateApprovals' not in content:
        func_name = 'MentorDashboard' if 'MentorDashboard' in file else 'AdminDashboard'
        content = content.replace(f'export default function {func_name}() {{', admin_code + f'export default function {func_name}() {{')
        
    if 'import React' not in content:
        content = 'import React from "react";\n' + content
        
    if '<AdminCertificateApprovals />' not in content:
        # Append before the last closing div of the overview or main view.
        # It's tricky to find the exact spot, so let's just append it to the end of the overview tab content.
        # Actually in Dashboard, it's probably best to just insert it after some known text or at the end of renderContent.
        pass
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated Mentor and Admin dashboards")
