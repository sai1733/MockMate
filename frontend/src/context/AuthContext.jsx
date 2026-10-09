import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken as setAxiosAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to synchronize in-memory token across React state and Axios interceptor
  const updateAccessToken = (token) => {
    setAccessTokenState(token);
    setAxiosAccessToken(token);
  };

  // On initial mount: silently restore session using HttpOnly refresh cookie if present
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post('/auth/refresh');
        if (response.data) {
          updateAccessToken(response.data.accessToken);
          setUser(response.data.user);
        }
      } catch (err) {
        // No active or valid refresh cookie; user remains unauthenticated
        updateAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    updateAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    updateAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      updateAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUserData
    }));
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!accessToken,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
