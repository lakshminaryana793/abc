import React from 'react';
import { useAdminStore } from '../../store/admin';
import { AdminLogin } from './AdminLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAdminStore();

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return <>{children}</>;
};