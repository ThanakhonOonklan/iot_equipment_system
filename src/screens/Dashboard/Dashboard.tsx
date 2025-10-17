import React, { useState, useEffect, useMemo } from 'react';
import { Users, Package, Activity, UserPlus, Calendar as CalendarIcon, TrendingUp, X } from 'lucide-react';
import { StatsCard } from '../../components/Dashboard/StatsCard';
import { MainLayout } from '../../components/Layout';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Handle modal animation
  useEffect(() => {
    if (showModal) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setModalVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setModalVisible(false);
    }
  }, [showModal]);

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

  // Borrow requests for chart, today count, recent activities
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiService.listBorrowRequests();
        setRequests(res.data.requests || []);
      } catch {}
    };
    fetch();
    const t = setInterval(fetch, 15000);
    return () => clearInterval(t);
  }, []);

  const todayCount = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = t.getMonth();
    const d = t.getDate();
    return requests.filter(r => {
      const dt = new Date(r.request_date);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    }).length;
  }, [requests]);


  // Build daily counts for last 14 days
  const lineData = useMemo(() => {
    const days = 14;
    const result: { label: string; value: number; date: Date }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = requests.filter(r => {
        const dt = new Date(r.request_date);
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth() && dt.getDate() === d.getDate();
      }).length;
      result.push({ label, value: count, date: d });
    }
    return result;
  }, [requests]);

  // Calendar for current month (mark borrow request counts per day)
  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { day?: number; count?: number }[] = [];
    for (let i = 0; i < startDay; i++) cells.push({});
    for (let d = 1; d <= daysInMonth; d++) {
      const cnt = requests.filter(r => {
        const dt = new Date(r.request_date);
        return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
      }).length;
      cells.push({ day: d, count: cnt });
    }
    while (cells.length % 7 !== 0) cells.push({});
    return { year, month, cells };
  }, [requests]);

  return (
    <MainLayout>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
          }
          
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in-scale {
            animation: fadeInScale 0.4s ease-out forwards;
            opacity: 0;
          }
        `}
      </style>
      <div className="p-6 space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="จำนวนสมาชิกทั้งหมด"
            value={stats.loading ? "..." : stats.totalUsers}
            icon={Users}
            color="#0EA5E9"
            onClick={() => navigate('/users')}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="จำนวนอุปกรณ์ทั้งหมด"
            value={stats.loading ? "..." : stats.totalEquipment}
            icon={Package}
            color="#10B981"
            onClick={() => navigate('/equipment')}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <StatsCard
            title="คำขอสมัครที่รออนุมัติ"
            value={pending.length}
            icon={UserPlus}
            color="#F59E0B"
            onClick={() => navigate('/pending-registrations')}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <StatsCard
            title="อุปกรณ์ถูกยืม"
            value={stats.loading ? "..." : stats.borrowedEquipment}
            icon={Activity}
            color="#DC2626"
            onClick={() => navigate('/equipment')}
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Activities - Borrow Requests and Returns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in-scale" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด (คำขอยืม-คืน)</h3>
          <div className="space-y-3 max-h-72 overflow-auto">
            {requests.slice(0, 20).map((r) => (
              <div key={r.id} className="text-sm text-gray-700 flex items-center justify-between">
                <span className="truncate">
                  {r.fullname} {r.status === 'approved' ? 'กำลังยืมอยู่' : 'ส่งคำขอยืม'} • {new Date(r.request_date).toLocaleString()}
                </span>
                <span className={`text-xs rounded-full px-2 py-0.5 ${
                  r.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : r.status === 'approved' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                }`}>
                  {r.status === 'pending' ? 'รออนุมัติ' : 
                   r.status === 'approved' ? 'กำลังยืมอยู่' : 'ปฏิเสธ'}
                </span>
              </div>
            ))}
            {requests.length === 0 && <div className="text-sm text-gray-500">ยังไม่มีกิจกรรม</div>}
          </div>
        </div>

        {/* Calendar (current month) + today count */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in-scale" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-500" />
              ปฏิทินคำขอ (เดือนปัจจุบัน)
            </h3>
            <div className="text-sm text-gray-600">วันนี้: <span className="font-semibold text-emerald-600">{todayCount}</span> คำขอ</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
            {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendar.cells.map((cell, idx) => {
              const isToday = cell.day && new Date().getDate() === cell.day && 
                             new Date().getMonth() === calendar.month && 
                             new Date().getFullYear() === calendar.year;
              const hasRequests = cell.count && cell.count > 0;
              
              return (
                <div 
                  key={idx} 
                  className={`h-16 rounded-lg border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                    cell.day 
                      ? `border-gray-200 ${isToday ? 'bg-[#0EA5E9] text-white' : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-300'}`
                      : 'border-transparent'
                  }`}
                  onClick={() => {
                    if (cell.day && hasRequests) {
                      setSelectedDate(new Date(calendar.year, calendar.month, cell.day));
                      setShowModal(true);
                    }
                  }}
                  title={cell.day && hasRequests ? `คลิกเพื่อดูรายละเอียดคำขอในวันที่ ${cell.day}` : ''}
                >
                  {cell.day && (
                    <>
                      <div className={`text-sm ${isToday ? 'text-white font-bold' : 'text-gray-700'}`}>
                        {cell.day}
                      </div>
                      <div className={`text-xs ${
                        isToday 
                          ? 'text-white font-semibold' 
                          : hasRequests 
                            ? 'text-[#0EA5E9] font-semibold' 
                            : 'text-gray-400'
                      }`}>
                        {cell.count || 0} คำขอ
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-right">อัปเดตล่าสุด: {new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Line chart - daily borrow requests (last 14 days) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" /> คำขอรายวัน (14 วัน)
          </h3>
          <div className="text-sm text-gray-600">รวม: {lineData.reduce((s, d) => s + d.value, 0)} คำขอ</div>
        </div>
        {/* simple SVG line chart */}
        <div className="w-full h-48">
          {(() => {
            const width = 800; const height = 160; const pad = 30;
            const data = lineData; const max = Math.max(1, ...data.map(d => d.value));
            const stepX = (width - pad * 2) / (data.length - 1 || 1);
            const points = data.map((d, i) => {
              const x = pad + i * stepX; const y = height - pad - (d.value / max) * (height - pad * 2);
              return `${x},${y}`;
            }).join(' ');
            return (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <polyline fill="none" stroke="#0EA5E9" strokeWidth="3" points={points} />
                {data.map((d, i) => {
                  const x = pad + i * stepX; const y = height - pad - (d.value / max) * (height - pad * 2);
                  return <circle key={i} cx={x} cy={y} r={3} fill="#0EA5E9" />;
                })}
                {/* X labels */}
                {data.map((d, i) => (
                  <text key={`t${i}`} x={pad + i * stepX} y={height - 8} fontSize="10" textAnchor="middle" fill="#6B7280">{d.label}</text>
                ))}
                {/* Y axis */}
                <text x={4} y={12} fontSize="10" fill="#6B7280">สูงสุด {max}</text>
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Activity - notifications of actions (pending registrations) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด (คำขอสมัครสมาชิก)</h3>
        <div className="space-y-3 max-h-72 overflow-auto">
          {pending.slice(0, 20).map((p) => (
            <div key={p.id} className="text-sm text-gray-700 flex items-center justify-between">
              <span className="truncate">{p.fullname} ส่งคำขอสมัครสมาชิก • {new Date(p.requested_at).toLocaleString()}</span>
              <span className={`text-xs rounded-full px-2 py-0.5 ${p.status==='pending'?'bg-yellow-100 text-yellow-700': p.status==='approved'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{p.status}</span>
            </div>
          ))}
          {pending.length === 0 && <div className="text-sm text-gray-500">ยังไม่มีกิจกรรม</div>}
        </div>
      </div>

      </div>

      {/* Modal for showing request details */}
      {showModal && selectedDate && (
        <div 
          className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-all duration-300 ease-out ${
            modalVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={() => {
            setModalVisible(false);
            setTimeout(() => setShowModal(false), 300);
          }}
        >
          <div 
            className={`bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
              modalVisible 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                คำขอยืมในวันที่ {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
              </h3>
              <button
                onClick={() => {
                  setModalVisible(false);
                  setTimeout(() => setShowModal(false), 300);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(() => {
                const dayRequests = requests.filter(r => {
                  const dt = new Date(r.request_date);
                  return dt.getFullYear() === selectedDate.getFullYear() && 
                         dt.getMonth() === selectedDate.getMonth() && 
                         dt.getDate() === selectedDate.getDate();
                });
                
                return dayRequests.length > 0 ? (
                  dayRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{request.fullname}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.request_date).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`text-xs rounded-full px-2 py-1 ${
                        request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : request.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'pending' ? 'รออนุมัติ' : 
                         request.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>ไม่มีคำขอยืมในวันนี้</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};