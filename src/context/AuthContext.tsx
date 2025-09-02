'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  getAuthHeaders: () => Record<string, string>;
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; user?: any; message?: string; is_new_user?: boolean; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { loginWithGoogle: googleAuthLogin, logoutFromGoogle } = useGoogleAuth();

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      // Token might be expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      await authAPI.login(username, password);
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      logoutFromGoogle();
    }
  };

  const loginWithGoogle = async (googleToken: string) => {
    try {
      const result = await googleAuthLogin(googleToken);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await authAPI.register(username, email, password);
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      await authAPI.verifyEmail(email, otp);
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      await authAPI.resendOTP(email);
    } catch (error) {
      throw error;
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    verifyEmail,
    resendOTP,
    setUser,
    getAuthHeaders,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
