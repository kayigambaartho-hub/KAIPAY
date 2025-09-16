import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LogoIcon } from './icons';

interface AuthFormProps {
  isRegister: boolean;
  onSubmit: (formData: Record<string, string>) => void;
  onToggle: () => void;
  error: string | null;
  isLoading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegister, onSubmit, onToggle, error, isLoading }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    setPasswordValidations({ minLength, hasUpper, hasLower, hasNumber });
    return minLength && hasUpper && hasLower && hasNumber;
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
        validatePassword(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !isPasswordValid) {
        return; // Button should be disabled, but as a safeguard.
    }
    onSubmit(formData);
  };

  const ValidationCheck: React.FC<{met: boolean; label: string}> = ({ met, label }) => (
    <li className={`flex items-center transition-colors ${met ? 'text-green-400' : 'text-gray-500'}`}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={met ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path>
        </svg>
        {label}
    </li>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <LogoIcon className="w-12 h-12 text-blue-500"/>
        </div>
        <div className="bg-gray-800 shadow-2xl rounded-2xl p-8">
          <h2 className="text-center text-3xl font-extrabold text-white mb-6">
            {isRegister ? 'Create an Account' : 'Sign in to your Account'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div>
                <label htmlFor="name" className="text-sm font-bold text-gray-300 block mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-bold text-gray-300 block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-bold text-gray-300 block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {isRegister && (
                <ul className="text-xs space-y-1 mt-3">
                    <ValidationCheck met={passwordValidations.minLength} label="At least 8 characters" />
                    <ValidationCheck met={passwordValidations.hasLower} label="One lowercase letter" />
                    <ValidationCheck met={passwordValidations.hasUpper} label="One uppercase letter" />
                    <ValidationCheck met={passwordValidations.hasNumber} label="One number" />
                </ul>
              )}
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading || (isRegister && !isPasswordValid)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors duration-300 disabled:bg-blue-800 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={onToggle} className="font-medium text-blue-400 hover:underline ml-1">
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;