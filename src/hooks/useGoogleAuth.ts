'use client';

import { useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import { authAPI } from '@/lib/api';

interface GoogleAuthResult {
  success: boolean;
  user?: any;
  message?: string;
  is_new_user?: boolean;
}

export function useGoogleAuth() {
  const loginWithGoogle = useCallback(async (googleToken: string): Promise<GoogleAuthResult> => {
    try {
      const response = await authAPI.googleLogin(googleToken);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
        is_new_user: response.data.is_new_user,
      };
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Google authentication failed',
      };
    }
  }, []);

  const logoutFromGoogle = useCallback(() => {
    googleLogout();
  }, []);

  return {
    loginWithGoogle,
    logoutFromGoogle,
  };
}