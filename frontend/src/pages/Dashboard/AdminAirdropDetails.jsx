import React from 'react';
import { ArrowLeft, Clock, Calendar, Award, CheckCircle, Target, Users, Zap, Gift, ListOrdered, CheckCircle2 } from 'lucide-react';

export default function AdminAirdropDetails({ airdrop, onBack }) {
  if (!airdrop) return null;

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
    if (status === 'PENDING_APPROVAL') return { bg: '#fef08a', text: '#854d0e', border: '#fde047' };
    return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };
  };

  const statusStyle = getStatusColor(airdrop.status);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: "fadeIn 0.3s ease-out", width: '100%' }}>
      {/* Header Section */}
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px", color: "#1e293b", fontSize: "24px" }}>
               <Gift size={28} color="#8b5cf6" />
               {airdrop.title || `Bonus Airdrop #${airdrop.id}`}
               <span style={{ 
                 padding: '4px 12px', 
                 borderRadius: '20px', 
                 fontSize: '12px', 
                 fontWeight: '600',
                 backgroundColor: statusStyle.bg,
                 color: statusStyle.text,
                 border: `1px solid ${statusStyle.border}`,
                 display: 'inline-flex',
                 alignItems: 'center',
                 gap: '6px',
                 marginLeft: '8px'
               }}>
                 {airdrop.status === 'APPROVED' && <CheckCircle size={14} />}
                 {airdrop.status}
               </span>
            </h2>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280", display: "flex", gap: "16px", alignItems: "center" }}>
              <span>ID: <b>{airdrop.id}</b></span>
              <span style={{ color: "#d1d5db" }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} color="#3b82f6"/> Task Type: <b>{airdrop.taskType}</b></span>
            </span>
          </div>
        </div>
        
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontWeight: "500", backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", color: "#374151" }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>


      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start", marginTop: "8px" }}>
        
        {/* Left Column: Metrics & Schedule */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ margin: 0, padding: "24px", borderTop: "4px solid #8b5cf6", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "16px", margin: "0 0 20px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={20} color="#f59e0b" /> Challenge Parameters
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px dashed #e2e8f0" }}>
                <span style={{ color: "#475569", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500" }}><Clock size={18} /> Time Limit</span>
                <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "16px" }}>{airdrop.timeLimit}s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px dashed #e2e8f0" }}>
                <span style={{ color: "#475569", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500" }}><Users size={18} /> Max Winners</span>
                <span style={{ fontWeight: 700, color: "#10b981", fontSize: "16px" }}>{airdrop.winners}</span>
              </div>
              <div>
                <span style={{ color: "#475569", display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Total Points Pool</span>
                <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "100%", backgroundColor: "#f59e0b", height: "100%", borderRadius: "4px" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ margin: 0, padding: "24px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "16px", margin: "0 0 20px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={20} color="#3b82f6" /> Schedule Timeline
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#10b981", zIndex: 1, border: "2px solid #ffffff", boxShadow: "0 0 0 2px #10b981" }}></div>
                  <div style={{ width: "2px", height: "100%", backgroundColor: "#e2e8f0", marginTop: "4px" }}></div>
                </div>
                <div style={{ paddingBottom: "16px" }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Starts</p>
                  <p style={{ margin: "0", fontSize: "15px", color: "#1e293b", fontWeight: 600 }}>{airdrop.startDate} at {airdrop.startTime}</p>
                  <span style={{ fontSize: "12px", color: "#8b5cf6", backgroundColor: "#f3e8ff", padding: "4px 10px", borderRadius: "12px", marginTop: "8px", display: "inline-block", fontWeight: "600" }}>{airdrop.startMode}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#ef4444", zIndex: 1, border: "2px solid #ffffff", boxShadow: "0 0 0 2px #ef4444" }}></div>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ends</p>
                  <p style={{ margin: "0", fontSize: "15px", color: "#1e293b", fontWeight: 600 }}>{airdrop.endDate} at {airdrop.endTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Distribution */}
          <div className="card" style={{ margin: 0, padding: "24px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "#b45309", display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={20} /> Point Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {airdrop.points.map((pts, idx) => (
                <div key={idx} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: '12px 16px', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '8px', 
                  border: '1px solid #fef3c7',
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                    {idx === 0 ? "🥇 1st Winner" : idx === 1 ? "🥈 2nd Winner" : idx === 2 ? "🥉 3rd Winner" : `${idx + 1}th Winner`}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d97706' }}>{pts} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Question Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ margin: 0, padding: "32px", minHeight: "100%", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                 <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>Q</div>
                 <h3 style={{ fontSize: "20px", margin: 0, color: "#1e293b", fontWeight: "600" }}>Question Prompt</h3>
              </div>
              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '24px', borderRadius: '0 12px 12px 0' }}>
                <p style={{ margin: 0, fontSize: '16px', color: '#334155', fontWeight: '500', lineHeight: "1.7" }}>{airdrop.question}</p>
              </div>
            </div>

            {/* MCQ Options */}
            {airdrop.taskType === 'Multiple Choice' && airdrop.mcqOptions && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Options</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                  {airdrop.mcqOptions.map((opt, idx) => (
                    <div key={idx} style={{ 
                      padding: '16px 20px', 
                      backgroundColor: airdrop.correctAnswer === opt ? '#f0fdf4' : '#ffffff',
                      border: `2px solid ${airdrop.correctAnswer === opt ? '#22c55e' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      color: airdrop.correctAnswer === opt ? '#166534' : '#334155',
                      fontWeight: airdrop.correctAnswer === opt ? "600" : "500",
                      boxShadow: airdrop.correctAnswer === opt ? "0 4px 6px -1px rgba(34, 197, 94, 0.1)" : "none",
                      transition: "all 0.2s ease"
                    }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        backgroundColor: airdrop.correctAnswer === opt ? '#22c55e' : '#f1f5f9', 
                        color: airdrop.correctAnswer === opt ? '#fff' : '#64748b', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '14px', fontWeight: 'bold' 
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span style={{ flex: 1, fontSize: "16px" }}>{opt}</span>
                      {airdrop.correctAnswer === opt && <CheckCircle2 size={24} color="#22c55e" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match the Following */}
            {airdrop.taskType === 'Match the Following' && airdrop.matchPairs && (
              <div>
                 <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Match Pairs</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                   {airdrop.matchPairs.map((pair, idx) => (
                     <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                       <div style={{ flex: 1, padding: '16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center', fontWeight: "500", color: "#334155", fontSize: "15px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>{pair.left}</div>
                       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4f46e5", flexShrink: 0 }}>
                         <ListOrdered size={18} />
                       </div>
                       <div style={{ flex: 1, padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', textAlign: 'center', fontWeight: "600", color: "#166534", fontSize: "15px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>{pair.right}</div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Arrange in Order */}
            {airdrop.taskType === 'Arrange in Order' && airdrop.arrangeItems && (
              <div>
                 <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Correct Order</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {airdrop.arrangeItems.map((item, idx) => (
                     <div key={idx} style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: "16px", color: "#334155", fontWeight: "500" }}>{item.text}</span>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Short Answer */}
            {airdrop.taskType === 'Short Answer' && (
              <div>
                 <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: "uppercase", letterSpacing: "0.5px" }}>Correct Answer</h4>
                 <div style={{ padding: '24px', backgroundColor: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '12px', color: '#166534', fontWeight: '600', fontSize: "18px", display: "flex", alignItems: "center", gap: "16px" }}>
                   <CheckCircle2 size={24} color="#22c55e" /> {airdrop.correctAnswer}
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
