import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../stores/RootStore';
import { Mail, ArrowLeft } from 'lucide-react';

const CodeVerificationPage: React.FC = observer(() => {
  const { authStore } = useStores();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Redirect if no active challenge
    if (!authStore.hasActiveChallenge) {
      navigate('/login');
      return;
    }

    // Calculate time left until expiration
    if (authStore.currentChallenge) {
      const expiresAt = new Date(authStore.currentChallenge.expiresAt).getTime();
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        authStore.error = 'Verification code has expired. Please request a new one.';
        navigate('/login');
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            authStore.error = 'Verification code has expired. Please request a new one.';
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [authStore, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authStore.verifyCode(code);
      navigate('/dashboard');
    } catch (error) {
      console.error('Code verification error:', error);
    }
  };

  const handleBack = () => {
    authStore.currentChallenge = null;
    authStore.currentEmail = null;
    navigate('/login');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            We sent a code to <span className="font-semibold">{authStore.currentEmail}</span>
          </p>
        </div>

        {authStore.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {authStore.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              className="input text-center text-2xl tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the 6-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={authStore.loading || code.length !== 6}
          >
            {authStore.loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Code expires in:</p>
            <p className={`text-sm font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
});

export default CodeVerificationPage;
