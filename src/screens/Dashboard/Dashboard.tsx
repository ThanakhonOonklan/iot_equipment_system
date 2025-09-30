import React, { useState, useEffect } from 'react';
import { Users, Package, CheckCircle, Activity, UserPlus } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    borrowedEquipment: 0,
    loading: true
  });

  // ดึงข้อมูลจริงจาก API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        // ดึงข้อมูลผู้ใช้
        const usersResponse = await apiService.listUsers();
        const totalUsers = usersResponse.data.users.length;
        
        // ดึงข้อมูลอุปกรณ์
        const equipmentResponse = await apiService.listEquipment();
        const equipment = equipmentResponse.data.equipment;
        const totalEquipment = equipment.length;
        
        // คำนวณอุปกรณ์ที่พร้อมยืม
        const availableEquipment = equipment.filter(eq => 
          eq.status === 'available' && eq.quantity_available > 0
        ).length;
        
        // คำนวณอุปกรณ์ที่ถูกยืม (จำลอง)
        const borrowedEquipment = equipment.filter(eq => 
          eq.status === 'borrowed' || eq.quantity_available < eq.quantity_total
        ).length;

        setStats({
          totalUsers,
          totalEquipment,
          availableEquipment,
          borrowedEquipment,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  // Poll pending registrations for admin
  const [pending, setPending] = useState<any[]>([]);
  useEffect(() => {
    let timer: any;
    const fetchPending = async () => {
      try {
        const res = await apiService.listPendingRegistrations();
        setPending(res.data.requests);
      } catch {}
    };
    fetchPending();
    timer = setInterval(fetchPending, 8000);
    return () => clearInterval(timer);
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
          value={stats.loading ? "..." : stats.totalUsers}
          icon={Users}
          color="#0EA5E9"
          onClick={() => navigate('/users')}
        />
        <StatsCard
          title="จำนวนอุปกรณ์ทั้งหมด"
          value={stats.loading ? "..." : stats.totalEquipment}
          icon={Package}
          color="#10B981"
          onClick={() => navigate('/equipment')}
        />
        <StatsCard
          title="คำขอสมัครที่รออนุมัติ"
          value={pending.length}
          icon={UserPlus}
          color="#F59E0B"
          onClick={() => navigate('/pending-registrations')}
        />
        <StatsCard
          title="อุปกรณ์ถูกยืม"
          value={stats.loading ? "..." : stats.borrowedEquipment}
          icon={Activity}
          color="#DC2626"
          onClick={() => navigate('/equipment')}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            สถานะอุปกรณ์
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">อุปกรณ์พร้อมยืม</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.loading ? "..." : stats.availableEquipment} ชิ้น
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">อุปกรณ์ถูกยืม</span>
              <span className="text-sm font-semibold text-red-600">
                {stats.loading ? "..." : stats.borrowedEquipment} ชิ้น
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">อุปกรณ์ทั้งหมด</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.loading ? "..." : stats.totalEquipment} ชิ้น
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">อัตราการใช้งาน</span>
                <span className="text-sm font-semibold text-blue-600">
                  {stats.loading ? "..." : stats.totalEquipment > 0 
                    ? Math.round((stats.borrowedEquipment / stats.totalEquipment) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            ภาพรวมระบบ
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">สมาชิกทั้งหมด</span>
              <span className="text-sm font-semibold text-blue-600">
                {stats.loading ? "..." : stats.totalUsers} คน
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">อุปกรณ์ทั้งหมด</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.loading ? "..." : stats.totalEquipment} ชิ้น
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">อัตราส่วนสมาชิกต่ออุปกรณ์</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.loading ? "..." : stats.totalEquipment > 0 
                  ? (stats.totalUsers / stats.totalEquipment).toFixed(1) 
                  : 0} : 1
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">สถานะระบบ</span>
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ปกติ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Removed inline pending list; use stats card to navigate instead */}

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