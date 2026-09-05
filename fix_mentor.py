import re

filepath = "frontend/src/pages/Dashboard/MentorDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

component_code = """
export function AdminCertificateApprovals() {
  const [pendingCerts, setPendingCerts] = useState([]);

  useEffect(() => {
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

if "export function AdminCertificateApprovals" not in content:
    # Insert at top below imports
    imports_idx = content.find("export default function MentorDashboard")
    content = content[:imports_idx] + component_code + "\n" + content[imports_idx:]

    # Ensure Check, X, Award exist in imports
    if "Check," not in content:
        content = content.replace("import { LayoutDashboard,", "import { LayoutDashboard, Check, X, Award,")

    # Add to Overview tab right before <div className="card"> (Recent Submissions)
    overview_pattern = r'(<div className="card">\s*<h3>Recent Submissions</h3>)'
    content = re.sub(overview_pattern, r'<AdminCertificateApprovals />\n              \1', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MentorDashboard.jsx")
