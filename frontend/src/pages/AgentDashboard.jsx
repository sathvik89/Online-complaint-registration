import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Eye, AlertCircle, Inbox, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/complaints');
      if (response.data.success) {
        setComplaints(response.data.complaints);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Compute workload stats
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3 mr-1 animate-pulse" /> Pending</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Closed</span>;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High':
        return <span className="text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/20 text-xs font-bold uppercase tracking-wider">{prio}</span>;
      case 'Medium':
        return <span className="text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 text-xs font-bold uppercase tracking-wider">{prio}</span>;
      default:
        return <span className="text-slate-400 bg-slate-500/5 px-2 py-0.5 rounded border border-slate-500/20 text-xs font-bold uppercase tracking-wider">{prio}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-slate-100 bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Agent Dashboard</h1>
        <p className="text-slate-400 mt-1">Manage and resolve complaints auto-routed to your queue</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Action</span>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</span>
            <h3 className="text-3xl font-extrabold text-blue-400 mt-1">{inProgressCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PlayCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Today</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{resolvedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
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
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">Clean Queue!</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">There are no complaints currently assigned to you. New tickets will automatically route here based on workload balancing.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur shadow-xl">
          <table className="min-w-full divide-y divide-slate-850 text-left">
            <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Complaint Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
              {complaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-900/30 transition">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-400">
                    #{c._id.toString().substring(18)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {c.user?.name || 'Unknown Client'}
                  </td>
                  <td className="px-6 py-4 text-white font-medium max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getPriorityBadge(c.priority)}</td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/complaints/${c._id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/10 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review & Chat</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
