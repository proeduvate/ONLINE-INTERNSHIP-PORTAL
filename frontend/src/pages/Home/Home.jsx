import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  LineChart, 
  Code2, 
  ShieldCheck, 
  Palette, 
  Cloud,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2
} from "lucide-react";
import "./Home.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: "", email: "", message: "" });
    }, 4000);
  };

  const tracks = [
    { 
      title: "Artificial Intelligence", 
      desc: "Build neural networks, deep learning models, and LLM-powered applications with automated AI feedback.", 
      duration: "12-Week Track", 
      cohorts: "14 Cohorts Active", 
      icon: Brain,
      color: "#2563eb"
    },
    { 
      title: "Data Science & Analytics", 
      desc: "Process enterprise datasets, perform predictive modeling and automated business intelligence scoring.", 
      duration: "8-Week Track", 
      cohorts: "12 Cohorts Active", 
      icon: LineChart,
      color: "#059669"
    },
    { 
      title: "Full-Stack Web Development", 
      desc: "Architect modern microservices, scalable REST APIs, and responsive React web applications.", 
      duration: "10-Week Track", 
      cohorts: "18 Cohorts Active", 
      icon: Code2,
      color: "#7c3aed"
    },
    { 
      title: "Cybersecurity & Defense", 
      desc: "Audit network infrastructure, perform vulnerability assessments, and implement cryptographic protocols.", 
      duration: "10-Week Track", 
      cohorts: "8 Cohorts Active", 
      icon: ShieldCheck,
      color: "#dc2626"
    },
    { 
      title: "UI / UX Product Design", 
      desc: "Craft high-fidelity design systems, user journeys, accessible components, and interactive prototypes.", 
      duration: "6-Week Track", 
      cohorts: "6 Cohorts Active", 
      icon: Palette,
      color: "#db2777"
    },
    { 
      title: "Cloud & DevOps Systems", 
      desc: "Automate CI/CD pipelines, manage Kubernetes clusters, and scale enterprise cloud infrastructure.", 
      duration: "8-Week Track", 
      cohorts: "10 Cohorts Active", 
      icon: Cloud,
      color: "#0891b2"
    },
  ];

  return (
    <div className="hs-corporate-page">
      
      {/* ==========================================
          SINGLE CENTERED MONOLITHIC HERO SECTION
         ========================================== */}
      <section className="hs-hero-section">
        <div className="hs-hero-centered-content hs-animate-fade" style={{ animationDelay: '0.1s' }}>
          <div className="hs-announcement-pill">
            <span style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></span>
            <span>The #1 Early Career Internship & Evaluation Platform</span>
          </div>

          <h1 className="hs-hero-title-centered">
            Accelerate Your Career with <span className="hs-hero-title-highlight">AI Mentorship</span>
          </h1>

          <p className="hs-hero-subtitle-centered">
            ProEduvate connects students with structured technology tracks, automated AI code evaluations, 1-on-1 mentor guidance, and verified credential badging.
          </p>
        </div>
      </section>

      {/* --- TRUST METRICS BANNER --- */}
      <section className="hs-trust-banner hs-animate-fade" style={{ animationDelay: '0.2s' }}>
        <div className="hs-trust-grid">
          <div className="hs-trust-item">
            <h4>50,000+</h4>
            <p>Active Students & Interns</p>
          </div>
          <div className="hs-trust-item">
            <h4>500+</h4>
            <p>Certified Corporate Mentors</p>
          </div>
          <div className="hs-trust-item">
            <h4>98%</h4>
            <p>Internship Completion Rate</p>
          </div>
          <div className="hs-trust-item">
            <h4>100%</h4>
            <p>Verified Credential Badges</p>
          </div>
        </div>
      </section>

      {/* --- INTERNSHIP TRACKS (ID: internship-tracks) --- */}
      <section id="internship-tracks" className="hs-section">
        <div className="hs-section-header hs-animate-fade" style={{ animationDelay: '0.3s' }}>
          <span className="hs-section-tag">Technology Tracks</span>
          <h2 className="hs-section-title">Industry-Guided Specialization Tracks</h2>
          <p className="hs-section-subtitle">
            Master high-demand domain skills through hands-on evaluation, automated feedback, and mentor reviews.
          </p>
        </div>

        <div className="hs-tracks-grid">
          {tracks.map((track, idx) => {
            const Icon = track.icon;
            return (
              <div key={idx} className="hs-track-card hs-animate-fade" style={{ animationDelay: `${0.1 * (idx + 1)}s` }}>
                <div className="hs-track-header">
                  <div className="hs-track-icon" style={{ color: track.color, backgroundColor: `${track.color}12` }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="hs-track-title">{track.title}</h3>
                </div>
                <p className="hs-track-desc">{track.desc}</p>
                <div className="hs-track-footer">
                  <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#475569' }}>{track.duration}</span>
                  <span style={{ color: '#16a34a' }}>{track.cohorts}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- WIDE FULL-WIDTH CONTACT US SECTION (ID: contact-us) --- */}
      <section id="contact-us" className="hs-contact-wide-section">
        <div className="hs-contact-wide-container hs-animate-fade" style={{ animationDelay: '0.4s' }}>
          <div className="hs-contact-wide-grid">
            
            {/* Left Details Column */}
            <div className="hs-contact-left-details">
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.08em' }}>Get In Touch</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 12px 0' }}>Contact ProEduvate Support</h2>
                <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  Have questions about internship tracks, mentor onboarding, or application tracking? We're here to assist.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="hs-contact-info-row">
                  <div className="hs-contact-info-icon"><Mail size={18} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Email Support</div>
                    <div style={{ fontSize: '13.5px', color: '#64748b' }}>support@proeduvate.com</div>
                  </div>
                </div>

                <div className="hs-contact-info-row">
                  <div className="hs-contact-info-icon"><Phone size={18} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Direct Helpline</div>
                    <div style={{ fontSize: '13.5px', color: '#64748b' }}>+1 (800) 555-PRO-EDU (Mon-Fri 9am-6pm EST)</div>
                  </div>
                </div>

                <div className="hs-contact-info-row">
                  <div className="hs-contact-info-icon"><MapPin size={18} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Headquarters</div>
                    <div style={{ fontSize: '13.5px', color: '#64748b' }}>ProEduvate Tech Center, San Francisco, CA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form Column */}
            <form className="hs-contact-form-wide" onSubmit={handleContactSubmit}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Send an Inquiry</h3>

              {contactSubmitted && (
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> Thank you! Your message has been sent successfully.
                </div>
              )}

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  className="hs-wide-input" 
                  placeholder="e.g. John Doe" 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  className="hs-wide-input" 
                  placeholder="e.g. john@example.com" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>Message or Inquiry</label>
                <textarea 
                  rows={3}
                  className="hs-wide-input" 
                  placeholder="How can we help you?" 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required 
                />
              </div>

              <button type="submit" className="hs-wide-submit-btn">
                Send Message <Send size={15} />
              </button>
            </form>

          </div>
        </div>
      </section>

    </div>
  );
}
