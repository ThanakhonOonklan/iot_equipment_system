import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  userRole: 'admin' | 'staff' | 'user' | 'guest';
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/equipment' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/users' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/equipment' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/users' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
  ],
  user: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/equipment' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/users' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
  ],
  guest: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/equipment' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/users' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
  ]
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = menuItems[userRole] || menuItems.user;

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore storage errors
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              
              <span className="font-bold text-gray-600">บริการยืม-คืนอุปกรณ์ IoT</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#0EA5E9] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-3">
            <div className="text-sm text-gray-800 font-semibold">{user?.fullname || 'ผู้ใช้งาน'}</div>
            <div className="text-xs text-gray-600">บทบาท: {(user?.role || userRole).toUpperCase()}</div>
            <div className="text-xs text-gray-500">รหัส: {user?.student_id || '-'}</div>
          </div>
        )}
        <button
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          title={isCollapsed ? 'ออกจากระบบ' : ''}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">ออกจากระบบ</span>}
        </button>
      </div>
    </div>
  );
};