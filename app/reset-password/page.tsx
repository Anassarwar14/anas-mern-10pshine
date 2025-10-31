'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }
    if (!/[A-Z]/.test(pwd)) {
      setValidationError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(pwd)) {
      setValidationError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(pwd)) {
      setValidationError('Password must contain at least one number');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setValidationError('');

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password Reset Successful</h2>
          <p className="text-gray-600 mb-6">Your password has been reset successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) validatePassword(e.target.value);
                }}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{validationError}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  );
}