'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Link from 'next/link';

function VerifyEmailForm() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Pre-fill email if provided in URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) {
      setMessage('Please enter both email and verification code');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await authAPI.verifyEmail(email, otpCode);
      setIsSuccess(true);
      setMessage(result.data.message || 'Email verified successfully!');

      // Redirect to login after successful verification
      setTimeout(() => {
        router.push('/auth/login?verified=true');
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code sent to your email address
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${
              isSuccess
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message}
            {isSuccess && <p className="mt-2 text-sm">Redirecting to login page...</p>}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="otpCode" className="sr-only">
                Verification Code
              </label>
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                required
                maxLength={6}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <p className="mt-1 text-xs text-gray-500 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 text-sm">
              Back to login
            </Link>
            <div className="text-xs text-gray-500">
              Didn't receive a code? Check your spam folder or contact support
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
