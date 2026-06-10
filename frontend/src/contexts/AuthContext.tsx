import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/client';
import type { UserInfo } from '../types';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      authApi.me()
        .then(setUser)
        .catch(() => { localStorage.removeItem('token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await authApi.register({ username, email, password });
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
