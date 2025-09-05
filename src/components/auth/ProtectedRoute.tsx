'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, loading: authLoading, refreshSession, hasValidTokens } = useAuth();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      // Don't do anything while auth is still loading
      if (authLoading) return;

      // If auth is required
      if (requireAuth) {
        // If no user but has tokens, try to refresh session
        if (!user && hasValidTokens()) {
          setIsValidating(true);
          const refreshed = await refreshSession();
          setIsValidating(false);

          if (!refreshed) {
            // Session refresh failed, redirect to login
            const currentPath = window.location.pathname + window.location.search;
            router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
            return;
          }
        }

        // If no user and no tokens, redirect to login
        if (!user && !hasValidTokens()) {
          const currentPath = window.location.pathname + window.location.search;
          router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
      }
    };

    validateAuth();
  }, [user, authLoading, requireAuth, redirectTo, router, refreshSession, hasValidTokens]);

  // Show loading while auth is loading or validating session
  if (authLoading || isValidating || (requireAuth && !user && hasValidTokens())) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isValidating ? 'Validating session...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  // (this is a fallback, the redirect should handle this)
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}
