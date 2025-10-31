'use client';

import { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                Forgot Password?
              </h2>
              <p className="text-sm text-gray-600">
                No worries! Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="john@orris.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !email}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={handleClose}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </>
        ) : (
          // Success State
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;