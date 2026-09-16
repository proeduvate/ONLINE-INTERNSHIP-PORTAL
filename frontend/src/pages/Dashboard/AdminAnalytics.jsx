import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

export default function AdminAnalytics({ usersList }) {
  const interns = usersList.filter(user => user.role && user.role.toLowerCase() === 'intern');
  
  const colleges = useMemo(() => [...new Set(interns.map(i => i.college).filter(Boolean))], [interns]);
  const domains = useMemo(() => [...new Set(interns.map(i => i.domain).filter(Boolean))], [interns]);
  
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedInternId, setSelectedInternId] = useState('');

  const filteredInterns = useMemo(() => {
    return interns.filter(intern => {
      if (selectedCollege && intern.college !== selectedCollege) return false;
      if (selectedDomain && intern.domain !== selectedDomain) return false;
      return true;
    });
  }, [interns, selectedCollege, selectedDomain]);

  React.useEffect(() => {
    if (filteredInterns.length > 0) {
      if (selectedInternId && !filteredInterns.find(i => String(i.id) === String(selectedInternId))) {
        setSelectedInternId('');
      }
    } else {
      setSelectedInternId('');
    }
  }, [filteredInterns, selectedInternId]);

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!selectedInternId) {
      setChartData([]);
      return;
    }
    api.get(`/analytics/daily-questions/intern/${selectedInternId}`)
      .then(res => {
        // Map the backend data to match what the chart expects (date, CodingScore, FinalScore, MCQScore)
        const mappedData = res.data.map(item => ({
          date: item.date,
          CodingScore: item.coding_score,
          MCQScore: item.mcq_score,
          FinalScore: item.final_score
        }));
        setChartData(mappedData);
      })
      .catch(err => {
        console.error("Failed to fetch analytics data", err);
        setChartData([]);
      });
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
              onChange={(e) => setSelectedInternId(e.target.value)}
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
          chartData.length > 0 ? (
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    name="Coding Score"
                    dataKey="CodingScore" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    name="Final Score"
                    dataKey="FinalScore" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    name="MCQ Score"
                    dataKey="MCQScore" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
              No analytics data available for this intern yet.
            </div>
          )
        ) : (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Please select an intern to view their performance analytics.
          </div>
        )}
      </div>
    </div>
  );
}
