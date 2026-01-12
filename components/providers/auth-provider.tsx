'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAuthToken, UserApi, AdminAuthApi } from '@/lib/api';
import type { User } from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  loginAdmin: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('humdaddy_token');
    const storedUser = localStorage.getItem('humdaddy_user');
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('humdaddy_token', newToken);
      localStorage.setItem('humdaddy_user', JSON.stringify(newUser));
    }
  };

  const loginAdmin = (newToken: string, newUser: User) => {
    login(newToken, newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humdaddy_token');
      localStorage.removeItem('humdaddy_user');
      window.location.href = '/connexion';
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      let data: User;
      if (user?.role === 'admin') {
        const res = await AdminAuthApi.me();
        data = res.data;
      } else {
        const res = await UserApi.me();
        data = res.data;
      }
      setUser(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('humdaddy_user', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Impossible de rafraîchir le profil', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAdmin, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
