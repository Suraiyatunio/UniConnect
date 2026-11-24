import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedSession = localStorage.getItem('uniconnect_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          setUser(parsed);
        } else {
          const current = await ApiService.getCurrentUser();
          if (current) {
            setUser(current);
            localStorage.setItem('uniconnect_session', JSON.stringify(current));
          }
        }
      } catch (err) {
        console.error('Failed to restore user session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('uniconnect_session', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await ApiService.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('uniconnect_session', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    localStorage.removeItem('uniconnect_session');
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('uniconnect_session', JSON.stringify(updated));
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const current = await ApiService.getCurrentUser();
      if (current) {
        setUser(current);
        localStorage.setItem('uniconnect_session', JSON.stringify(current));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
