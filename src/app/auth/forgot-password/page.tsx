'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateEmail, validatePassword, validateOTP } from '@/lib/validation';
import { authAPI } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

type ResetStep = 'request' | 'verify-otp' | 'reset-password' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>('request');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) setError('');
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.requestPasswordReset(formData.email);
      setResetToken(response.data.reset_token);
      setStep('verify-otp');
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 429) {
        setError('Too many password reset requests. Please try again later.');
      } else if (error.response?.status === 404) {
        setError('No account found with this email address');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOTP(formData.otp)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.verifyPasswordResetOTP(formData.email, formData.otp, resetToken);
      setStep('reset-password');
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 400) {
        setError('Invalid or expired verification code');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      setFieldErrors({ newPassword: passwordValidation.errors });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await authAPI.resetPassword(formData.email, formData.otp, formData.newPassword, resetToken);
      setStep('success');
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await authAPI.requestPasswordReset(formData.email);
      setResetToken(response.data.reset_token);
      setError('');
      setResendCooldown(60);

      // Countdown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      setError('Failed to resend verification code. Please try again.');
    }
  };

  const renderRequestForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Forgot Your Password?</h1>
        <p className="mt-2 text-gray-600">
          No worries! Enter your email address and we&apos;ll send you a verification code to reset
          your password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleRequestReset} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            required
            placeholder="Enter your registered email address"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );

  const renderVerifyOTPForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
        <p className="mt-2 text-gray-600">
          We've sent a 6-digit verification code to <strong>{formData.email}</strong>
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            value={formData.otp}
            onChange={e => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            placeholder="Enter 6-digit code"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || formData.otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
        <Button
          type="button"
          variant="outline"
          onClick={handleResendOTP}
          disabled={resendCooldown > 0}
          className="text-sm"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </Button>
      </div>

      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );

  const renderResetPasswordForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create New Password</h1>
        <p className="mt-2 text-gray-600">
          Your identity has been verified. Please create a new secure password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={e => handleInputChange('newPassword', e.target.value)}
              required
              placeholder="Create a strong password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <ul className="mt-1 text-sm text-red-600">
              {fieldErrors.newPassword.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              required
              placeholder="Confirm your new password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <ul className="mt-1 text-sm text-red-600">
              {fieldErrors.confirmPassword.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Password Updated Successfully!</h1>
        <p className="mt-2 text-gray-600">
          Your password has been changed. You can now sign in with your new password.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Security Notice:</strong> If you didn't request this password change, please contact
        our support team immediately.
      </div>

      <Button onClick={() => router.push('/auth/login')} className="w-full">
        Continue to Sign In
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {step === 'request' && renderRequestForm()}
          {step === 'verify-otp' && renderVerifyOTPForm()}
          {step === 'reset-password' && renderResetPasswordForm()}
          {step === 'success' && renderSuccessMessage()}
        </div>
      </div>
    </div>
  );
}
