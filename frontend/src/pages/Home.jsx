import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, MessageSquare, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Smart Complaint Resolution</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Streamlined Complaint Management <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Built for Transparency
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            An advanced MERN-stack resolution platform that simplifies filing, tracking, and resolving grievances with workload-based routing and a direct agent chat system.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition transform hover:-translate-y-0.5 duration-200"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:border-slate-700 transition transform hover:-translate-y-0.5 duration-200"
            >
              Access Dashboard
            </Link>
          </div>
        </div>

        {/* Feature section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Workload Routing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Complaints are dynamically assigned to agents based on their current active backlog, ensuring faster ticket response times.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Logging</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Chat directly with your assigned agent inside the ticket details. Update progress, ask questions, and share information.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Feedback Loops</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Submit ratings and detailed remarks after resolutions. Helping administrators analyze agent performance and support quality.
            </p>
          </div>
        </div>

        {/* Security & Analytics section */}
        <div className="mt-24 border-t border-slate-900 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Grade Security & Validation</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Rest secure knowing that authentication is verified using encrypted JSON Web Tokens (JWT). Inputs are audited against database corruption using express-validator schemas, and API headers are protected using Helmet/CORS headers.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Role-Based Route Guards (User, Agent, Admin)</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Bcrypt Password Encryption Hashing</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>CORS & Helmet API Safeguards</span>
              </li>
            </ul>
          </div>

          <div className="relative p-8 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-400">ADMIN CONTROL CENTER</span>
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-4">
              <div className="h-2.5 w-3/4 rounded bg-slate-800 animate-pulse"></div>
              <div className="h-2.5 w-1/2 rounded bg-slate-800 animate-pulse"></div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-2xl font-bold text-indigo-400">99.8%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Resolution</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-2xl font-bold text-purple-400">&lt;2h</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Avg Response</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-2xl font-bold text-emerald-400">4.9/5</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
