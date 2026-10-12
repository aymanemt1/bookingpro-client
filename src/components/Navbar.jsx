import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-amber-700">
          📅 BookingPro
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <Link to="/" className="px-3 py-2 rounded-lg hover:bg-stone-100">
            Services
          </Link>
          {user && (
            <Link to="/my-bookings" className="px-3 py-2 rounded-lg hover:bg-stone-100">
              My bookings
            </Link>
          )}
          {user?.is_admin && (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
            >
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <span className="hidden sm:block text-stone-500 max-w-32 truncate">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-stone-100">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
