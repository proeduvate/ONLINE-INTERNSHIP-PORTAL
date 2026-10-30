import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Award, Compass } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import api from '../../api/axios';

const NAMED_INSTITUTION_BATCHES = ['Berkeley', 'Harvard', 'IIT', 'MIT', 'Stanford'];

export default function AdminLeaderboard({ usersList = [], isOverview = false }) {
  const [timeFilter, setTimeFilter] = useState('All-Time');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [currentPage, setCurrentPage] = useState(1);
  const [apiLeaderboard, setApiLeaderboard] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [isLoadingRadar, setIsLoadingRadar] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, batchFilter]);

  // Fetch Leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const periodParam = timeFilter === 'Weekly' ? 'weekly' : timeFilter === 'Monthly' ? 'monthly' : 'all';
        const batchParam = batchFilter !== 'All Batches' ? `&batch_filter=${encodeURIComponent(batchFilter)}` : '';
        const res = await api.get(`/api/v1/leaderboard?period=${periodParam}${batchParam}`);
        if (Array.isArray(res.data)) {
          setApiLeaderboard(res.data);
        }
      } catch (err) {
        console.warn("Error fetching live leaderboard from backend:", err);
      }
    };
    fetchLeaderboard();
  }, [timeFilter, batchFilter]);

  // Fetch 8-Axis Domain Radar
  useEffect(() => {
    if (isOverview) return;
    const fetchRadar = async () => {
      setIsLoadingRadar(true);
      try {
        const batchParam = batchFilter !== 'All Batches' ? `?batch_filter=${encodeURIComponent(batchFilter)}` : '';
        const res = await api.get(`/api/v1/leaderboard/radar${batchParam}`);
        if (res.data && Array.isArray(res.data.axes)) {
          setRadarData(res.data.axes);
        }
      } catch (err) {
        console.warn("Error fetching domain radar:", err);
      } finally {
        setIsLoadingRadar(false);
      }
    };
    fetchRadar();
  }, [batchFilter, isOverview]);

  const interns = usersList.filter(user => user.role === 'Intern');

  const batches = useMemo(() => {
    const listBatches = interns.map(i => i.batch || i.college).filter(Boolean);
    const apiBatches = apiLeaderboard.map(i => i.college || i.batch).filter(Boolean);
    const uniqueBatches = new Set([
      ...NAMED_INSTITUTION_BATCHES,
      ...listBatches,
      ...apiBatches
    ]);
    return ['All Batches', ...Array.from(uniqueBatches)];
  }, [interns, apiLeaderboard]);

  const leaderboardData = useMemo(() => {
    if (apiLeaderboard.length > 0) {
      let data = apiLeaderboard.map((entry, idx) => ({
        id: entry.intern_id || `INT-${entry.user_id}`,
        name: entry.name || entry.user_name || "Intern",
        college: entry.college || entry.batch || "-",
        domain: entry.domain || "-",
        totalPoints: entry.points !== undefined && entry.points !== null ? entry.points : (entry.total_points || 0),
        rank: entry.rank || (idx + 1)
      }));
      if (batchFilter !== 'All Batches') {
        data = data.filter(i => (i.college || '').toLowerCase().includes(batchFilter.toLowerCase()));
      }
      return data;
    }

    let filteredInterns = interns;
    if (batchFilter !== 'All Batches') {
      filteredInterns = filteredInterns.filter(i => ((i.batch || i.college) || '').toLowerCase().includes(batchFilter.toLowerCase()));
    }

    let data = filteredInterns.map((intern, idx) => ({
      ...intern,
      totalPoints: parseInt(intern.progress || '0', 10) * 10,
      rank: idx + 1
    }));

    data.sort((a, b) => b.totalPoints - a.totalPoints);
    return data.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [apiLeaderboard, interns, batchFilter]);

  const itemsPerPage = isOverview ? 5 : 10;
  const totalPages = Math.max(1, Math.ceil(leaderboardData.length / itemsPerPage));
  const paginatedData = leaderboardData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRankDisplay = (rank) => {
    if (rank === 1) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#eab308', fontWeight: 'bold' }}><Trophy size={18} /> 1st</div>;
    if (rank === 2) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 'bold' }}><Medal size={18} /> 2nd</div>;
    if (rank === 3) return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 'bold' }}><Award size={18} /> 3rd</div>;
    return <div style={{ fontWeight: '500', color: '#6b7280', paddingLeft: '8px' }}>{rank}th</div>;
  };

  return (
    <div style={isOverview ? { height: '100%', boxSizing: 'border-box' } : { padding: '0px 20px 20px 20px', height: 'auto', minHeight: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: isOverview ? '16px' : '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Global Zero-Drop Leaderboard</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>Rankings across all active and newly enrolled interns.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              style={{
                padding: '8px 12px',
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
          </div>
        </div>

        {/* 8-Axis Domain Radar Section (B7.1) */}
        {!isOverview && (
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Compass size={20} color="#4f46e5" />
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Eight-Axis Domain Radar ({batchFilter})
              </h4>
            </div>

            {isLoadingRadar ? (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Loading eight-axis domain radar...
              </div>
            ) : radarData.length > 0 ? (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="Cohort Average" dataKey="cohort_avg" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                    <Radar name="Domain Velocity" dataKey="score" stroke="#10b981" fill="#34d399" fillOpacity={0.3} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Radar telemetry initializing across domains.
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ padding: '14px 20px' }}>Rank</TableHead>
                <TableHead style={{ padding: '14px 20px' }}>Intern</TableHead>
                <TableHead style={{ padding: '14px 20px' }}>Batch / Institution</TableHead>
                <TableHead style={{ padding: '14px 20px' }}>Domain</TableHead>
                <TableHead style={{ padding: '14px 20px' }}>Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((intern) => (
                <TableRow key={intern.id}>
                  <TableCell style={{ padding: '14px 20px' }}>
                    {getRankDisplay(intern.rank)}
                  </TableCell>
                  <TableCell style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{intern.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{intern.id}</div>
                  </TableCell>
                  <TableCell style={{ color: '#4b5563', fontSize: '14px', padding: '14px 20px' }}>{intern.college}</TableCell>
                  <TableCell style={{ color: '#4b5563', fontSize: '14px', padding: '14px 20px' }}>{intern.domain}</TableCell>
                  <TableCell style={{ color: '#059669', fontWeight: '700', fontSize: '14px', padding: '14px 20px' }}>{intern.totalPoints} pts</TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    No interns found matching this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isOverview && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
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
