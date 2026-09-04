import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export default function AdminLeaderboard({ usersList, isOverview = false }) {
  const [timeFilter, setTimeFilter] = useState('All-Time');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, batchFilter]);

  const interns = usersList.filter(user => user.role === 'Intern');

  const batches = useMemo(() => {
    const uniqueBatches = new Set(interns.map(i => i.college).filter(Boolean));
    return ['All Batches', ...Array.from(uniqueBatches)];
  }, [interns]);

  // Generate mock leaderboard data
  const leaderboardData = useMemo(() => {
    let filteredInterns = interns;
    if (batchFilter !== 'All Batches') {
      filteredInterns = filteredInterns.filter(i => i.college === batchFilter);
    }

    let data = filteredInterns.map(intern => {
      // Generate some dummy points based on ID
      let seed = 0;
      for (let i = 0; i < intern.id.length; i++) {
        seed += intern.id.charCodeAt(i);
      }
      
      let basePoints = (seed % 100) * 10; 
      
      // Adjust based on time
      if (timeFilter === 'Weekly') basePoints = Math.floor(basePoints / 4);
      if (timeFilter === 'Monthly') basePoints = Math.floor(basePoints / 2);
      
      return {
        ...intern,
        totalPoints: basePoints + (seed % 50)
      };
    });

    // Sort by points descending
    data.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks
    return data.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [interns, timeFilter, batchFilter]);

  const itemsPerPage = isOverview ? 5 : 15;
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const paginatedData = leaderboardData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRankDisplay = (rank) => {
    if (rank === 1) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: 'bold' }}><Trophy size={18} /> 1st</div>;
    if (rank === 2) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 'bold' }}><Medal size={18} /> 2nd</div>;
    if (rank === 3) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 'bold' }}><Award size={18} /> 3rd</div>;
    return <div style={{ fontWeight: '500', color: '#6b7280', paddingLeft: '8px' }}>{rank}th</div>;
  };

  return (
    <div style={isOverview ? { height: '100%', boxSizing: 'border-box' } : { padding: '0px 20px 20px 20px', height: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>
      <div style={isOverview ? { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Global Leaderboard</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#fff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {batches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
              {['Weekly', 'All-Time'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: timeFilter === filter ? '600' : '500',
                    color: timeFilter === filter ? '#4f46e5' : '#6b7280',
                    backgroundColor: timeFilter === filter ? '#fff' : 'transparent',
                    boxShadow: timeFilter === filter ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflow: 'auto', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fdfdfd' }}>
                <th style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Rank</th>
                <th style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Intern</th>
                <th style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Batch</th>
                <th style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Domain</th>
                <th style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((intern, index) => (
                <tr key={intern.id} style={{ borderBottom: index < paginatedData.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.2s', backgroundColor: '#fff' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
                  <td style={{ padding: '16px 24px' }}>
                    {getRankDisplay(intern.rank)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>{intern.name}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '14px' }}>{intern.college}</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '14px' }}>{intern.domain}</td>
                  <td style={{ padding: '16px 24px', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>{intern.totalPoints} pts</td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    No interns found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '24px', gap: '16px', flexShrink: 0 }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {paginatedData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, leaderboardData.length)} of {leaderboardData.length} entries
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: currentPage >= totalPages ? '#f9fafb' : '#fff', color: currentPage >= totalPages ? '#9ca3af' : '#374151', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
