import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { Download, Users, CheckCircle, BarChart3, Lock, ShieldAlert, Award, Building2, AlertTriangle } from 'lucide-react';
import './admin.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Premium palette matching the "official" vibe
const COLORS = ['#1a365d', '#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#90cdf4', '#cbd5e0', '#e2e8f0'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('submissions')
          .select('*')
          .order('score', { ascending: false });

        if (fetchError) throw fetchError;
        setSubmissions(data || []);
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const totalParticipants = submissions.length;
  const averageScore = useMemo(() => {
    if (totalParticipants === 0) return 0;
    const sum = submissions.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / totalParticipants).toFixed(2);
  }, [submissions, totalParticipants]);

  const disqualifiedCount = useMemo(() => submissions.filter(s => s.disqualified).length, [submissions]);
  
  const institutionsMap = useMemo(() => {
    const map = {};
    submissions.forEach(s => {
      let col = s.college_name || 'Unknown';
      col = col.trim();
      if (!map[col]) map[col] = { name: col, count: 0, totalScore: 0 };
      map[col].count += 1;
      map[col].totalScore += s.score;
    });
    return Object.values(map).map(m => ({
      ...m,
      avgScore: (m.totalScore / m.count).toFixed(2)
    })).sort((a,b) => b.count - a.count);
  }, [submissions]);

  // Limit Pie Chart slices so it doesn't break Recharts when there are 100+ groups
  const pieChartData = useMemo(() => {
    if (institutionsMap.length <= 6) return institutionsMap;
    const top = institutionsMap.slice(0, 6);
    const others = institutionsMap.slice(6);
    const otherCount = others.reduce((sum, curr) => sum + curr.count, 0);
    return [...top, { name: 'Other Institutions', count: otherCount, avgScore: 0 }];
  }, [institutionsMap]);

  const scoreDistribution = useMemo(() => {
    const bins = { '0-20':0, '21-40':0, '41-60':0, '61-80':0, '81-100':0, '100+':0 };
    submissions.forEach(s => {
      if (s.score <= 20) bins['0-20']++;
      else if (s.score <= 40) bins['21-40']++;
      else if (s.score <= 60) bins['41-60']++;
      else if (s.score <= 80) bins['61-80']++;
      else if (s.score <= 100) bins['81-100']++;
      else bins['100+']++;
    });
    return Object.entries(bins).map(([name, count]) => ({ name, count }));
  }, [submissions]);

  const exportToCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['Rank', 'Name', 'Email', 'College', 'Course', 'Batch', 'Score', 'Total Correct', 'Total Incorrect', 'Skipped', 'Disqualified', 'Submitted At'];
    
    const sorted = [...submissions].sort((a,b) => b.score - a.score);

    const rows = sorted.map((s, index) => [
      index + 1,
      `"${s.full_name || s.student_name || ''}"`,
      s.mail_id || s.email || '',
      `"${s.college_name}"`,
      `"${s.course}"`,
      `"${s.batch}"`,
      s.score,
      s.total_correct,
      s.total_incorrect,
      s.unattempted,
      s.disqualified ? 'YES' : 'NO',
      new Date(s.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `official_exam_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="custom-legend-container">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="custom-legend-item">
             <div className="legend-color-box" style={{ backgroundColor: entry.color }}></div>
             <div className="legend-text-group">
                <span className="legend-text" title={entry.value}>{entry.value}</span>
                <span className="legend-count-bubble">{entry.payload.count}</span>
             </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Connecting to secure registry...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="logo-section">
          <ShieldAlert size={32} className="text-gold" />
          <div>
            <h1>OFFICIAL EXAM REGISTRY</h1>
            <p className="subtitle">Records & Analytics Administration</p>
          </div>
        </div>
        
        <nav className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <BarChart3 size={18} /> Overview
          </button>
          <button className={activeTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveTab('leaderboard')}>
            <Award size={18} /> Global Leaderboard
          </button>
          <button className={activeTab === 'institutions' ? 'active' : ''} onClick={() => setActiveTab('institutions')}>
            <Building2 size={18} /> Institutions
          </button>
        </nav>
        
        <div className="actions-section">
          <button className="export-btn" onClick={exportToCSV}>
            <Download size={18} /> EXPORT CSV
          </button>
        </div>
      </header>

      <main className="admin-main-content">
        {error && (
            <div className="error-alert">
               <AlertTriangle size={20} /> <strong>Error:</strong> {error}
            </div>
        )}

        {activeTab === 'overview' && (
          <div className="tab-pane fade-in">
            <h2 className="section-title">At a Glance</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon blue"><Users size={24} /></div>
                <div>
                  <span className="metric-label">Total Participants</span>
                  <div className="metric-value">{totalParticipants}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon green"><CheckCircle size={24} /></div>
                <div>
                  <span className="metric-label">Average Score</span>
                  <div className="metric-value">{averageScore}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon indigo"><Building2 size={24} /></div>
                <div>
                  <span className="metric-label">Institutions</span>
                  <div className="metric-value">{institutionsMap.length}</div>
                </div>
              </div>
              <div className="metric-card alert">
                <div className="metric-icon red"><AlertTriangle size={24} /></div>
                <div>
                  <span className="metric-label">Disqualified</span>
                  <div className="metric-value">{disqualifiedCount}</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="card-title">Score Distribution</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution} margin={{top: 20, right: 30, left: 0, bottom: 20}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4a5568', fontSize: 13}} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#4a5568', fontSize: 13}} dx={-10} />
                      <Tooltip cursor={{fill: '#edf2f7'}} contentStyle={{borderRadius: '8px', border: '1px solid #cbd5e0', padding: '12px 16px', fontWeight: 600, color: '#1a365d', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" fill="#2b6cb0" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="card-title">Institution Participation</h3>
                <div className="chart-wrapper pie-wrapper">
                  <div className="pie-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={3}
                            dataKey="count"
                            stroke="none"
                        >
                            {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', fontWeight: 600, color: '#1a365d', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="legend-container">
                     {renderCustomLegend({ payload: pieChartData.map((m, i) => ({
                         value: m.name,
                         color: COLORS[i % COLORS.length],
                         payload: m
                     }))})}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="tab-pane fade-in">
            <div className="table-card">
              <div className="table-header">
                <h2 className="card-title" style={{margin: 0}}>Official Global Leaderboard</h2>
                <span className="badge">{totalParticipants} Registered Records</span>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate Details</th>
                      <th>Institution Code / Name</th>
                      <th>Final Score</th>
                      <th>Accuracy (C / I)</th>
                      <th>Status Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, index) => (
                      <tr key={sub.id} className={sub.disqualified ? 'disqualified-row' : ''}>
                        <td className="rank-cell">#{index + 1}</td>
                        <td>
                          <strong className="primary-text">{sub.full_name || sub.student_name}</strong>
                          <span className="sub-text">{sub.mail_id || sub.email}</span>
                        </td>
                        <td>
                          <span className="primary-text" title={sub.college_name}>{sub.college_name || 'N/A'}</span>
                          <span className="sub-text">{sub.course} · {sub.batch}</span>
                        </td>
                        <td><strong className="score-text">{sub.score}</strong></td>
                        <td><span className="correct-text">{sub.total_correct}</span> / <span className="wrong-text">{sub.total_incorrect}</span></td>
                        <td>
                          {sub.disqualified ? (
                            <span className="status-badge error">DISQUALIFIED</span>
                          ) : (
                            <span className="status-badge success">VERIFIED</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'institutions' && (
          <div className="tab-pane fade-in">
            <div className="table-card">
              <div className="table-header">
                <h2 className="card-title" style={{margin: 0}}>Institution Verification Breakdown</h2>
                <span className="badge">{institutionsMap.length} Registered Institutions</span>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Institution Name</th>
                      <th>Total Verified Candidates</th>
                      <th>Network Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutionsMap.map((inst, idx) => (
                      <tr key={idx}>
                        <td><strong className="primary-text">{inst.name}</strong></td>
                        <td><span className="count-bubble">{inst.count}</span> candidates</td>
                        <td><strong className="score-text">{inst.avgScore}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
