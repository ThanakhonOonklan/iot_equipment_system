import React, { useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { Dashboard } from '../Dashboard';



export const Home: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole] = useState<'admin' | 'staff' | 'user' | 'guest'>('user'); // Default role

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        userRole={userRole}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <div className="min-h-screen">
          <Dashboard />

         
        </div>
      </main>
    </div>
  );
};