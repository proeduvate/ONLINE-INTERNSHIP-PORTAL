import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { Trophy, Medal, Award } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

import { useAuth } from '../../services/AuthContext';

export default function AdminLeaderboard({ usersList, isOverview = false }) {
  const { user } = useAuth();
  const isIntern = user?.role && (user.role.toLowerCase() === 'intern' || user.role === 'userrole.intern');
  const [timeFilter, setTimeFilter] = useState('All-Time');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [currentPage, setCurrentPage] = useState(1);
  const [rawLeaderboard, setRawLeaderboard] = useState([]);
  const [finalEvaluations, setFinalEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('raw'); // 'raw' or 'final'

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, batchFilter]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const [res, weeklyRes, finalRes] = await Promise.all([
          api.get('/leaderboard').catch(err => { console.error('Failed to fetch leaderboard:', err); return { data: [] }; }),
          api.get('/leaderboard?period=weekly').catch(err => { console.error('Failed to fetch weekly leaderboard:', err); return { data: [] }; }),
          api.get('/admin/final-evaluations').catch(err => { console.error('Failed to fetch final evaluations:', err); return { data: [] }; })
        ]);
        
        // Merge weekly points into rawLeaderboard
        const weeklyMap = {};
        if (weeklyRes.data && Array.isArray(weeklyRes.data)) {
          weeklyRes.data.forEach(item => {
            weeklyMap[item.user_id || item.intern_id || item.id] = item.total_points;
          });
        }
        
        const mergedLeaderboard = (res.data || []).map(item => ({
          ...item,
          weeklyPoints: weeklyMap[item.user_id || item.intern_id || item.id] || 0
        }));

        setRawLeaderboard(mergedLeaderboard);
        setFinalEvaluations(finalRes.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const interns = usersList.filter(user => user.role && user.role.toLowerCase() === 'intern');

  const batches = useMemo(() => {
    const uniqueBatches = new Set(interns.map(i => i.batch || i.college).filter(Boolean));
    rawLeaderboard.forEach(item => {
      const batch = item.batch_name || item.batch || item.college;
      if (batch) uniqueBatches.add(batch);
    });
    return ['All Batches', ...Array.from(uniqueBatches)];
  }, [interns, rawLeaderboard]);

  const leaderboardData = useMemo(() => {
    let data = rawLeaderboard.map(item => {
      const userId = item.intern_id || item.user_id || item.id;
      const trueUser = usersList.find(u => String(u.id) === String(userId)) || {};
      return {
        ...item,
        id: item.intern_str_id || userId,
        name: trueUser.full_name || trueUser.name || item.user_name || item.name || "Unknown Intern",
        college: trueUser.college || item.batch_name || item.batch || item.college || "N/A",
        domain: trueUser.domain || item.domain || "N/A",
        totalPoints: item.total_points !== undefined ? item.total_points : (item.totalPoints || 0)
      };
    });

    if (batchFilter !== 'All Batches') {
      data = data.filter(i => (i.batch || i.college) === batchFilter);
    }

    // Sort by points descending
    data.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks
    return data.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [rawLeaderboard, batchFilter, usersList]);

  const finalEvaluationsData = useMemo(() => {
    let data = [...finalEvaluations];
    
    // Sort by final score descending
    data.sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
    
    return data;
  }, [finalEvaluations]);

  const displayedData = viewType === 'raw' ? leaderboardData : finalEvaluationsData;
  const itemsPerPage = isOverview ? 5 : 15;
  const totalPages = Math.ceil(displayedData.length / itemsPerPage);
  const paginatedData = displayedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const topInterns = leaderboardData.slice(0, 3);

  const getRankDisplay = (rank) => {
    if (rank === 1) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: 'bold' }}><Trophy size={18} /> 1st</div>;
    if (rank === 2) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 'bold' }}><Medal size={18} /> 2nd</div>;
    if (rank === 3) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 'bold' }}><Award size={18} /> 3rd</div>;
    return <div style={{ fontWeight: '500', color: '#6b7280', paddingLeft: '8px' }}>{rank}th</div>;
  };

  return (
    <div style={isOverview ? { height: '100%', boxSizing: 'border-box', minHeight: '300px' } : { padding: '0px 20px 20px 20px', height: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>
      <div style={isOverview ? { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Global Leaderboard</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {!isIntern && (
              <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                <button
                  onClick={() => { setViewType('raw'); setCurrentPage(1); }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: viewType === 'raw' ? '600' : '500',
                    color: viewType === 'raw' ? '#4f46e5' : '#6b7280',
                    backgroundColor: viewType === 'raw' ? '#fff' : 'transparent',
                    boxShadow: viewType === 'raw' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Total Points
                </button>
                <button
                  onClick={() => { setViewType('final'); setCurrentPage(1); }}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: viewType === 'final' ? '600' : '500',
                    color: viewType === 'final' ? '#4f46e5' : '#6b7280',
                    backgroundColor: viewType === 'final' ? '#fff' : 'transparent',
                    boxShadow: viewType === 'final' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Overall Evaluation
                </button>
              </div>
            )}

            {viewType === 'raw' && (
              <>
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
                        cursor: 'pointer'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', minHeight: 0 }}>
            {viewType === 'raw' ? (
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ padding: '14px 20px' }}>Intern</TableHead>
                    <TableHead style={{ padding: '14px 20px' }}>MCQ (/20)</TableHead>
                    <TableHead style={{ padding: '14px 20px' }}>Code Assessment (/35)</TableHead>
                    <TableHead style={{ padding: '14px 20px' }}>Airdrop (/15)</TableHead>
                    <TableHead style={{ padding: '14px 20px' }}>Mentor (/30)</TableHead>
                    <TableHead style={{ padding: '14px 20px' }}>Final Score (/100)</TableHead>
                    <TableHead style={{ padding: '14px 20px' }}>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((intern) => (
                    <TableRow key={intern.intern_id}>
                      <TableCell style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-darker)', fontSize: '14px' }}>{intern.intern_name}</div>
                      </TableCell>
                      <TableCell style={{ color: 'var(--text-gray)', fontSize: '14px', padding: '14px 20px' }}>{intern.mcq_final_mark != null ? intern.mcq_final_mark : '-'}</TableCell>
                      <TableCell style={{ color: 'var(--text-gray)', fontSize: '14px', padding: '14px 20px' }}>{intern.code_final_mark != null ? intern.code_final_mark : '-'}</TableCell>
                      <TableCell style={{ color: 'var(--text-gray)', fontSize: '14px', padding: '14px 20px' }}>{intern.airdrop_final_mark != null ? intern.airdrop_final_mark : '-'}</TableCell>
                      <TableCell style={{ color: 'var(--text-gray)', fontSize: '14px', padding: '14px 20px' }}>{intern.mentor_evaluation_mark != null ? intern.mentor_evaluation_mark : 'Pending'}</TableCell>
                      <TableCell style={{ color: intern.final_score != null ? 'var(--success-color)' : 'var(--text-muted)', fontWeight: intern.final_score != null ? '700' : 'normal', fontStyle: intern.final_score != null ? 'normal' : 'italic', fontSize: '14px', padding: '14px 20px' }}>
                        {intern.final_score != null ? intern.final_score : 'Pending'}
                      </TableCell>
                      <TableCell style={{ color: intern.grade != null ? '#4f46e5' : 'var(--text-muted)', fontWeight: intern.grade != null ? '700' : 'normal', fontStyle: intern.grade != null ? 'normal' : 'italic', fontSize: '14px', padding: '14px 20px' }}>
                        {intern.grade != null ? intern.grade : 'Pending'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No evaluations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {!isOverview && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '8px', gap: '16px', flexShrink: 0, paddingTop: '8px', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                Showing {paginatedData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, displayedData.length)} of {displayedData.length} entries
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
