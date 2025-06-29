import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Shirt, Gift, Package, Home, Grid3X3, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { UserButton } from '../Auth/UserButton';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const totalItems = getTotalItems();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors"
            onClick={closeMobileMenu}
          >
            <Shirt className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
              Web3Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/products"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/products') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Products</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/orders') 
                      ? 'text-purple-400 bg-purple-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/claim-nfts"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/claim-nfts') 
                      ? 'text-purple-400 bg-purple-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Gift className="h-4 w-4" />
                  <span>NFTs</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Button - Hidden on mobile, shown in mobile menu */}
            <div className="hidden sm:block">
              <UserButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900/98 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              onClick={closeMobileMenu}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/products"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActive('/products') 
                  ? 'text-purple-400 bg-purple-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              onClick={closeMobileMenu}
            >
              <Grid3X3 className="h-5 w-5" />
              <span>Products</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive('/orders') 
                      ? 'text-purple-400 bg-purple-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <Package className="h-5 w-5" />
                  <span>Track Orders</span>
                </Link>
                <Link
                  to="/claim-nfts"
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive('/claim-nfts') 
                      ? 'text-purple-400 bg-purple-400/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={closeMobileMenu}
                >
                  <Gift className="h-5 w-5" />
                  <span>Claim NFTs</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'text-purple-400 bg-purple-400/10' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={closeMobileMenu}
              >
                <User className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}
            
            {/* User Button in Mobile Menu */}
            <div className="px-3 py-3">
              <UserButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};