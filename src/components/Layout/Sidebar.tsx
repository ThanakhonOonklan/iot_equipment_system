import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  userRole: 'admin' | 'staff' | 'user' | 'guest';
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/devices' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/users' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/devices' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
    { icon: FileText, label: 'จัดการคำขอยืม', path: '/loan-requests' },
  ],
  user: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'ส่งคำขอยืม', path: '/loan-requests' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
  ],
  guest: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ]
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
              <div className="w-8 h-8 bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-600">IoT System</span>
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
            <div className="text-sm text-gray-600">สถานะ: {userRole.toUpperCase()}</div>
            <div className="text-xs text-gray-500">รหัส: S123456789</div>
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