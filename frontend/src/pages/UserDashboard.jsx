import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Eye, AlertCircle, FileText, Send, CheckCircle2, Clock, Calendar } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/complaints');
      if (response.data.success) {
        setComplaints(response.data.complaints);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    if (!title || !description || !category) {
      setSubmitError('Please fill in all required fields.');
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const response = await axios.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setShowModal(false);
        // Clear form
        setTitle('');
        setCategory('General');
        setPriority('Medium');
        setDescription('');
        setAttachment(null);
        // Refetch complaints
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'Error submitting complaint.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3 mr-1 animate-pulse" /> Pending</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Submit new complaints and track support tickets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
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
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No Complaints Found</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6 max-w-sm mx-auto">You have not submitted any complaints yet. Click "New Complaint" to log an issue.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur">
          <table className="min-w-full divide-y divide-slate-850 text-left">
            <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Complaint Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Date Filed</th>
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
                  <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getPriorityBadge(c.priority)}</td>
                  <td className="px-6 py-4 text-slate-450">
                    <span className="flex items-center text-xs text-slate-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/complaints/${c._id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-1">File New Complaint</h2>
            <p className="text-xs text-slate-400 mb-6">Describe your issue in detail. Complaints are auto-assigned immediately.</p>

            {submitError && (
              <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition text-sm cursor-pointer"
                  >
                    <option value="Technical">Technical Support</option>
                    <option value="Billing">Billing & Payments</option>
                    <option value="General">General Inquiries</option>
                    <option value="Feedback">Product Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Priority Level *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition text-sm cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Provide all relevant details to help resolve the issue faster..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 transition text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 file:transition cursor-pointer file:cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">Allowed: Images, PDF, Word Docs. Max size 5MB.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
