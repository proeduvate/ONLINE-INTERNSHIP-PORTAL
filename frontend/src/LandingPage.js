import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">AI Internship Portal</span>
          <h1>Centralized learning, evaluation, and mentor collaboration — all in one portal.</h1>
          <p>
            Unlock day-wise structured curriculum, automated code grading, plagiarism insights, and mentor-led
            support for real-world internship readiness.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">
              Start your journey
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Mentor / Admin login
            </Link>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="hero-card">
            <div className="hero-card-icon">💡</div>
            <h3>Structured Learning</h3>
            <p>Day-wise curriculum with sequential content unlocks, guided notes, and hands-on tasks.</p>
          </div>
          <div className="hero-card accent">
            <div className="hero-card-icon">🤖</div>
            <h3>AI Evaluation</h3>
            <p>Automated code evaluation, logic analysis, test-case validation, and plagiarism detection.</p>
          </div>
          <div className="hero-card">
            <div className="hero-card-icon">🤝</div>
            <h3>Mentor Collaboration</h3>
            <p>Weekly reviews, asynchronous feedback, video meetings with breakout rooms, and one-to-one chat.</p>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="section-intro">
          <span className="eyebrow">Our Solution</span>
          <h2>Centralized AI internship portal built for modern talent development.</h2>
          <p>
            A single platform that automates the internship lifecycle from onboarding to portfolio and certification,
            using AI to evaluate code, detect plagiarism, generate grades, and surface real-time performance insights.
          </p>
        </div>

        <div className="features-grid">
          <article className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Structured Learning</h3>
            <p>Day-wise learning with sequential unlocks, built-in notes, videos, and hands-on assignments.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>AI Evaluation</h3>
            <p>Automated grading, quality feedback, runtime checks, test validations, and plagiarism scoring.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Mentor Collaboration</h3>
            <p>Dedicated mentor channels, one-to-one chat, review dashboards, and breakout session management.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
