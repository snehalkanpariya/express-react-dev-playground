import { createContext, useContext, useState, useEffect } from 'react';
import API, { setAccessToken } from '../API/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. PAGE REFRESH RESTORATION: 
  // Since our access token lives in memory, it resets on refresh. 
  // We call /auth/refresh immediately on mount. If the HttpOnly cookie is valid, 
  // the backend hands back a fresh access token silently!
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await API.post('/auth/refresh');
        setAccessToken(response.data.accessToken);

        // Restore user profile from localStorage if available
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        // Refresh token is missing or expired
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 2. LOGIN: Store access token in memory, user profile in localStorage
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;

    // Save access token strictly in-memory (Secure from XSS)
    setAccessToken(accessToken);

    // Save non-sensitive user metadata for UI rendering
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);

    return response.data;
  };

  // 3. LOGOUT: Clear backend cookie and client memory/state
  const logout = async () => {
    try {
      await API.post('/auth/logout'); // Clears HttpOnly cookie on backend
    } catch (err) {
      console.error('Logout error', err);
    }
    setAccessToken(null);
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);