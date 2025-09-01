import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../i18n/translations';

interface LoginProps {
  language: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onShowRegister?: () => void;
  isModal?: boolean;
}

const Login: React.FC<LoginProps> = ({ language, onSuccess, onCancel, onShowRegister, isModal = false }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(emailOrPhone, password);
      if (success) {
        onSuccess?.();
      } else {
        setError('Invalid email/phone or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className={isModal ? "w-full" : "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className={`text-center font-extrabold text-gray-900 ${isModal ? "text-xl mb-2" : "mt-6 text-3xl"}`}>
            {isModal ? 'Sign In' : getTranslation('signIn', language)}
          </h2>
          {!isModal && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {getTranslation('signInSubtitle', language)}
            </p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {getTranslation('emailOrPhone', language)}
              </label>
              <input
                id="email-address"
                name="emailOrPhone"
                type="text"
                autoComplete="email"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={getTranslation('emailOrPhone', language)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {getTranslation('password', language)}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={getTranslation('password', language)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className={isModal ? "flex space-x-3" : ""}>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? getTranslation('signingIn', language) : getTranslation('signInButton', language)}
            </button>
            
            {isModal && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>



        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {getTranslation('dontHaveAccount', language)}{' '}
            <button
              onClick={() => onShowRegister?.()}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {getTranslation('createOneHere', language)}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
