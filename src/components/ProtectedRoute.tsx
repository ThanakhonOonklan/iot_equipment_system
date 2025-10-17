import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading, user } = useAuth() as any;
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9] mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Role-based route guard
  const path = location.pathname;
  const role = user?.role || 'user';

  const roleAllowed = (r: string, p: string): boolean => {
    if (r === 'admin') return true;
    if (r === 'staff') {
      return ['/dashboard','/borrow','/return-equipment','/history','/borrow-requests'].includes(p);
    }
    // user
    return ['/borrow'].includes(p);
  };

  if (!roleAllowed(role, path)) {
    // redirect to default per role
    const redirect = role === 'staff' ? '/dashboard' : '/borrow';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};
