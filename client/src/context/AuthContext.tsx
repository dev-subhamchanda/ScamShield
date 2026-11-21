import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { api } from '../services/api';
import { AuthContext } from './useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('scamshield_token') || null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('scamshield_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as UserProfile;
      } catch {
        localStorage.removeItem('scamshield_user');
      }
    }
    return null;
  });

  const [isLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const saveSession = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('scamshield_token', newToken);
    localStorage.setItem('scamshield_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    saveSession(data.token, data.user);
    setIsAuthModalOpen(false);
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    const data = await api.auth.signup(email, password, displayName);
    saveSession(data.token, data.user);
    setIsAuthModalOpen(false);
  };

  const quickDemoLogin = async (role: 'citizen' | 'analyst' | 'admin') => {
    const data = await api.auth.demo(role);
    saveSession(data.token, data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('scamshield_token');
    localStorage.removeItem('scamshield_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        quickDemoLogin,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
