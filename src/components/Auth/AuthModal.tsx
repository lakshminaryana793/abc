import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signIn, signUp } = useAuthStore();

  if (!isOpen) return null;

  const validateForm = () => {
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        toast.error('Please enter your full name');
        return false;
      }
      if (formData.name.trim().length < 2) {
        toast.error('Name must be at least 2 characters');
        return false;
      }
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      toast.error('Please enter your password');
      return false;
    }

    if (mode === 'signup') {
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }

      if (!formData.confirmPassword) {
        toast.error('Please confirm your password');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { success, error } = await signUp(formData.email, formData.password, formData.name);
        
        if (success) {
          toast.success('Account created successfully! Welcome to Web3Store!');
          onClose();
          // Reset form
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } else {
          toast.error(error || 'Failed to create account');
        }
      } else {
        const { success, error } = await signIn(formData.email, formData.password);
        
        if (success) {
          toast.success('Welcome back!');
          onClose();
          // Reset form
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } else {
          toast.error(error || 'Invalid email or password');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Weak', color: 'text-red-400' };
    if (password.length < 8) return { strength: 2, text: 'Fair', color: 'text-yellow-400' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, text: 'Strong', color: 'text-green-400' };
    }
    return { strength: 2, text: 'Good', color: 'text-blue-400' };
  };

  const passwordCheck = passwordStrength(formData.password);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-auto">
        {/* Scrollable Content */}
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'signin' ? 'Welcome Back' : 'Join Web3Store'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {mode === 'signin' 
                    ? 'Sign in to your account to continue' 
                    : 'Create your account and start collecting NFTs'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  {formData.name && formData.name.length < 2 && (
                    <p className="text-red-400 text-xs mt-1">Name must be at least 2 characters</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator for Signup */}
                {mode === 'signup' && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordCheck.strength === 1 ? 'bg-red-400 w-1/3' :
                            passwordCheck.strength === 2 ? 'bg-yellow-400 w-2/3' :
                            passwordCheck.strength === 3 ? 'bg-green-400 w-full' : 'w-0'
                          }`}
                        />
                      </div>
                      <span className={`text-xs ${passwordCheck.color}`}>
                        {passwordCheck.text}
                      </span>
                    </div>
                    {formData.password.length < 6 && (
                      <p className="text-red-400 text-xs mt-1">Password must be at least 6 characters</p>
                    )}
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-xs">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 text-xs">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Terms and Conditions for Signup */}
              {mode === 'signup' && (
                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">
                    By creating an account, you agree to our{' '}
                    <span className="text-purple-400 cursor-pointer hover:text-purple-300">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-purple-400 cursor-pointer hover:text-purple-300">Privacy Policy</span>.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                onClick={switchMode}
                className="mt-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {mode === 'signin' ? 'Create New Account' : 'Sign In Instead'}
              </button>
            </div>

            {/* Admin Note for Sign In */}
            {mode === 'signin' && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-300 font-semibold mb-2">Demo Admin Access</h4>
                <p className="text-blue-200 text-sm">
                  <strong>Email:</strong> admin@web3store.com<br />
                  <strong>Password:</strong> Any password works for demo
                </p>
              </div>
            )}

            {/* Benefits for Signup */}
            {mode === 'signup' && (
              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-purple-300 font-semibold mb-2">Account Benefits</h4>
                <ul className="text-purple-200 text-sm space-y-1">
                  <li>• Track your orders and delivery status</li>
                  <li>• Collect and manage your NFTs</li>
                  <li>• Faster checkout process</li>
                  <li>• Exclusive member offers</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};