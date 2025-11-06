import React from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Info } from 'lucide-react';

const RegisterPage: React.FC = observer(() => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join us today</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Account Creation</p>
              <p className="text-sm text-blue-700 mt-1">
                New accounts are created automatically when you sign in with your email for the first time.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full"
        >
          Go to Sign In
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
});

export default RegisterPage;
