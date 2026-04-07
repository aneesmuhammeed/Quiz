import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { Download, Users, CheckCircle, BarChart3, Lock, ShieldAlert, Award, Building2, AlertTriangle } from 'lucide-react';
import './admin.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function AdminDashboard() {
  const [sessionKey, setSessionKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedKey = localStorage.getItem('supabase_service_key');
    if (savedKey) {
      setSessionKey(savedKey);
      handleLogin(savedKey);
    }
  }, []);

  const handleLogin = async (keyToUse = sessionKey) => {
    if (!keyToUse) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient(SUPABASE_URL, keyToUse);
      const { data, error: fetchError } = await supabase
        .from('submissions')
        .select('*')
        .order('score', { ascending: false });

      if (fetchError) throw fetchError;
      
      setSubmissions(data || []);
      setIsAuthenticated(true);
      localStorage.setItem('supabase_service_key', keyToUse);
    } catch (err) {
      setError("Invalid Service Role Key or Network Error. " + err.message);
      setIsAuthenticated(false);
      localStorage.removeItem('supabase_service_key');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase_service_key');
    setIsAuthenticated(false);
    setSessionKey('');
    setSubmissions([]);
  };

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
      const col = s.college_name || 'Unknown';
      if (!map[col]) map[col] = { name: col, count: 0, totalScore: 0 };
      map[col].count += 1;
      map[col].totalScore += s.score;
    });
    return Object.values(map).map(m => ({
      ...m,
      avgScore: (m.totalScore / m.count).toFixed(2)
    })).sort((a,b) => b.count - a.count);
  }, [submissions]);

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
    link.setAttribute("download", `exam_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-box">
          <div className="icon-wrapper"><Lock size={48} color="#6366f1" /></div>
          <h2>Admin Authentication</h2>
          <p>This dashboard accesses protected leaderboard data. Please enter your Supabase <strong>Service Role Key</strong> to bypass Row Level Security.</p>
          {error && <div className="error-alert"><ShieldAlert size={18} /> {error}</div>}
          <input 
            type="password" 
            placeholder="eyJh..." 
            value={sessionKey} 
            onChange={(e) => setSessionKey(e.target.value)}
          />
          <button onClick={() => handleLogin()} disabled={loading}>
            {loading ? 'Authenticating...' : 'Unlock Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <div className="logo-section">
          <BarChart3 size={28} color="#4f46e5" />
          <h1>Exam Analytics</h1>
        </div>
        <nav className="admin-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={activeTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveTab('leaderboard')}>Leaderboard</button>
          <button className={activeTab === 'institutions' ? 'active' : ''} onClick={() => setActiveTab('institutions')}>Institutions</button>
        </nav>
        <div className="actions-section">
          <button className="export-btn" onClick={exportToCSV}><Download size={16} /> Export CSV</button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <main className="admin-main-content">
        {activeTab === 'overview' && (
          <div className="tab-pane fade-in">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon"><Users color="#3b82f6" /></div>
                <div>
                  <span className="metric-label">Total Participants</span>
                  <div className="metric-value">{totalParticipants}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><Award color="#10b981" /></div>
                <div>
                  <span className="metric-label">Average Score</span>
                  <div className="metric-value">{averageScore}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon"><Building2 color="#8b5cf6" /></div>
                <div>
                  <span className="metric-label">Institutions</span>
                  <div className="metric-value">{institutionsMap.length}</div>
                </div>
              </div>
              <div className="metric-card alert">
                <div className="metric-icon"><AlertTriangle color="#ef4444" /></div>
                <div>
                  <span className="metric-label">Disqualified</span>
                  <div className="metric-value">{disqualifiedCount}</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Score Distribution</h3>
                <div className="chart-wrapper" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3>Institution Participation</h3>
                <div className="chart-wrapper" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={institutionsMap.slice(0, 7)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {institutionsMap.slice(0, 7).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="tab-pane fade-in">
            <div className="table-card">
              <div className="table-header">
                <h2>Global Leaderboard</h2>
                <span className="badge">{totalParticipants} records</span>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate Name</th>
                      <th>Institution</th>
                      <th>Score</th>
                      <th>Accuracy (C / I)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, index) => (
                      <tr key={sub.id} className={sub.disqualified ? 'disqualified-row' : ''}>
                        <td>#{index + 1}</td>
                        <td>
                          <strong>{sub.full_name || sub.student_name}</strong>
                          <span className="sub-text">{sub.mail_id || sub.email}</span>
                        </td>
                        <td>
                          {sub.college_name || 'N/A'}
                          <span className="sub-text">{sub.course} · {sub.batch}</span>
                        </td>
                        <td><strong className="score-text">{sub.score}</strong></td>
                        <td><span className="correct-text">{sub.total_correct}</span> / <span className="wrong-text">{sub.total_incorrect}</span></td>
                        <td>
                          {sub.disqualified ? (
                            <span className="status-badge error">Disqualified</span>
                          ) : (
                            <span className="status-badge success">Approved</span>
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
                <h2>Institution Breakdown</h2>
                <span className="badge">{institutionsMap.length} institutions</span>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Institution Name</th>
                      <th>Total Candidates</th>
                      <th>Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutionsMap.map((inst, idx) => (
                      <tr key={idx}>
                        <td><strong>{inst.name}</strong></td>
                        <td>{inst.count} candidates</td>
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
