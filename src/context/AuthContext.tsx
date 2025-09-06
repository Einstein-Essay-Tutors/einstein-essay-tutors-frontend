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
  loginWithGoogle: (
    googleToken: string
  ) => Promise<{ success: boolean; user?: any; message?: string; is_new_user?: boolean }>;
  refreshSession: () => Promise<boolean>;
  hasValidTokens: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { loginWithGoogle: googleAuthLogin, logoutFromGoogle } = useGoogleAuth();

  const hasValidTokens = (): boolean => {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('refresh_token'));
  };

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();

    // Add visibility change listener to refresh session when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && hasValidTokens() && !user) {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (token || refreshToken) {
        // Try to get current user data (this will trigger token refresh if needed)
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);

      // Only clear auth state if this is a definitive auth failure
      // (not network errors or other temporary issues)
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        !localStorage.getItem('refresh_token')
      ) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      } else {
        // For network errors or other issues, keep the existing auth state
        // but still allow components to decide what to do
        console.log(
          'Auth check failed but keeping existing session due to potential network issue'
        );
      }
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

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const refreshSession = async (): Promise<boolean> => {
    try {
      if (!hasValidTokens()) {
        return false;
      }

      // Try to get user data, which will trigger token refresh if needed
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error: any) {
      console.error('Session refresh failed:', error);

      // Only clear auth state for definitive auth failures
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        return false;
      }

      // For other errors (network, etc.), return false but don't clear session
      return false;
    }
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
    refreshSession,
    hasValidTokens,
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
