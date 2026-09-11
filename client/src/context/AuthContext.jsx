import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  fetchCurrentUser,
  loginUser,
  registerGuest,
} from '../services/authService.js';
import {
  TOKEN_STORAGE_KEY,
} from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  const storeSession = useCallback((session) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const restoreSession = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchCurrentUser();
      setUser(profile);
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (credentials) => {
    const session = await loginUser(credentials);
    storeSession(session);
    setLoading(false);
    return session;
  }, [storeSession]);

  const register = useCallback(async (guestData) => {
    return registerGuest(guestData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token);
  const isGuest = user?.role === 'GUEST';
  const isStaff = user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    isGuest,
    isStaff,
    isAdmin,
    login,
    register,
    logout,
    refreshProfile: restoreSession,
  }), [
    user,
    token,
    loading,
    isAuthenticated,
    isGuest,
    isStaff,
    isAdmin,
    login,
    register,
    logout,
    restoreSession,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}