import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9] mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ถ้าล็อกอินแล้ว ให้ redirect ไปหน้า dashboard
  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // ถ้ายังไม่ล็อกอิน ให้แสดงหน้า login/signup
  return <>{children}</>;
};
