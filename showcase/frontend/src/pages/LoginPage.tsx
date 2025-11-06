import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, Link } from 'react-router-dom';
import { useStores } from '../stores/RootStore';
import { LogIn, Mail } from 'lucide-react';

const LoginPage: React.FC = observer(() => {
  const { authStore } = useStores();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authStore.sendVerificationCode(email);
      navigate('/verify-code');
    } catch (error) {
      console.error('Send code error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {authStore.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {authStore.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We'll send you a verification code via email
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={authStore.loading || !email}
          >
            {authStore.loading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
});

export default LoginPage;
