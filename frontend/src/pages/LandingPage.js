import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css"; // Reuse general variables, buttons, card classes

export default function LandingPage() {
  const navigate = useNavigate();
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!applicationId) return;
    navigate("/onboarding/status");
  };

  // Technology Domains data
  const domains = [
    { title: "Artificial Intelligence", desc: "Build smart algorithms and deep learning models.", count: "14 Interns", duration: "12 Weeks" },
    { title: "Data Science", desc: "Analyze raw data and extract meaningful insights.", count: "12 Interns", duration: "8 Weeks" },
    { title: "Cyber Security", desc: "Learn network safety, cryptography, and defense tactics.", count: "8 Interns", duration: "10 Weeks" },
    { title: "Web Development", desc: "Create high-performance modern web applications.", count: "10 Interns", duration: "8 Weeks" },
    { title: "UI UX Design", desc: "Design stunning interfaces and user experiences.", count: "6 Interns", duration: "6 Weeks" },
  ];

  return (
    <div style={{ backgroundColor: "#F5F7FA", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Navigation Bar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 80px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "55px" }} />
        </div>
        <div style={{ display: "flex", gap: "32px", fontSize: "14px", fontWeight: 500 }}>
          <a href="#features" style={{ color: "#1F2937" }}>Features</a>
          <a href="#domains" style={{ color: "#1F2937" }}>Domains</a>
          <a href="#stats" style={{ color: "#1F2937" }}>Statistics</a>
          <a href="#contact" style={{ color: "#1F2937" }}>Contact</a>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button style={{ background: "transparent", border: "none", color: "#4B5563", fontWeight: 600, cursor: "pointer", marginRight: "8px" }} onClick={() => setShowTrackModal(true)}>Track Application</button>
          <button className="btn btn-secondary" onClick={() => navigate("/login")}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate("/onboarding/apply")}>Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        padding: "100px 80px",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        borderBottom: "1px solid #E5E7EB"
      }}>
        <h1 style={{ fontSize: "48px", fontWeight: 800, color: "#1F2937", marginBottom: "20px", lineHeight: "1.2" }}>
          Next-Gen <span style={{ color: "#2563EB" }}>Proeduvate</span> Internship & Evaluation Platform
        </h1>
        <p style={{ fontSize: "18px", color: "#6B7280", maxWidth: "800px", margin: "0 auto 32px auto", lineHeight: "1.6" }}>
          Empower interns with automated AI code evaluations, personalized mentor guidance, curated learning paths, and robust portfolio-building tools.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "16px" }} onClick={() => navigate("/login")}>
            Explore Portal
          </button>
          <a href="#features" className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: "16px" }}>
            Learn More
          </a>
        </div>
      </header>

      {/* Platform Features */}
      <section id="features" style={{ padding: "80px 80px", borderBottom: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#1F2937", textAlign: "center", marginBottom: "48px" }}>
          Key Features
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ color: "#2563EB" }}>AI Code Evaluation</h3>
            <p>Get instant performance, logic, and structure ratings from our built-in AI assistant compiler.</p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ color: "#2563EB" }}>Curated Learning Paths</h3>
            <p>Access domain-specific video resources, PDF notes, and structured daily assessments.</p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ color: "#2563EB" }}>1-on-1 Mentor Guidance</h3>
            <p>Receive scheduled reviews, personalized chat assistance, and code remarks from certified mentors.</p>
          </div>
        </div>
      </section>

      {/* Technology Domains */}
      <section id="domains" style={{ padding: "80px 80px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#1F2937", textAlign: "center", marginBottom: "48px" }}>
          Technology Domains
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          {domains.map((dom, index) => (
            <div key={index} className="card" style={{ margin: 0, border: "1px solid #E5E7EB" }}>
              <h4 style={{ fontWeight: 600, fontSize: "16px", color: "#1F2937", marginBottom: "8px" }}>{dom.title}</h4>
              <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>{dom.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "#2563EB" }}>
                <span>{dom.duration}</span>
                <span>{dom.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section id="stats" style={{ padding: "80px 80px", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px", textAlign: "center" }}>
          <div>
            <h3 style={{ fontSize: "40px", fontWeight: 800, color: "#2563EB", marginBottom: "8px" }}>50+</h3>
            <p style={{ fontWeight: 600, color: "#1F2937" }}>Active Interns</p>
          </div>
          <div>
            <h3 style={{ fontSize: "40px", fontWeight: 800, color: "#2563EB", marginBottom: "8px" }}>10+</h3>
            <p style={{ fontWeight: 600, color: "#1F2937" }}>Certified Mentors</p>
          </div>
          <div>
            <h3 style={{ fontSize: "40px", fontWeight: 800, color: "#2563EB", marginBottom: "8px" }}>1200+</h3>
            <p style={{ fontWeight: 600, color: "#1F2937" }}>AI Evaluations</p>
          </div>
          <div>
            <h3 style={{ fontSize: "40px", fontWeight: 800, color: "#2563EB", marginBottom: "8px" }}>98%</h3>
            <p style={{ fontWeight: 600, color: "#1F2937" }}>Completion Rate</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 80px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#1F2937", textAlign: "center", marginBottom: "48px" }}>
          What Our Interns Say
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          <div className="card" style={{ margin: 0 }}>
            <p style={{ fontStyle: "italic", marginBottom: "16px" }}>
              "The AI feedback loop was incredibly fast. I could adjust my code quality, security metrics, and logic in real-time before my mentor reviewed it."
            </p>
            <h4 style={{ fontWeight: 600, fontSize: "14px", color: "#1F2937" }}>Sarah Jenkins</h4>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>AI Intern</span>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <p style={{ fontStyle: "italic", marginBottom: "16px" }}>
              "The structured curriculum kept me focused every day. I generated a full portfolio of tasks that I can now share with prospective recruiters."
            </p>
            <h4 style={{ fontWeight: 600, fontSize: "14px", color: "#1F2937" }}>David Kim</h4>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>Full Stack Web Intern</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: "80px 80px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#1F2937", marginBottom: "16px" }}>
          Get in Touch
        </h2>
        <p style={{ color: "#6B7280", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>
          Have questions about the program? Contact our support team for registration queries and enterprise setups.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <p>📧 <b>support@internportal.com</b></p>
          <p>📞 <b>+1 (555) 019-2834</b></p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px 80px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E5E7EB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px",
        color: "#6B7280"
      }}>
        <div>© 2026 AI Internship Evaluation Portal. All rights reserved.</div>
        <div style={{ display: "flex", gap: "24px" }}>
          <a href="#privacy" style={{ color: "#6B7280" }}>Privacy Policy</a>
          <a href="#terms" style={{ color: "#6B7280" }}>Terms of Service</a>
        </div>
      </footer>

      {/* Track Application Modal */}
      {showTrackModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div className="card" style={{ width: "400px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Track Application Status</h3>
              <button onClick={() => { setShowTrackModal(false); setApplicationId(""); }} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>&times;</button>
            </div>
            
            <form onSubmit={handleTrackSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", fontWeight: 600 }}>Application ID</label>
                <input className="form-control" type="text" placeholder="e.g. APP-2026-00125" value={applicationId} onChange={(e) => setApplicationId(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "8px", padding: "10px" }}>Check Status</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
