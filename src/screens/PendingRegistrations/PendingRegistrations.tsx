import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { apiService, type PendingRegistration } from '../../services/api';
import { Search, Check, X, RefreshCcw, CheckSquare, Square } from 'lucide-react';
import Swal from 'sweetalert2';

export const PendingRegistrations: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [requests, setRequests] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSidebar = () => setSidebarCollapsed(v => !v);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.listPendingRegistrations();
      setRequests(res.data.requests);
    } catch (e: any) {
      setError(e.message || 'โหลดคำขอไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(r => [r.student_id, r.fullname, r.email].some(v => String(v).toLowerCase().includes(q)));
  }, [requests, query]);

  // const allSelected = filtered.length > 0 && filtered.every(r => selectedIds.includes(r.id));

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleApprove = async (ids: number[]) => {
    if (ids.length === 0) return;
    const c = await Swal.fire({ title: 'ยืนยันอนุมัติ', text: `ต้องการอนุมัติ ${ids.length} รายการหรือไม่?`, icon: 'question', showCancelButton: true, confirmButtonText: 'อนุมัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#0EA5E9' });
    if (!c.isConfirmed) return;
    try {
      for (const id of ids) {
        await apiService.reviewPendingRegistration(id, 'approve');
      }
      await fetchData();
      setSelectedIds([]);
      await Swal.fire({ title: 'สำเร็จ', text: 'อนุมัติรายการเรียบร้อย', icon: 'success', confirmButtonColor: '#0EA5E9' });
    } catch (e: any) {
      await Swal.fire({ title: 'ผิดพลาด', text: e.message || 'อนุมัติไม่สำเร็จ', icon: 'error', confirmButtonColor: '#0EA5E9' });
    }
  };

  const handleReject = async (ids: number[]) => {
    if (ids.length === 0) return;
    const c = await Swal.fire({ title: 'ยืนยันปฏิเสธ', text: `ต้องการปฏิเสธ ${ids.length} รายการหรือไม่?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'ปฏิเสธ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#dc2626' });
    if (!c.isConfirmed) return;
    try {
      for (const id of ids) {
        await apiService.reviewPendingRegistration(id, 'reject');
      }
      await fetchData();
      setSelectedIds([]);
      await Swal.fire({ title: 'สำเร็จ', text: 'ปฏิเสธรายการเรียบร้อย', icon: 'success', confirmButtonColor: '#0EA5E9' });
    } catch (e: any) {
      await Swal.fire({ title: 'ผิดพลาด', text: e.message || 'ปฏิเสธไม่สำเร็จ', icon: 'error', confirmButtonColor: '#0EA5E9' });
    }
  };

  

  const formatRequestedAt = (value: string | number | Date) => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `ขอเมื่อวันที่ ${day}/${month}/${year}, เวลา ${hh}:${mm}:${ss}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userRole={'admin'} />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <div className="min-h-screen p-4">
          <div className="mx-auto max-w-6xl space-y-4">
            {/* Header with search and actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2">
                <div className="relative min-w-[300px] w-full">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-gray-300 bg-zinc-100">
                      <Search className="h-4 w-4 text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหา รหัส | ชื่อ-นามสกุล | อีเมล"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 flex items-center gap-2" onClick={fetchData}>
                  <RefreshCcw className="w-4 h-4" /> รีเฟรช
                </button>
                <button className="px-3 py-2 text-sm rounded-md bg-[#0EA5E9] text-white hover:bg-emerald-700 flex items-center gap-2" onClick={() => handleApprove(selectedIds)}>
                  <Check className="w-4 h-4" /> อนุมัติที่เลือก
                </button>
                <button className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center gap-2" onClick={() => handleReject(selectedIds)}>
                  <X className="w-4 h-4" /> ปฏิเสธที่เลือก
                </button>
                <button className="px-3 py-2 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-800 flex items-center gap-2" onClick={() => handleApprove(filtered.map(r => r.id))}>
                  <CheckSquare className="w-4 h-4" /> อนุมัติทั้งหมดที่แสดง
                </button>
              </div>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="p-6 text-sm text-gray-500 bg-white rounded-xl border">กำลังโหลดคำขอ...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600 bg-white rounded-xl border">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 bg-white rounded-xl border">ไม่พบคำขอที่ตรงกับคำค้นหา</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(req => {
                  const selected = selectedIds.includes(req.id);
                  return (
                    <div key={req.id} className={`border rounded-xl p-4 bg-white ${selected ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{req.fullname}</div>
                          <div className="text-sm text-gray-600">{req.student_id}</div>
                          <div className="text-sm text-gray-600">{req.email}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatRequestedAt(req.requested_at)}</div>
                        </div>
                        <button onClick={() => toggleSelect(req.id)} className="text-gray-600 hover:text-blue-600">
                          {selected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button className="px-3 py-1 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1" onClick={() => handleApprove([req.id])}>
                          <Check className="w-4 h-4" /> อนุมัติ
                        </button>
                        <button className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center gap-1" onClick={() => handleReject([req.id])}>
                          <X className="w-4 h-4" /> ปฏิเสธ
                        </button>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PendingRegistrations;


