import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShieldAlert, User as UserIcon, LifeBuoy } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'AGENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-indigo-400 font-bold text-xl tracking-wide">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span className="text-white font-extrabold font-sans">ResolveX</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'USER' && (
                  <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition">
                    My Complaints
                  </Link>
                )}
                {user.role === 'AGENT' && (
                  <Link to="/agent" className="text-sm font-medium text-slate-300 hover:text-white transition">
                    Agent Board
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <div className="flex items-center space-x-4">
                    <Link to="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition">
                      Admin Panel
                    </Link>
                  </div>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:text-white hover:border-slate-700 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
