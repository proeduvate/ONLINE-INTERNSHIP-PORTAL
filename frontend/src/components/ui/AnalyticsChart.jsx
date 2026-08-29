import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const API_BASE = "http://localhost:8000";

export default function AnalyticsChart({ internId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!internId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/analytics/daily-questions/intern/${internId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const analyticsData = await res.json();
        
        // Ensure data is sorted by date
        const sortedData = analyticsData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (isMounted) setData(sortedData);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { isMounted = false; };
  }, [internId]);

  if (!internId) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        Please select an intern to view their daily question analytics.
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>{error}</div>;
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        No analytics data available for this intern.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 400, marginTop: "20px" }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: "#6b7280" }} 
            tickMargin={10} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 12, fill: "#6b7280" }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Line 
            type="monotone" 
            dataKey="final_score" 
            name="Final Score" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            activeDot={{ r: 8 }} 
          />
          <Line 
            type="monotone" 
            dataKey="mcq_score" 
            name="MCQ Score" 
            stroke="#10b981" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
          />
          <Line 
            type="monotone" 
            dataKey="coding_score" 
            name="Coding Score" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
