import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { apiService, type BorrowRequest } from '../../services/api';
import { ChevronDown, ChevronRight, Check, X, RefreshCcw, Search, User } from 'lucide-react';
import Swal from 'sweetalert2';

const formatThaiDateTime = (value: string | number | Date) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const buddhistYear = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${buddhistYear} ${hh}:${mm}`;
};

const formatThaiDate = (value: string | number | Date) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const buddhistYear = d.getFullYear() + 543;
  return `${day}/${month}/${buddhistYear}`;
};

export const BorrowRequests: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const toggleSidebar = () => setSidebarCollapsed(v => !v);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.listBorrowRequests();
      // Only show pending requests
      const pendingRequests = (res.data.requests || []).filter(req => req.status === 'pending');
      setRequests(pendingRequests);
    } catch (e: any) {
      setError(e.message || 'โหลดรายการคำขอไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(r => [r.fullname, r.student_id].some(v => String(v).toLowerCase().includes(q)));
  }, [requests, query]);

  const handleApprove = async (id: number) => {
    const c = await Swal.fire({ title: 'ยืนยันอนุมัติ', text: 'อนุมัติคำขอนี้และบันทึกการยืมลงฐานข้อมูลหรือไม่?', icon: 'question', showCancelButton: true, confirmButtonText: 'อนุมัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#0EA5E9' });
    if (!c.isConfirmed) return;
    
    try {
      const approver = apiService.getCurrentUser();
      // Find the request to get details
      const request = requests.find(r => r.id === id);
      if (!request) throw new Error('ไม่พบคำขอ');

      // อนุมัติคำขอผ่าน API (จะสร้าง borrowing records, update equipment, create history, และลบคำขอโดยอัตโนมัติ)
      const approveResponse = await apiService.raw('/borrow_requests.php', { method: 'PUT', body: JSON.stringify({ id, action: 'approve', approver_id: approver?.id }) } as any) as any;
      console.log('Approve response:', approveResponse);
      
      if (!approveResponse.success) {
        throw new Error(approveResponse.message || 'ไม่สามารถอนุมัติคำขอได้');
      }

      // ลบคำขอออกจาก UI ทันที (เมื่อ API สำเร็จ)
      setRequests(prev => prev.filter(r => r.id !== id));
      
      await Swal.fire({ title: 'สำเร็จ', text: 'บันทึกการยืมเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#0EA5E9' });
    } catch (e: any) {
      console.error('Approve error:', e);
      // แสดงข้อความผิดพลาดที่ได้จาก server
      const msg = e?.message || 'ไม่สามารถอนุมัติคำขอได้';
      await Swal.fire({ title: 'ผิดพลาด', text: msg, icon: 'error', confirmButtonColor: '#0EA5E9' });
    }
  };

  const handleReject = async (id: number) => {
    const c = await Swal.fire({
      title: 'ปฏิเสธคำขอ',
      text: 'ต้องการปฏิเสธคำขอนี้ใช่ไหม?',
      input: 'textarea',
      inputPlaceholder: 'เหตุผล (ถ้ามี)',
      showCancelButton: true,
      confirmButtonText: 'ปฏิเสธ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc2626'
    });
    if (!c.isConfirmed) return;
    const notes = (c.value || '').toString();
    try {
      // 1) mark as rejected (for history)
      await apiService.raw('/borrow_requests.php', { method: 'PUT', body: JSON.stringify({ id, action: 'reject', notes }) } as any);
      // 2) remove from current list immediately
      setRequests(prev => prev.filter(r => r.id !== id));
      // 3) delete the request record
      await apiService.deleteBorrowRequest(id);
      // 4) refresh in background
      fetchData();
      await Swal.fire({ title: 'สำเร็จ', text: 'ปฏิเสธคำขอและลบออกจากรายการแล้ว', icon: 'success', confirmButtonColor: '#0EA5E9' });
    } catch (e) {
      console.error(e);
      await Swal.fire({ title: 'ผิดพลาด', text: 'ปฏิเสธไม่สำเร็จ', icon: 'error', confirmButtonColor: '#0EA5E9' });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userRole={'admin'} />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <div className="min-h-screen p-4">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">จัดการคำขอยืม</h1>
              <div className="flex items-center gap-2">
                <div className="relative min-w-[260px]">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-gray-300 bg-zinc-100">
                      <Search className="h-4 w-4 text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหา ชื่อ | รหัสนักศึกษา"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 flex items-center gap-2" onClick={fetchData}>
                  <RefreshCcw className="w-4 h-4" /> รีเฟรช
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-gray-500 bg-white rounded-xl border">กำลังโหลดคำขอ...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600 bg-white rounded-xl border">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 bg-white rounded-xl border">ยังไม่มีคำขอ</div>
            ) : (
              <div className="space-y-3">
                {filtered.map(req => {
                  const isOpen = expandedId === req.id;
                  return (
                    <div key={req.id} className="bg-white border rounded-xl">
                      {/* Handle */}
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(isOpen ? null : req.id)}>
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" /> {req.fullname} | {req.student_id}
                            </div>
                            <div className="text-xs text-gray-500">วันที่ต้องการยืม: {formatThaiDate(req.borrow_date)} | วันที่ต้องการคืน: {formatThaiDate(req.return_date)} | ส่งคำขอเมื่อวันที่ : {formatThaiDateTime(req.request_date)} </div>
                            
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 rounded-md text-white bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 flex items-center gap-1" onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }}>
                            <Check className="w-4 h-4" /> อนุมัติ
                          </button>
                          <button className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center gap-1" onClick={(e) => { e.stopPropagation(); handleReject(req.id); }}>
                            <X className="w-4 h-4" /> ปฏิเสธ
                          </button>
                        </div>
                      </div>
                      {/* Content */}
                      <div className={`px-4 transition-all duration-1000 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-16">ลำดับ</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ชื่ออุปกรณ์</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">หมวดหมู่</th>
                                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">จำนวนที่ขอ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {(req.items || []).map((it, idx) => (
                                  <tr key={it.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center text-sm text-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                      <div className="font-medium text-gray-900">{it.equipment_name}</div>
                                    </td>
                                    <td className="px-4 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{it.category}</span></td>
                                    <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">{it.quantity_requested}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {req.notes && (
                            <div className="px-4 py-3 border-t bg-white">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">หมายเหตุ:</span> {req.notes}
                              </div>
                            </div>
                          )}
                        </div>
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

export default BorrowRequests;


