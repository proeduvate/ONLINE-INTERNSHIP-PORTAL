import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export default function AdminLeaderboard({ usersList, isOverview = false }) {
  const [timeFilter, setTimeFilter] = useState('All-Time');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, batchFilter]);

  const interns = usersList.filter(user => user.role === 'Intern');

  const batches = useMemo(() => {
    const uniqueBatches = new Set(interns.map(i => i.batch || i.college).filter(Boolean));
    return ['All Batches', ...Array.from(uniqueBatches)];
  }, [interns]);

  // Generate mock leaderboard data
  const leaderboardData = useMemo(() => {
    let filteredInterns = interns;
    if (batchFilter !== 'All Batches') {
      filteredInterns = filteredInterns.filter(i => (i.batch || i.college) === batchFilter);
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
  const topInterns = leaderboardData.slice(0, 3);

  const getRankDisplay = (rank) => {
    if (rank === 1) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: 'bold' }}><Trophy size={18} /> 1st</div>;
    if (rank === 2) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 'bold' }}><Medal size={18} /> 2nd</div>;
    if (rank === 3) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 'bold' }}><Award size={18} /> 3rd</div>;
    return <div style={{ fontWeight: '500', color: '#6b7280', paddingLeft: '8px' }}>{rank}th</div>;
  };

  return (
    <div style={isOverview ? { height: '100%', boxSizing: 'border-box' } : { padding: '0px 20px 20px 20px', height: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>
      <div style={isOverview ? { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
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
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ padding: '14px 20px' }}>Rank</TableHead>
                  <TableHead style={{ padding: '14px 20px' }}>Intern</TableHead>
                  <TableHead style={{ padding: '14px 20px' }}>Batch</TableHead>
                  <TableHead style={{ padding: '14px 20px' }}>Domain</TableHead>
                  <TableHead style={{ padding: '14px 20px' }}>Total Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((intern, index) => (
                  <TableRow key={intern.id}>
                    <TableCell style={{ padding: '14px 20px' }}>
                      {getRankDisplay(intern.rank)}
                    </TableCell>
                    <TableCell style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-darker)', fontSize: '14px' }}>{intern.name}</div>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-gray)', fontSize: '14px', padding: '14px 20px' }}>{intern.college}</TableCell>
                    <TableCell style={{ color: 'var(--text-gray)', fontSize: '14px', padding: '14px 20px' }}>{intern.domain}</TableCell>
                    <TableCell style={{ color: 'var(--success-color)', fontWeight: '700', fontSize: '14px', padding: '14px 20px' }}>{intern.totalPoints} pts</TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No interns found in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!isOverview && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '8px', gap: '16px', flexShrink: 0, paddingTop: '8px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                Showing {paginatedData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, leaderboardData.length)} of {leaderboardData.length} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
