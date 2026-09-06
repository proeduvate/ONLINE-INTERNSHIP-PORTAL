import re

with open('frontend/src/pages/Dashboard/InternDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert InternCertificateCard
if 'export function InternCertificateCard' not in content:
    cert_code = '''

export function InternCertificateCard({ user }) {
  const [cert, setCert] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const api = require('../../api/axios').default || require('../../api/axios');

  React.useEffect(() => {
    api.get("/api/certificates/me").then(res => {
      setCert(res.data);
    }).catch(err => {
      // 404 means no certificate requested yet
    });
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
      setCert(res.data.certificate);
      alert("Certificate requested successfully! Awaiting Admin approval.");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to request certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cert || cert.status !== "APPROVED") return;
    try {
      const response = await api.get(/api/certificates//download, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ${cert.certificate_id}.pdf);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch(err) {
      alert("Failed to download certificate.");
    }
  };

  return (
    <div className="card" style={{ marginTop: "24px", background: "linear-gradient(to right, #4f46e5, #6366f1)", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0 }}>Internship Certificate</h3>
          {!cert ? (
            <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
              You have completed all program requirements. You can now request your official certificate of completion.
            </p>
          ) : (
            <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
              Status: <strong>{cert.status}</strong>
            </p>
          )}
        </div>
        <div>
          {!cert ? (
            <button 
              className="btn" 
              onClick={handleRequestCertificate} 
              disabled={loading}
              style={{ backgroundColor: "white", color: "#4f46e5", fontWeight: "bold" }}
            >
              {loading ? "Requesting..." : "Request Certificate"}
            </button>
          ) : cert.status === "APPROVED" ? (
            <button 
              className="btn" 
              onClick={handleDownload}
              style={{ backgroundColor: "white", color: "#4f46e5", fontWeight: "bold", display: "flex", gap: "8px", alignItems: "center" }}
            >
              <Download size={16} /> Download PDF
            </button>
          ) : (
            <button className="btn" disabled style={{ backgroundColor: "rgba(255,255,255,0.3)", color: "white" }}>
              Awaiting Approval
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'''
    content = content.replace('export default function InternDashboard() {', cert_code + 'export default function InternDashboard() {')

# 2. Insert React import if needed
if 'import React' not in content:
    content = 'import React from "react";\n' + content

# 3. Add <InternCertificateCard /> in Overview tab
if '<InternCertificateCard />' not in content:
    content = content.replace(
        '                  <span className="stat-desc">Last updated 1 hour ago</span>\n                </div>\n              </div>',
        '                  <span className="stat-desc">Last updated 1 hour ago</span>\n                </div>\n              </div>\n              <InternCertificateCard />'
    )

with open('frontend/src/pages/Dashboard/InternDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated InternDashboard.jsx")
