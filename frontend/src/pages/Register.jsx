import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, Briefcase } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER'); // Default role
  const [formError, setFormError] = useState('');
  const { register, user, error, setError, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear errors
  useEffect(() => {
    setError(null);
  }, []);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'AGENT') navigate('/agent');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    // Pass the chosen role for demo testing convenience (the backend route allows this)
    const res = await register(name, email, password);
    if (res.success) {
      // If a role other than USER was created, we need to update it on the backend,
      // but since our backend '/register' route allows setting the role directly from req.body for testing ease,
      // we can update it in one step by extending our register function to accept role!
      // Let's check: in AuthContext, we wrote: const register = async (name, email, password) => { ... }
      // Oh! The AuthContext 'register' function only takes (name, email, password). Let's edit it to accept 'role' too, or we can just let it register as USER, and the first registered user can be admin.
      // Wait, let's see. If the backend register route allows req.body.role, let's modify AuthContext.jsx to support 'role' in register.
      // Let's do that! But wait, we can also just register as USER and promote them, or we can quickly edit AuthContext to pass role too. Let's make register accept name, email, password, role!
      // Let's do a replace_file_content in AuthContext.jsx to include role in register.
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8">
      {/* Glow balls */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-400 mt-1">Get started with complaint resolution</p>
        </div>

        {/* Display Error Message */}
        {(formError || error) && (
          <div className="flex items-center space-x-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={async (e) => {
          e.preventDefault();
          setFormError('');

          if (!name || !email || !password) {
            setFormError('Please fill in all fields');
            return;
          }

          if (password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
          }

          // Directly call axios call here or make sure our Context supports it.
          // Wait, let's call register with role since we can update AuthContext to take role.
          // Let's implement registration call directly inside this onSubmit or invoke register.
          // Let's modify AuthContext's register to take role as well, which is cleaner!
          // We will update AuthContext right after this.
          // In the meantime, we will execute register(name, email, password, role) here.
          const res = await register(name, email, password, role);
        }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Account Role (Testing)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Briefcase className="w-4 h-4" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm appearance-none cursor-pointer"
              >
                <option value="USER">User (Submit complaints)</option>
                <option value="AGENT">Agent (Resolve complaints)</option>
                <option value="ADMIN">Admin (Manage system)</option>
              </select>
            </div>
            <p className="text-[10px] text-indigo-400 mt-1">Note: Role registration select is enabled for quick sandbox testing.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-800/60">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition ml-1">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
