import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  TrendingUp, 
  Star, 
  RefreshCw,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'users', 'agents', 'feedback'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsRes = await axios.get('/complaints/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch feedback stats
      const feedbackRes = await axios.get('/feedback/stats');
      if (feedbackRes.data.success) {
        setFeedbackStats(feedbackRes.data.stats);
      }

      // Fetch complaints
      const complaintsRes = await axios.get('/complaints');
      if (complaintsRes.data.success) {
        setComplaints(complaintsRes.data.complaints);
      }

      // Fetch agents
      const agentsRes = await axios.get('/users/agents');
      if (agentsRes.data.success) {
        setAgents(agentsRes.data.agents);
      }

      // Fetch users
      const usersRes = await axios.get('/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrative data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.put(`/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        alert('User role updated successfully');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleAgentAssignment = async (complaintId, agentId) => {
    try {
      // Put agentId (null representing unassign)
      const response = await axios.put(`/complaints/${complaintId}`, { agentId });
      if (response.data.success) {
        alert('Agent assigned successfully');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error assigning agent');
    }
  };

  // Helper to render SVG bars for charting categories
  const renderCategoryChart = () => {
    if (!stats || !stats.categoryStats) return null;
    const data = Object.entries(stats.categoryStats);
    const maxVal = Math.max(...data.map(([_, v]) => v), 1); // Avoid division by zero

    return (
      <div className="space-y-4">
        {data.map(([cat, val]) => {
          const percent = (val / maxVal) * 100;
          return (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{cat}</span>
                <span className="text-indigo-400 font-bold">{val} tickets</span>
              </div>
              <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-slate-100 bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Control Center</h1>
          <p className="text-slate-400 mt-1">Global oversight, agent metrics, and routing tools</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stat panel grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cases Filed</span>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">{stats?.total || 0}</h3>
              <div className="text-[10px] text-slate-500 mt-2">Active + Resolved Tickets</div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Assignment</span>
              <h3 className="text-3xl font-extrabold text-amber-500 mt-1">{stats?.statusCounts?.pending || 0}</h3>
              <div className="text-[10px] text-slate-500 mt-2">Pending initial routing review</div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Resolve Queue</span>
              <h3 className="text-3xl font-extrabold text-blue-500 mt-1">{stats?.statusCounts?.inProgress || 0}</h3>
              <div className="text-[10px] text-slate-500 mt-2">Currently handled by agents</div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cases Resolved</span>
              <h3 className="text-3xl font-extrabold text-emerald-500 mt-1">
                {(stats?.statusCounts?.resolved || 0) + (stats?.statusCounts?.closed || 0)}
              </h3>
              <div className="text-[10px] text-slate-500 mt-2">Closed or marked Resolved</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart module */}
            <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Ticket Category Breakdown</span>
              </h3>
              {renderCategoryChart()}
            </div>

            {/* Satisfaction rating panel */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  <span>Customer Satisfaction</span>
                </h3>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-5xl font-extrabold text-white">{feedbackStats?.averageRating || '0.0'}</span>
                  <div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.round(feedbackStats?.averageRating || 0) ? 'fill-amber-400' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1 block">
                      Based on {feedbackStats?.totalFeedbacks || 0} reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini feedback breakdown */}
              {feedbackStats && (
                <div className="space-y-2 text-xs">
                  {Object.entries(feedbackStats.ratingBreakdown).reverse().map(([rating, count]) => {
                    const pct = feedbackStats.totalFeedbacks > 0 ? (count / feedbackStats.totalFeedbacks) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="w-3 text-slate-400 font-bold">{rating}★</span>
                        <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-6 text-right text-slate-500 font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section tabs switcher */}
          <div className="flex border-b border-slate-850 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 shrink-0 cursor-pointer ${
                activeTab === 'tickets' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              All Complaints ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 shrink-0 cursor-pointer ${
                activeTab === 'users' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              System Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 shrink-0 cursor-pointer ${
                activeTab === 'agents' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Agents Queue ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 shrink-0 cursor-pointer ${
                activeTab === 'feedback' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Reviews ({feedbackStats?.reviews?.length || 0})
            </button>
          </div>

          {/* TAB 1: ALL TICKETS LIST */}
          {activeTab === 'tickets' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur shadow-xl">
              <table className="min-w-full divide-y divide-slate-850 text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Assigned Agent (Override)</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-900/30 transition">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-400">
                        #{c._id.toString().substring(18)}
                      </td>
                      <td className="px-6 py-4 text-white font-medium max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-700">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{c.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={c.agent?._id || ''}
                          onChange={(e) => handleAgentAssignment(c._id, e.target.value || null)}
                          className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="">-- Unassigned --</option>
                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name} ({agent.activeComplaintsCount} active)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          c.status === 'Resolved' || c.status === 'Closed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: SYSTEM USERS LIST */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur shadow-xl">
              <table className="min-w-full divide-y divide-slate-850 text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4">Modify Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/30 transition">
                      <td className="px-6 py-4 text-white font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : u.role === 'AGENT'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="USER">User (Customer)</option>
                          <option value="AGENT">Agent (Handler)</option>
                          <option value="ADMIN">Admin (Manager)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: AGENTS QUEUE */}
          {activeTab === 'agents' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur shadow-xl">
              <table className="min-w-full divide-y divide-slate-850 text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Agent Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Active Queue Cases</th>
                    <th className="px-6 py-4">Workload Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-slate-900/30 transition">
                      <td className="px-6 py-4 text-white font-medium">{agent.name}</td>
                      <td className="px-6 py-4 text-slate-400">{agent.email}</td>
                      <td className="px-6 py-4 font-bold text-indigo-400">{agent.activeComplaintsCount} Active</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          agent.activeComplaintsCount >= 5
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : agent.activeComplaintsCount >= 2
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {agent.activeComplaintsCount >= 5 ? 'High Backlog' : agent.activeComplaintsCount >= 2 ? 'Balanced' : 'Lighter Workload'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: REVIEWS FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedbackStats?.reviews?.length === 0 ? (
                <div className="col-span-2 text-center py-12 border border-slate-850 rounded-2xl bg-slate-900/10">
                  <Star className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold">No feedback reviews submitted yet.</p>
                </div>
              ) : (
                feedbackStats?.reviews?.map((review) => (
                  <div key={review._id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl relative shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{review.user?.name || 'Customer'}</h4>
                        <span className="text-[10px] text-slate-500">
                          Complaint: {review.complaint?.title || 'Resolved Ticket'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 font-bold text-sm bg-amber-400/5 border border-amber-400/20 px-2.5 py-0.5 rounded-lg">
                        <span>{review.rating}</span>
                        <Star className="w-3 h-3 fill-amber-400" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-350 italic leading-relaxed">
                      "{review.comment || 'No written comments left.'}"
                    </p>
                    <div className="text-[9px] text-slate-500 mt-4 text-right">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
