import React from 'react';
import { ArrowLeft, Clock, Calendar, Award, CheckCircle } from 'lucide-react';

export default function AdminAirdropDetails({ airdrop, onBack, role = 'admin' }) {
  if (!airdrop) return null;

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> Back to Airdrops
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
            {airdrop.title || `Airdrop #${airdrop.id}`}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '999px', 
              fontSize: '12px', 
              fontWeight: '600',
              backgroundColor: airdrop.status === 'PUBLISHED' ? '#dcfce7' : 
                               airdrop.status === 'FINALIZED' ? '#dcfce7' : 
                               airdrop.status === 'PENDING_APPROVAL' ? '#fef08a' : 
                               (airdrop.status === 'DRAFT' && airdrop.rejection_reason) ? '#fee2e2' : '#e0e7ff',
              color: airdrop.status === 'PUBLISHED' ? '#166534' : 
                     airdrop.status === 'FINALIZED' ? '#166534' : 
                     airdrop.status === 'PENDING_APPROVAL' ? '#854d0e' : 
                     (airdrop.status === 'DRAFT' && airdrop.rejection_reason) ? '#991b1b' : '#3730a3'
            }}>
              {(airdrop.status === 'DRAFT' && airdrop.rejection_reason) ? 'REJECTED' : airdrop.status}
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: '500', color: '#4b5563' }}>Task Type:</span> {airdrop.task_type}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
            <Clock size={16} /> <span style={{ fontWeight: '500' }}>Time Limit:</span> {airdrop.time_limit}s
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <Award size={16} /> <span style={{ fontWeight: '500' }}>Winners:</span> {airdrop.winner_count}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> Start Schedule
          </div>
          <div style={{ color: '#374151', fontSize: '14px' }}>
            {airdrop.start_time ? new Date(airdrop.start_time.endsWith('Z') ? airdrop.start_time : airdrop.start_time + 'Z').toLocaleString() : 'N/A'} ({airdrop.start_mode})
          </div>
        </div>
        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> End Schedule
          </div>
          <div style={{ color: '#374151', fontSize: '14px' }}>
            {airdrop.start_mode === 'fixed' && airdrop.start_time
              ? (() => {
                  const t = airdrop.start_time.endsWith('Z') ? airdrop.start_time : airdrop.start_time + 'Z';
                  const s = new Date(t);
                  const e = new Date(s.getTime() + airdrop.time_limit * 1000);
                  return e.toLocaleString();
                })()
              : (airdrop.finalized_at ? new Date(airdrop.finalized_at.endsWith('Z') ? airdrop.finalized_at : airdrop.finalized_at + 'Z').toLocaleString() : (airdrop.status === 'FINALIZED' ? 'Ended' : 'TBD'))}
          </div>
        </div>
      </div>

      {airdrop.rejection_reason && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', marginBottom: '32px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#b91c1c', margin: '0 0 8px 0' }}>Rejection Reason</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>{airdrop.rejection_reason}</p>
        </div>
      )}

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Question Details</h3>
        
        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#166534', fontWeight: '500' }}>{airdrop.task_config?.question || airdrop.task_config?.statement || airdrop.description || airdrop.title}</p>
        </div>

        {airdrop.task_type === 'mcq' && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>Options:</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(airdrop.task_config?.options || []).map((opt, idx) => (
                <li key={idx} style={{ 
                  padding: '12px 16px', 
                  backgroundColor: airdrop.task_config?.correct_answer === String.fromCharCode(65 + idx) ? '#dcfce7' : '#f9fafb',
                  border: `1px solid ${airdrop.task_config?.correct_answer === String.fromCharCode(65 + idx) ? '#86efac' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#374151'
                }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: airdrop.task_config?.correct_answer === String.fromCharCode(65 + idx) ? '#166534' : '#e5e7eb', color: airdrop.task_config?.correct_answer === String.fromCharCode(65 + idx) ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {opt}
                  {airdrop.task_config?.correct_answer === String.fromCharCode(65 + idx) && <CheckCircle size={18} color="#166534" style={{ marginLeft: 'auto' }} />}
                </li>
              ))}
            </ul>
          </div>
        )}

        {airdrop.task_type === 'match' && airdrop.task_config?.pairs && (
          <div style={{ marginBottom: '24px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>Match Pairs:</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {Object.entries(airdrop.task_config.pairs).map(([left, right], idx) => (
                 <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ flex: 1, padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', textAlign: 'center' }}>{left}</div>
                   <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: '#9ca3af' }} />
                   <div style={{ flex: 1, padding: '12px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', textAlign: 'center' }}>{right}</div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {airdrop.task_type === 'arrange' && airdrop.task_config?.correct_order && (
          <div style={{ marginBottom: '24px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>Correct Order:</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {airdrop.task_config.correct_order.map((item, idx) => (
                 <div key={idx} style={{ padding: '12px 16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {idx + 1}
                    </div>
                    {item}
                 </div>
               ))}
             </div>
          </div>
        )}

        {['pattern', 'fill_blank', 'true_false'].includes(airdrop.task_type) && (
          <div style={{ marginBottom: '24px' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Correct Answer:</h4>
             <div style={{ padding: '16px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontWeight: '500' }}>
               {String(airdrop.task_config?.correct_answer)}
             </div>
          </div>
        )}

        {role === 'admin' && airdrop.status === 'PENDING_APPROVAL' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              onClick={() => {
                fetch(`http://localhost:8000/bonus-airdrops/admin/${airdrop.id}/approve`, {
                  method: 'POST',
                  headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                }).then(async (res) => {
                  if(res.ok) {
                    onBack();
                  } else {
                    alert("Failed to approve. Please try again.");
                  }
                });
              }}
              style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
            >
              Approve & Publish
            </button>
            <button 
              onClick={() => {
                const reason = prompt("Enter rejection reason:") || "Rejected by Admin";
                fetch(`http://localhost:8000/bonus-airdrops/admin/${airdrop.id}/reject?reason=${encodeURIComponent(reason)}`, {
                  method: 'POST',
                  headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                }).then(() => onBack());
              }}
              style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
            >
              Reject
            </button>
          </div>
        )}

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>Points Distribution:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(airdrop.points_distribution ? airdrop.points_distribution.split(',') : []).map((pts, idx) => (
              <div key={idx} style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '14px', fontWeight: '600' }}>
                Winner {idx + 1}: {pts} pts
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
