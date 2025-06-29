import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Wallet, User, Shirt, Gift, Package } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { useCartStore } from '../../store/cart';
import { WalletButton } from '../Web3/WalletButton';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isConnected, address } = useWalletStore();
  const { getTotalItems } = useCartStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const totalItems = getTotalItems();

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
            <Shirt className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Web3Store
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/products') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Products
            </Link>
            {isConnected && (
              <>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/orders') 
                      ? 'text-purple-400 bg-purple-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/claim-nfts"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/claim-nfts') 
                      ? 'text-purple-400 bg-purple-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Claim NFTs
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Wallet Connection */}
            <WalletButton />

            {/* NFT Claiming (only show if connected) */}
            {isConnected && (
              <Link
                to="/claim-nfts"
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                title="Claim NFTs"
              >
                <Gift className="h-6 w-6" />
              </Link>
            )}

            {/* Admin Link (only show if connected) */}
            {isConnected && (
              <Link
                to="/admin"
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                title="Admin Panel"
              >
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-800">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/') 
                ? 'text-purple-400 bg-purple-400/10' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActive('/products') 
                ? 'text-purple-400 bg-purple-400/10' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            Products
          </Link>
          {isConnected && (
            <>
              <Link
                to="/orders"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/orders') 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Track Orders
              </Link>
              <Link
                to="/claim-nfts"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/claim-nfts') 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Claim NFTs
              </Link>
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Admin Panel
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};