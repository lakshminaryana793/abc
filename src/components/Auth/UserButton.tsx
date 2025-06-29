import React, { useState } from 'react';
import { User, LogOut, Settings, Package, Gift } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { AuthModal } from './AuthModal';
import toast from 'react-hot-toast';

export const UserButton: React.FC = () => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
    toast.success('Signed out successfully');
  };

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:block">Sign In</span>
        </button>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
          {isAdmin && <p className="text-xs text-purple-300">Admin</p>}
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-700">
            <p className="text-white font-medium">{user?.email}</p>
            <p className="text-gray-400 text-sm">{isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>
          
          <div className="py-2">
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Profile Settings</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              <Gift className="h-4 w-4" />
              <span>My NFTs</span>
            </button>
            
            <hr className="my-2 border-gray-700" />
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};