import re

# 1. Update AdminDashboard.jsx
filepath_admin = "frontend/src/pages/Dashboard/AdminDashboard.jsx"
if __import__("os").path.exists(filepath_admin):
    with open(filepath_admin, 'r', encoding='utf-8') as f:
        content_admin = f.read()
    
    component_code = """
export function AdminCertificateApprovals() {
  const [pendingCerts, setPendingCerts] = React.useState([]);

  React.useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get("/api/certificates/pending");
      setPendingCerts(res.data);
    } catch (err) {
      console.error("Failed to load pending certificates", err);
    }
  };

  const handleAction = async (certId, action) => {
    try {
      await api.post(`/api/certificates/${certId}/${action}`);
      alert(`Certificate ${action}d successfully!`);
      fetchPending();
    } catch (err) {
      alert(`Failed to ${action} certificate.`);
    }
  };

  return (
    <div className="card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Award size={20} color="#F59E0B" />
        <h3 style={{ margin: 0 }}>Pending Certificate Approvals</h3>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Intern Name</th>
              <th>Domain</th>
              <th>Achievement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingCerts.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "16px" }}>No pending requests</td></tr>
            ) : (
              pendingCerts.map((cert) => (
                <tr key={cert.id}>
                  <td>{cert.intern_name}</td>
                  <td>{cert.domain}</td>
                  <td><span className="badge" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>{cert.achievement || "N/A"}</span></td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => handleAction(cert.certificate_id, 'approve')} 
                      className="btn btn-primary" 
                      style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Check size={14} /> Approve & Mail
                    </button>
                    <button 
                      onClick={() => handleAction(cert.certificate_id, 'reject')} 
                      className="btn btn-secondary" 
                      style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#FEE2E2", color: "#DC2626", borderColor: "#FEE2E2" }}
                    >
                      <X size={14} /> Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

    if "export function AdminCertificateApprovals" not in content_admin:
        # Add imports if missing
        if "Check" not in content_admin:
            content_admin = content_admin.replace("import { LayoutDashboard", "import { Check, X, Award, LayoutDashboard")
        
        imports_idx = content_admin.find("export default function AdminDashboard")
        content_admin = content_admin[:imports_idx] + component_code + "\n" + content_admin[imports_idx:]

    # Replace the Credentials case entirely
    cred_pattern = r'case "Credentials":\s*return \(\s*<div className="card">.*?</div>\s*\);\s*(?=case "Tickets":|default:)'
    # Sometimes it doesn't match perfectly if there are nested divs. Let's just do a manual replace.
    # Alternatively, just inject it at the top of the Overview tab for MentorDashboard.
    content_admin = re.sub(r'(case "Credentials":\s*return \(\s*)(<div className="card">.*?(?:<button[^>]*>Generate PDF</button>\s*</td>\s*</tr>\s*</tbody>\s*</table>\s*</div>\s*</div>))', r'\1<AdminCertificateApprovals />', content_admin, flags=re.DOTALL)

    with open(filepath_admin, 'w', encoding='utf-8') as f:
        f.write(content_admin)
    print("Updated AdminDashboard")

# 2. Update MentorDashboard.jsx
filepath_mentor = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath_mentor, 'r', encoding='utf-8') as f:
    content_mentor = f.read()

# Inject into the Mentor Overview right before the closing tag of the main Overview fragment
mentor_overview_end = r'(<div className="card" style={{ margin: 0, paddingBottom: 0 }}>\s*<h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Review Backlog Tracker</h3>.*?</ResponsiveContainer>\s*</div>\s*<div className="card" style={{ margin: 0, backgroundColor: "#fff1f2", borderColor: "#ffe4e6" }}>.*?</div>\s*</div>)'
content_mentor = re.sub(mentor_overview_end, r'\1\n              <AdminCertificateApprovals />\n', content_mentor, flags=re.DOTALL)

with open(filepath_mentor, 'w', encoding='utf-8') as f:
    f.write(content_mentor)
print("Updated MentorDashboard")
