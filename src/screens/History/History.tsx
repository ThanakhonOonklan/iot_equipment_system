import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { apiService } from '../../services/api';
import { Search, User, Package, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface HistoryEntry {
  id: number;
  user_id: number;
  user_fullname: string;
  user_student_id: string;
  equipment_name: string;
  category: string;
  action: 'borrow' | 'return' | 'extend' | 'lost' | 'approve';
  action_date: string;
  approver_name?: string;
  equipment_count: number;
}

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

export const History: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);


  const toggleSidebar = () => setSidebarCollapsed(v => !v);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.raw<{ success: boolean; data: { history: HistoryEntry[] } }>('/borrowing_history.php', { method: 'GET' });
      const data = (res as any).data?.history || [];
      setEntries(data);
    } catch (e: any) {
      setError(e.message || 'โหลดประวัติไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => [e.user_fullname, e.user_student_id, e.equipment_name, e.approver_name].some(v => String(v ?? '').toLowerCase().includes(q)));
  }, [entries, query]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userRole={'admin'} />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <div className="min-h-screen p-4">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">ประวัติการยืม-คืน</h1>
              <div className="relative min-w-[260px]">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-gray-300 bg-zinc-100">
                    <Search className="h-4 w-4 text-gray-500" />
                  </span>
                  <input type="text" placeholder="ค้นหา ผู้ยืม | รหัส | อุปกรณ์ | ผู้อนุมัติ" value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-gray-500 bg-white rounded-xl border">กำลังโหลด...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600 bg-white rounded-xl border">{error}</div>
            ) : (
              <div className="space-y-3">
                {filtered.map(h => {
                  const isOpen = expandedId === h.id;
                  return (
                    <div key={h.id} className="bg-white border rounded-xl">
                      {/* Handle */}
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(isOpen ? null : h.id)}>
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" /> {h.user_fullname} | {h.user_student_id}
                            </div>
                            <div className="text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Package className="w-3 h-3" /> {h.equipment_name}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="inline-flex items-center gap-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  <CheckCircle className="w-3 h-3 mr-1" /> {h.action}
                                </span>
                              </span>
                              <span className="mx-2">•</span>
                              {formatThaiDateTime(h.action_date)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">อนุมัติโดย: {h.approver_name || '-'}</span>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <div className={`px-4 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2">รายละเอียดการยืม</h4>
                            <dl className="grid grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm font-medium text-gray-500">อุปกรณ์ที่ยืม</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {h.equipment_name}
                                  {h.equipment_count > 1 && ` และอีก ${h.equipment_count - 1} รายการ`}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">อนุมัติโดย</dt>
                                <dd className="mt-1 text-sm text-gray-900">{h.approver_name || '-'}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">วันที่ยืม</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatThaiDateTime(h.action_date)}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">สถานะ</dt>
                                <dd className="mt-1 text-sm text-gray-900">{h.action === 'return' ? 'คืนแล้ว' : 'กำลังยืม'}</dd>
                              </div>
                            </dl>
                          </div>
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

export default History;



