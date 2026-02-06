import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard component สำหรับป้องกันการเข้าถึงหน้า login/signup 
 * เมื่อผู้ใช้ล็อกอินแล้ว
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isLoggedIn, isLoading } = useAuth();

  // แสดง loading ระหว่างตรวจสอบสถานะ
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <img src="/images/logo_login.png" alt="Loading" className="w-48 h-auto mx-auto mb-4" />
        </div>
      </div>
    );
  }


  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // ถ้ายังไม่ล็อกอิน ให้แสดงหน้า login/signup
  return <>{children}</>;
};
