import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('booking_user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem('booking_token')) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/me');
      setUser(data.data);
      localStorage.setItem('booking_user', JSON.stringify(data.data));
    } catch {
      localStorage.removeItem('booking_token');
      localStorage.removeItem('booking_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('booking_token', data.token);
    localStorage.setItem('booking_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, password_confirmation) => {
    const { data } = await api.post('/register', { name, email, password, password_confirmation });
    localStorage.setItem('booking_token', data.token);
    localStorage.setItem('booking_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('booking_token');
    localStorage.removeItem('booking_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
