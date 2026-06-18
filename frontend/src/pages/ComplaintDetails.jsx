import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Folder, 
  Paperclip, 
  Send, 
  AlertCircle, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  XCircle,
  Star
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat state
  const [newMessage, setNewMessage] = useState('');
  const [sendLoading, setSendLoading] = useState(false);

  // Status updating state
  const [statusLoading, setStatusLoading] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const fetchDetails = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const response = await axios.get(`/complaints/${id}`);
      if (response.data.success) {
        setComplaint(response.data.complaint);
        // If feedback already exists inside the database
        if (response.data.complaint.status === 'Closed') {
          // Check if feedback is already registered by fetching feedback stats
          // (or it will handle it via state/post responses)
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching complaint details.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchDetails(true);

    // HTTP Polling: Refresh chat/details every 4 seconds
    const interval = setInterval(() => {
      fetchDetails(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [id]);

  // Scroll to bottom of chat when new messages load
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [complaint?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendLoading(true);
      const response = await axios.post(`/complaints/${id}/messages`, { message: newMessage });
      if (response.data.success) {
        setNewMessage('');
        // Add locally to state for instant feedback
        setComplaint((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, { ...response.data.message, sender: { _id: user.id, name: user.name, role: user.role } }]
          };
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusLoading(true);
      const response = await axios.put(`/complaints/${id}`, { status: newStatus });
      if (response.data.success) {
        setComplaint(response.data.complaint);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError('');

    try {
      // 1. Submit feedback
      const feedbackRes = await axios.post('/feedback', {
        complaintId: id,
        rating,
        comment
      });

      if (feedbackRes.data.success) {
        setFeedbackSubmitted(true);
        // 2. Mark complaint as Closed
        await handleStatusUpdate('Closed');
      }
    } catch (err) {
      console.error(err);
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getTimelineStepStyle = (stepIndex, complaintStatus) => {
    const statusOrder = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    const currentIdx = statusOrder.indexOf(complaintStatus);
    
    if (stepIndex < currentIdx) {
      return 'bg-indigo-600 text-white'; // Completed
    } else if (stepIndex === currentIdx) {
      if (complaintStatus === 'Resolved') return 'bg-emerald-500 text-white ring-4 ring-emerald-500/20';
      if (complaintStatus === 'Closed') return 'bg-slate-700 text-white';
      return 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'; // Current active
    } else {
      return 'bg-slate-800 text-slate-500 border border-slate-750'; // Future
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Error Accessing Ticket</h2>
        <p className="text-slate-400 text-sm mt-2 mb-6">{error || 'Complaint not found.'}</p>
        <Link
          to={user.role === 'ADMIN' ? '/admin' : user.role === 'AGENT' ? '/agent' : '/dashboard'}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-slate-100 bg-slate-950">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          to={user.role === 'ADMIN' ? '/admin' : user.role === 'AGENT' ? '/agent' : '/dashboard'}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: TICKET INFORMATION & TIMELINE (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline tracker */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Resolution Progress</h3>
            <div className="relative flex justify-between items-center">
              {/* Connector lines */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
              
              {/* Step 1: Pending */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getTimelineStepStyle(0, complaint.status)}`}>
                  1
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Pending</span>
              </div>

              {/* Step 2: In Progress */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getTimelineStepStyle(1, complaint.status)}`}>
                  2
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">In Progress</span>
              </div>

              {/* Step 3: Resolved */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getTimelineStepStyle(2, complaint.status)}`}>
                  3
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Resolved</span>
              </div>

              {/* Step 4: Closed */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getTimelineStepStyle(3, complaint.status)}`}>
                  4
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Closed</span>
              </div>
            </div>
          </div>

          {/* Ticket detail content */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/20">
                  Ticket #{complaint._id.toString().substring(18)}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs border border-slate-700">
                  {complaint.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  complaint.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                }`}>
                  {complaint.priority} Priority
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{complaint.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-850 text-sm">
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span><strong>Filed:</strong> {new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <User className="w-4 h-4 text-slate-500" />
                <span><strong>Customer:</strong> {complaint.user?.name} ({complaint.user?.email})</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Grievance Description</h4>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                {complaint.description}
              </p>
            </div>

            {/* File Attachments block */}
            {complaint.attachmentUrl && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Document</h4>
                <a
                  href={`http://localhost:5001${complaint.attachmentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 p-3 rounded-xl border border-slate-800 bg-slate-950/20 text-indigo-400 hover:text-white hover:border-slate-750 transition text-sm cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-sm font-semibold">
                    View Attachment Document
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* User Feedback Module */}
          {complaint.user?._id === user.id && complaint.status === 'Resolved' && !feedbackSubmitted && (
            <div className="p-6 bg-slate-900 border border-emerald-500/20 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/10">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Complaint Resolved - Rate Our Support</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">Please submit your feedback to finalize and close this support ticket.</p>
              
              {feedbackError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4">
                  {feedbackError}
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none cursor-pointer"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400 animate-in fade-in duration-300' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Comments</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what we did well, or where we can improve..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 text-sm flex items-center space-x-2 transition cursor-pointer"
                >
                  {feedbackLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>Submit Review & Close Ticket</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {complaint.status === 'Closed' && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3 text-slate-400 text-sm bg-gradient-to-r from-slate-900 to-slate-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>This complaint has been successfully resolved, reviewed, and closed.</span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTION PANEL & CHAT */}
        <div className="space-y-6">
          
          {/* Agent Action Controller Panel */}
          {(user.role === 'AGENT' || user.role === 'ADMIN') && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Ticket Status Actions</h3>
              
              <div className="space-y-3">
                {complaint.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusUpdate('In Progress')}
                    disabled={statusLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Acknowledge & Begin Work</span>
                  </button>
                )}

                {complaint.status === 'In Progress' && (
                  <button
                    onClick={() => handleStatusUpdate('Resolved')}
                    disabled={statusLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {user.role === 'ADMIN' && complaint.status !== 'Closed' && (
                  <button
                    onClick={() => handleStatusUpdate('Closed')}
                    disabled={statusLoading}
                    className="w-full py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Force Close Ticket</span>
                  </button>
                )}

                <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-semibold">
                  Current: {complaint.status}
                </div>
              </div>
            </div>
          )}

          {/* In-app Chat box */}
          <div className="flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Chat header */}
            <div className="p-4 border-b border-slate-850 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Live Discussion</h3>
                <span className="text-[10px] text-slate-400">
                  {complaint.agent ? `Assigned Agent: ${complaint.agent.name}` : 'Awaiting Assignment'}
                </span>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
            </div>

            {/* Chat message thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {complaint.messages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-500">No messages in discussion yet. Type below to send a note.</p>
                </div>
              ) : (
                complaint.messages.map((msg, index) => {
                  const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                  const senderRole = msg.sender?.role || '';
                  
                  return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-450">{msg.sender?.name || 'User'}</span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-500">
                          ({senderRole || 'Client'})
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[8px] text-slate-500 mt-0.5">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Chat input form */}
            {complaint.status !== 'Closed' ? (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-850 bg-slate-900/40 flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-850 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sendLoading}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="p-3 border-t border-slate-850 bg-slate-950/60 text-center text-xs text-slate-500">
                Discussion locked. This ticket is Closed.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ComplaintDetails;
