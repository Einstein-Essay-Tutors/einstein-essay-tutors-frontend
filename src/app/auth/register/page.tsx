'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, validateUsername, validateOTP } from '@/lib/validation';
import { Eye, EyeOff } from 'lucide-react';

type RegistrationStep = 'register' | 'verify-email' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<RegistrationStep>('register');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, verifyEmail, resendOTP } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.errors;
    }

    if (!validateEmail(formData.email)) {
      errors.email = ['Please enter a valid email address'];
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await register(formData.username, formData.email, formData.password);
      setStep('verify-email');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        // Handle field-specific errors from backend
        const backendErrors: Record<string, string[]> = {};
        Object.entries(err.response.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            backendErrors[field] = messages;
          }
        });
        setFieldErrors(backendErrors);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(formData.email, otp);
      setStep('success');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Verification failed. Please check your code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    try {
      await resendOTP(formData.email);
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
    } catch (err: any) {
      setError('Failed to resend verification code. Please try again.');
    }
  };

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
  };

  const renderRegisterForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
        <p className="mt-2 text-gray-600">
          Join Einstein Essay Tutors and get expert academic help
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={e => handleInputChange('username', e.target.value)}
            required
            placeholder="Choose a unique username"
          />
          {fieldErrors.username && (
            <ul className="mt-1 text-sm text-red-600">
              {fieldErrors.username.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            required
            placeholder="your.email@example.com"
          />
          {fieldErrors.email && (
            <ul className="mt-1 text-sm text-red-600">
              {fieldErrors.email.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              required
              placeholder="Create a strong password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <ul className="mt-1 text-sm text-red-600">
              {fieldErrors.password.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              required
              placeholder="Confirm your password"
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="mt-2 text-gray-600">
          We've sent a 6-digit verification code to <strong>{formData.email}</strong>
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleVerifyEmail} className="space-y-4">
        <div>
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            placeholder="Enter 6-digit code"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify Email'}
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
        <h1 className="text-3xl font-bold text-gray-900">Account Created Successfully!</h1>
        <p className="mt-2 text-gray-600">
          Your email has been verified. You can now sign in to your account.
        </p>
      </div>

      <Button onClick={() => router.push('/auth/login')} className="w-full">
        Sign In to Your Account
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {step === 'register' && renderRegisterForm()}
          {step === 'verify-email' && renderVerificationForm()}
          {step === 'success' && renderSuccessMessage()}
        </div>
      </div>
    </div>
  );
}
