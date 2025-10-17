import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  ShoppingCart,
  UserPlus,
  FileText,
  PackageCheck,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  userRole: 'admin' | 'staff' | 'user';
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
    { icon: PackageCheck, label: 'คืนอุปกรณ์', path: '/return-equipment' },
    { icon: Package, label: 'จัดการอุปกรณ์', path: '/equipment' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/users' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
    { icon: UserPlus, label: 'คำขอสมัครสมาชิก', path: '/pending-registrations' },
    { icon: FileText, label: 'จัดการคำขอยืม', path: '/borrow-requests' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
    { icon: PackageCheck, label: 'คืนอุปกรณ์', path: '/return-equipment' },
    { icon: History, label: 'ประวัติการยืม-คืน', path: '/history' },
    { icon: FileText, label: 'จัดการคำขอยืม', path: '/borrow-requests' },
  ],
  user: [
    { icon: ShoppingCart, label: 'ยืมอุปกรณ์', path: '/borrow' },
  ]
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, userRole }) => {
  const location = useLocation();
  const items = menuItems[userRole] || menuItems.user;

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              
              <span className="font-bold text-gray-600">บริการยืม-คืนอุปกรณ์ IoT</span>
            </div>
          )}

        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center rounded-lg transition-all duration-300 ease-in-out ${
                    isCollapsed 
                      ? 'justify-center px-3 py-2' 
                      : 'space-x-3 px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-[#0EA5E9] text-white shadow-md transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#0EA5E9] hover:shadow-sm hover:transform hover:scale-[1.01]'
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

      {/* Footer (user info and logout removed per requirements) */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}></div>
    </div>
  );
};