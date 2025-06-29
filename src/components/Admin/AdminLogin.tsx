import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAdminStore } from '../../store/admin';
import { useWalletStore } from '../../store/wallet';
import toast from 'react-hot-toast';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAdminStore();
  const { address, isConnected, connect } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(credentials.address, credentials.password);
      
      if (success) {
        toast.success('Admin login successful!');
        onLogin();
      } else {
        toast.error('Invalid credentials. Please check your wallet address and password.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseConnectedWallet = () => {
    if (isConnected && address) {
      setCredentials({ ...credentials, address });
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success('Wallet connected!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-300">Access the admin panel to manage your store</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">Demo Credentials</h3>
            <div className="text-blue-200 text-sm space-y-1">
              <p><strong>Address:</strong> 0x742d35Cc6634C0532925a3b8D4C9db96590b5b8e</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={credentials.address}
                  onChange={(e) => setCredentials({ ...credentials, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter admin wallet address"
                  required
                />
              </div>
              
              {/* Wallet Connection Helper */}
              <div className="mt-2 flex items-center justify-between">
                {isConnected && address ? (
                  <button
                    type="button"
                    onClick={handleUseConnectedWallet}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Use connected wallet ({address.slice(0, 6)}...{address.slice(-4)})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Connect wallet to auto-fill
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Login to Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              🔒 <strong>Security Notice:</strong> This is a demo admin panel. In production, 
              implement proper authentication with JWT tokens, 2FA, and role-based access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};