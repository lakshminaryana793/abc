import React from 'react';
import { useAuthStore } from '../../store/auth';
import { AdminLogin } from './AdminLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return <>{children}</>;
};