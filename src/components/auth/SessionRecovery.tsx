'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SessionRecoveryProps {
  onSessionRecovered?: () => void;
}

export default function SessionRecovery({ onSessionRecovered }: SessionRecoveryProps) {
  const { refreshSession, hasValidTokens } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  const attemptRecovery = async () => {
    setIsRecovering(true);
    try {
      const success = await refreshSession();
      if (success && onSessionRecovered) {
        onSessionRecovered();
      }
    } catch (error) {
      console.error('Session recovery failed:', error);
    } finally {
      setIsRecovering(false);
      setRecoveryAttempted(true);
    }
  };

  // Auto-attempt recovery if tokens exist and this hasn't been attempted yet
  useEffect(() => {
    if (hasValidTokens() && !recoveryAttempted && !isRecovering) {
      attemptRecovery();
    }
  }, [hasValidTokens, recoveryAttempted, isRecovering]);

  // Don't show anything if no tokens exist or recovery was successful
  if (!hasValidTokens() || !recoveryAttempted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-orange-800">Session Recovery</CardTitle>
          <CardDescription>
            Your session has expired but we detected saved credentials. Would you like to attempt to
            restore your session?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Your login credentials are still saved locally</p>
            <p>• We can attempt to restore your session automatically</p>
            <p>• If this fails, you'll be redirected to the login page</p>
          </div>

          <div className="space-y-3">
            <Button onClick={attemptRecovery} disabled={isRecovering} className="w-full">
              {isRecovering ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Recovering Session...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore Session
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = '/auth/login')}
              className="w-full"
            >
              Go to Login Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
