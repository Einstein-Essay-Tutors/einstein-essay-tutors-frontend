'use client';

import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google';
import { getApiUrl } from '@/lib/config';

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
}

interface GoogleConfig {
  google_client_id: string;
  redirect_uri: string;
}

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
        setClientId(config.google_client_id);
      } else {
        console.error('Failed to fetch Google OAuth config');
      }
    } catch (error) {
      console.error('Error fetching Google OAuth config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clientId) {
    // Return children without Google OAuth if config is not available
    console.warn('Google OAuth not configured - client ID not available');
    return <>{children}</>;
  }

  return (
    <GoogleProvider clientId={clientId}>
      {children}
    </GoogleProvider>
  );
}