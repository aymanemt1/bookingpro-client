import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Book from './pages/Book';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:slug" element={<Book />} />
          <Route path="/booking-success/:id" element={<BookingSuccess />} />
          <Route
            path="/my-bookings"
            element={
              <Protected>
                <MyBookings />
              </Protected>
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-stone-500 flex items-center justify-between">
          <span>📅 BookingPro — appointment booking, done right</span>
          <span>
            Built by <span className="font-semibold text-stone-700">Aymane Moutoute</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
