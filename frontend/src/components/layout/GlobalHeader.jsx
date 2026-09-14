import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import './GlobalHeader.css';

export const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role');
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!applicationId) return;
    navigate("/onboarding/status");
    setShowTrackModal(false);
  };

  const isDashboard = ['/admin', '/mentor', '/intern'].some(route => location.pathname.startsWith(route));
  if (isDashboard) return null;

  return (
    <header className={`hs-global-header ${scrolled ? 'hs-scrolled' : ''}`}>
      <div className="hs-nav-capsule">
        {/* Brand */}
        <div className="hs-nav-brand" onClick={() => navigate(userRole ? `/${userRole}` : '/')}>
          <div className="hs-brand-badge">P</div>
          <span className="hs-brand-name">ProEduvate</span>
        </div>

        {/* Streamlined Monolithic Nav Pills */}
        <nav className="hs-nav-links">
          <button 
            className="hs-nav-link"
            onClick={() => {
              if (location.pathname !== '/') navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Overview
          </button>
          <button 
            className="hs-nav-link"
            onClick={() => {
              if (location.pathname !== '/') navigate('/');
              setTimeout(() => {
                const el = document.getElementById('internship-tracks');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Internship Tracks
          </button>
          <button 
            className="hs-nav-link"
            onClick={() => {
              if (location.pathname !== '/') navigate('/');
              setTimeout(() => {
                const el = document.getElementById('contact-us');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Contact Us
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hs-nav-actions">
          <button className="hs-nav-btn-track" onClick={() => setShowTrackModal(true)}>
            Track Application
          </button>
          <button className="hs-nav-btn-login" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="hs-nav-btn-signup" onClick={() => navigate('/onboarding/apply')}>
            Apply Now
          </button>
        </div>
      </div>

      <Modal 
        isOpen={showTrackModal} 
        onClose={() => { setShowTrackModal(false); setApplicationId(""); }}
        title="Track Application Status"
      >
        <form onSubmit={handleTrackSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <Input 
            label="Application ID"
            placeholder="e.g. APP-2026-00125"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            required
            helpText="Enter the ID you received via email during registration."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-3)' }}>
            <Button variant="ghost" type="button" onClick={() => setShowTrackModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Check Status</Button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
