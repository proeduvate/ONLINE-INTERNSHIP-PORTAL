import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics({ usersList = [], onInternClick }) {
  const interns = usersList.filter(user => user.role === 'Intern');
  
  const colleges = useMemo(() => [...new Set(interns.map(i => i.college).filter(Boolean))], [interns]);
  const domains = useMemo(() => [...new Set(interns.map(i => i.domain).filter(Boolean))], [interns]);
  
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedInternId, setSelectedInternId] = useState('');
  const [internPerformanceData, setInternPerformanceData] = useState([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  const filteredInterns = useMemo(() => {
    return interns.filter(intern => {
      if (selectedCollege && intern.college !== selectedCollege) return false;
      if (selectedDomain && intern.domain !== selectedDomain) return false;
      return true;
    });
  }, [interns, selectedCollege, selectedDomain]);

  useEffect(() => {
    if (selectedInternId) {
      setLoadingPerformance(true);
      const token = localStorage.getItem("token");
      fetch(`http://localhost:8000/analytics/daily-questions/intern/${selectedInternId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch performance");
        return res.json();
      })
      .then(data => {
        setInternPerformanceData(data);
        setLoadingPerformance(false);
      })
      .catch(err => {
        console.error("Error fetching intern performance:", err);
        setInternPerformanceData([]);
        setLoadingPerformance(false);
      });
    } else {
      setInternPerformanceData([]);
    }
  }, [selectedInternId]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>Intern Performance Analytics</h3>
        
        <div style={{ marginBottom: '30px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Filter by Batch / College</label>
            <select 
              value={selectedCollege} 
              onChange={(e) => setSelectedCollege(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: '14px',
                color: '#374151',
                outline: 'none'
              }}
            >
              <option value="">All Batches</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Filter by Domain</label>
            <select 
              value={selectedDomain} 
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: '14px',
                color: '#374151',
                outline: 'none'
              }}
            >
              <option value="">All Domains</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>Select Intern to View</label>
            <select 
              value={selectedInternId} 
              onChange={(e) => {
                setSelectedInternId(e.target.value);
              }}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                fontSize: '14px',
                color: '#374151',
                outline: 'none'
              }}
            >
              <option value="">-- Choose an Intern --</option>
              {filteredInterns.map(intern => (
                <option key={intern.id} value={intern.id}>
                  {intern.name} (ID: {intern.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedInternId ? (
          <div style={{ height: '400px', width: '100%', marginTop: '40px' }}>
            {loadingPerformance ? (
              <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '150px' }}>Loading performance data...</p>
            ) : internPerformanceData && internPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={internPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ fontWeight: 500 }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="coding_score" 
                    name="Coding Score" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="final_score" 
                    name="Final Score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mcq_score" 
                    name="MCQ Score" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '150px' }}>
                No performance data available for this intern.
              </p>
            )}
          </div>
        ) : (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Please select an intern to view their performance analytics.
          </div>
        )}
      </div>
    </div>
  );
}
