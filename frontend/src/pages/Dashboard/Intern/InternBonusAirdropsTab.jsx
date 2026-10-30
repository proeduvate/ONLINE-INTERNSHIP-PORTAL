import React, { useMemo } from "react";
import { Gift, Quote, Clock, Award, CheckCircle, ArrowRight } from "lucide-react";

/**
 * InternBonusAirdropsTab Component
 * 
 * Spontaneous bonus coding & engineering challenge hub:
 * - Active vs Completed airdrop filter tabs
 * - Reward points, time limits, and submission status
 * - Micro-interactions and motivational cues
 */
const InternBonusAirdropsTab = ({
  bonusAirdrops = [],
  airdropTab = "Active",
  handleStartAirdrop,
  navigate
}) => {
  const activeDrops = useMemo(() => {
    return bonusAirdrops.filter(a => a.status === "Active" || a.status === "APPROVED");
  }, [bonusAirdrops]);

  const completedDrops = useMemo(() => {
    return bonusAirdrops.filter(a => a.status === "Completed" || a.status === "FINALIZED");
  }, [bonusAirdrops]);

  const quotes = [
    "Success is where preparation and opportunity meet.",
    "Challenge yourself; it's the only path which leads to growth.",
    "Innovation distinguishes between a leader and a follower.",
    "The expert in anything was once a beginner.",
    "Great things never come from comfort zones."
  ];

  const selectedQuote = quotes[new Date().getDay() % quotes.length];

  return (
    <div style={{ paddingBottom: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Hero Banner */}
      <div className="hero-banner-card" style={{
        borderRadius: "16px",
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #e2e8f0",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
          <div style={{ width: "42px", height: "42px", background: "#fef3c7", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
            <Gift size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Bonus Engineering Airdrops
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
              Spontaneous time-boxed coding puzzles. Boost your total cohort score and earn bonus rank points!
            </p>
          </div>
        </div>

        <div style={{ 
          background: "#f8fafc", 
          padding: "8px 14px", 
          borderRadius: "10px", 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          border: "1px solid #e2e8f0",
          maxWidth: "360px"
        }}>
          <Quote size={14} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "12px", fontStyle: "italic", fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            "{selectedQuote}"
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button 
          className={`btn ${airdropTab === "Active" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => navigate("/intern/bonus-airdrops/active")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "8px", 
            fontWeight: 700, 
            fontSize: "13px",
            background: airdropTab === "Active" ? "#2563eb" : "#ffffff",
            color: airdropTab === "Active" ? "#ffffff" : "#475569",
            border: airdropTab === "Active" ? "none" : "1px solid #cbd5e1"
          }}
        >
          Active Challenges ({activeDrops.length})
        </button>
        <button 
          className={`btn ${airdropTab === "Completed" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => navigate("/intern/bonus-airdrops/completed")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "8px", 
            fontWeight: 700, 
            fontSize: "13px",
            background: airdropTab === "Completed" ? "#2563eb" : "#ffffff",
            color: airdropTab === "Completed" ? "#ffffff" : "#475569",
            border: airdropTab === "Completed" ? "none" : "1px solid #cbd5e1"
          }}
        >
          Completed Archive ({completedDrops.length})
        </button>
      </div>

      {/* Tab Content */}
      {airdropTab === "Active" ? (
        <div>
          {activeDrops.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                <Clock size={24} color="#94a3b8" />
              </div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>No Active Airdrops Right Now</h4>
              <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>Bonus challenges are airdropped unexpectedly during live standups. Keep checking back!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeDrops.map(drop => (
                <div key={drop.id} style={{ 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "14px", 
                  padding: "18px 22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  flexWrap: "wrap",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: 1 }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Gift size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "6px" }}>
                          AIRDROP #{drop.id}
                        </span>
                        <span style={{ fontSize: "12px", color: "#ea580c", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> {drop.duration_minutes || 15} mins time limit
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {drop.question}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#16a34a", background: "#f0fdf4", padding: "6px 12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                      +{drop.points || 50} Points
                    </span>
                    <button 
                      onClick={() => handleStartAirdrop(drop)}
                      style={{ 
                        padding: "8px 20px", 
                        background: "#2563eb", 
                        color: "#ffffff", 
                        border: "none", 
                        borderRadius: "8px", 
                        fontWeight: 700, 
                        fontSize: "13px", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      Attempt Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {completedDrops.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>You haven't completed any bonus challenges yet. Attempt active airdrops to see them archived here!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {completedDrops.map(drop => (
                <div key={drop.id} style={{ 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "12px", 
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CheckCircle size={18} color="#16a34a" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{drop.question}</h4>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Completed & evaluated by mentor team</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a" }}>
                    ✓ Points Awarded
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default React.memo(InternBonusAirdropsTab);

