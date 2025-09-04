'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google';
import { getApiUrl } from '@/lib/config';

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
}

interface GoogleConfig {
  google_client_id: string;
  redirect_uri: string;
}

interface GoogleOAuthContextType {
  clientId: string | null;
  isLoading: boolean;
  isConfigured: boolean;
}

const GoogleOAuthContext = createContext<GoogleOAuthContextType>({
  clientId: null,
  isLoading: true,
  isConfigured: false,
});

export const useGoogleOAuth = () => useContext(GoogleOAuthContext);

export default function GoogleOAuthProvider({ children }: GoogleOAuthProviderProps) {
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoogleConfig();
  }, []);

  const fetchGoogleConfig = async () => {
    try {
      const response = await fetch(getApiUrl('auth/google/config/'));

      if (response.ok) {
        const config: GoogleConfig = await response.json();
        if (config.google_client_id) {
          setClientId(config.google_client_id);
        } else {
          console.warn('Google OAuth client ID is empty in backend response');
        }
      } else {
        console.error('Failed to fetch Google OAuth config:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching Google OAuth config:', error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: GoogleOAuthContextType = {
    clientId: clientId || null,
    isLoading: loading,
    isConfigured: false, // Temporarily disabled due to CSP conflicts
  };

  if (loading) {
    return (
      <GoogleOAuthContext.Provider value={contextValue}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </GoogleOAuthContext.Provider>
    );
  }

  if (!clientId) {
    // Return children without Google OAuth if config is not available
    console.warn('Google OAuth not configured - client ID not available');
    return (
      <GoogleOAuthContext.Provider value={contextValue}>{children}</GoogleOAuthContext.Provider>
    );
  }

  return (
    <GoogleProvider clientId={clientId}>
      <GoogleOAuthContext.Provider value={contextValue}>{children}</GoogleOAuthContext.Provider>
    </GoogleProvider>
  );
}
