import re

filepath = "frontend/src/pages/Dashboard/InternDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

component_code = """
export function InternCertificateCard({ user }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally fetch if they already requested it
    api.get("/api/users/me").then(res => {
      // If we had a way to fetch the single cert for the current user
      // For now, we rely on the request state.
    }).catch(console.error);
  }, []);

  const handleRequestCertificate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/certificates/request", {
        duration: "3 Months", 
        achievement: "Top 10% Performer",
        grade: "A",
        final_score: 95
      });
      setCert(res.data);
      alert("Certificate requested successfully! Awaiting Admin approval.");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to request certificate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Award size={24} color="#4F46E5" />
        <h3 style={{ margin: 0 }}>Internship Certificate</h3>
      </div>
      
      {!cert && (
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          You have completed all program requirements. You can now request your official certificate of completion.
        </p>
      )}
      
      {cert?.status === "PENDING_ADMIN_APPROVAL" && (
        <div className="alert alert-warning" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Clock size={16} />
          <span>Your certificate is pending admin approval. You will receive an email once it is ready.</span>
        </div>
      )}

      {cert?.status === "APPROVED" && (
        <div className="alert alert-success">
          <p><strong>Status:</strong> Approved on {new Date(cert.issued_date).toLocaleDateString()}</p>
          <a href={`http://127.0.0.1:8000${cert.pdf_path}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
            <Download size={16} /> Download Certificate
          </a>
        </div>
      )}

      {!cert && (
        <button onClick={handleRequestCertificate} disabled={loading} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          {loading ? "Requesting..." : "Request Certificate"}
        </button>
      )}
    </div>
  );
}
"""

if "export function InternCertificateCard" not in content:
    # Insert at top below imports
    imports_idx = content.find("export default function InternDashboard")
    content = content[:imports_idx] + component_code + "\n" + content[imports_idx:]

    # Import Download
    if "Download" not in content:
        content = content.replace("import { LayoutDashboard", "import { Download, LayoutDashboard")

    # Add to Overview tab
    overview_pattern = r'(<div className="stat-card">.*?<span className="stat-desc">2 Pending</span>\s*</div>\s*</div>)'
    content = re.sub(overview_pattern, r'\1\n              <InternCertificateCard />\n', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated InternDashboard.jsx")
