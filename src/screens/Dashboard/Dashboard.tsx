import React, { useState, useEffect } from 'react';
import { Users, Package, Clock, CheckCircle } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    pendingRequests: 0,
    approvedToday: 0
  });

  // Simulate real-time updates
  useEffect(() => {
    const updateStats = () => {
      setStats({
        totalUsers: Math.floor(Math.random() * 50) + 150,
        totalDevices: Math.floor(Math.random() * 20) + 80,
        pendingRequests: Math.floor(Math.random() * 10) + 5,
        approvedToday: Math.floor(Math.random() * 15) + 10
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">ภาพรวมระบบบริการยืม-คืนอุปกรณ์วิชา IoT</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="จำนวนสมาชิกทั้งหมด"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="#0EA5E9"
        />
        <StatsCard
          title="จำนวนอุปกรณ์ทั้งหมด"
          value={stats.totalDevices}
          icon={Package}
          trend={{ value: 5, isPositive: true }}
          color="#10B981"
        />
        <StatsCard
          title="คำขอรอการอนุมัติ"
          value={stats.pendingRequests}
          icon={Clock}
          trend={{ value: -8, isPositive: false }}
          color="#F59E0B"
        />
        <StatsCard
          title="อนุมัติวันนี้"
          value={stats.approvedToday}
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
          color="#8B5CF6"
        />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors text-left">
            <Package className="w-6 h-6 text-[#0EA5E9] mb-2" />
            <h4 className="font-medium text-gray-900">เพิ่มอุปกรณ์ใหม่</h4>
            <p className="text-sm text-gray-600">เพิ่มอุปกรณ์เข้าสู่ระบบ</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors text-left">
            <Users className="w-6 h-6 text-[#0EA5E9] mb-2" />
            <h4 className="font-medium text-gray-900">อนุมัติสมาชิก</h4>
            <p className="text-sm text-gray-600">จัดการคำขอสมัครสมาชิก</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors text-left">
            <CheckCircle className="w-6 h-6 text-[#0EA5E9] mb-2" />
            <h4 className="font-medium text-gray-900">อนุมัติคำขอยืม</h4>
            <p className="text-sm text-gray-600">ตรวจสอบคำขอยืมอุปกรณ์</p>
          </button>
        </div>
      </div>
    </div>
  );
};