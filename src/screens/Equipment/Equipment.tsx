import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import EquipmentCard, { EquipmentStatus } from "../../components/ui/EquipmentCard";
import apiService, { type Equipment as EquipmentModel } from "../../services/api";
import { Sidebar, SlideInPanel } from "../../components/Layout";
import { CreateEquipmentForm, EditEquipmentForm } from "../../components/EquipmentForms";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Swal from 'sweetalert2';

type EquipmentItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  status: EquipmentStatus;
  image_url?: string;
  description?: string;
  quantity_total?: number;
  quantity_available?: number;
};

export const Equipment: React.FC = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole] = useState<'admin' | 'staff' | 'user' | 'guest'>('user');
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<EquipmentItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    quantity_total: 0,
    quantity_available: 0,
    status: 'available' as EquipmentStatus,
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    quantity_total: 0,
    quantity_available: 0,
    status: 'available' as EquipmentStatus,
  });
  
  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);


  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.listEquipment();
        const data = res.data.equipment.map((e: EquipmentModel) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          quantity: e.quantity_available ?? e.quantity_total ?? 0,
          status: (e.status as EquipmentStatus) ?? 'available',
          image_url: e.image_url,
          description: e.description,
          quantity_total: e.quantity_total,
          quantity_available: e.quantity_available,
        }));
        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.name, it.category, it.status, String(it.quantity)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  // Pagination logic
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <>
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        userRole={userRole}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <div className="min-h-screen p-4">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex items-center justify-between gap-3">
            
              <div className="flex-1 flex items-center gap-2">
                <div className="relative min-w-[300px] w-full">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-gray-300 bg-zinc-100">
                      <Search className="h-4 w-4 text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาอุปกรณ์ตามชื่อ..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreate(true);
                  setCreateForm({
                    name: '',
                    description: '',
                    category: '',
                    image_url: '',
                    quantity_total: 0,
                    quantity_available: 0,
                    status: 'available',
                  });
                }}
                className="rounded-md bg-[#0EA5E9] px-3 py-2 text-sm font-medium text-white hover:bg-[#0284C7] flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                เพิ่มอุปกรณ์
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {totalItems} รายการ
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">แสดง</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={-1}>ทั้งหมด</option>
                </select>
                
                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <Card className="p-6 text-sm text-gray-500">กำลังโหลดข้อมูลอุปกรณ์...</Card>
            ) : error ? (
              <Card className="p-6 text-sm text-red-600">{error}</Card>
            ) : paginatedItems.length === 0 ? (
              <Card className="p-6 text-sm text-gray-500">ไม่พบอุปกรณ์ที่ตรงกับคำค้นหา</Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {paginatedItems.map((item) => {
                  // กำหนดสีขอบตามสถานะ
                  let borderColor = '';
                  if (item.status === 'unavailable') {
                    borderColor = 'border-yellow-400';
                  } else if (item.status === 'maintenance') {
                    borderColor = 'border-red-400';
                  } else {
                    borderColor = 'border-gray-200';
                  }
                  
                  return (
                    <div key={item.id} className={`border-2 ${borderColor} rounded-xl`}>
                      <EquipmentCard
                        name={item.name}
                        category={item.category}
                        quantityAvailable={item.quantity_available ?? item.quantity}
                        quantityTotal={item.quantity_total ?? item.quantity}
                        status={item.status}
                        imageUrl={item.image_url}
                        onSelect={() => {
                          setSelected(item);
                          setEditForm({
                            name: item.name,
                            description: item.description || '',
                            category: item.category,
                            image_url: item.image_url || '',
                            quantity_total: item.quantity_total ?? item.quantity,
                            quantity_available: item.quantity_available ?? item.quantity,
                            status: item.status,
                          });
                          setShowEdit(true);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    {/* Slide-in Panel แก้ไข/ลบอุปกรณ์ */}
    <SlideInPanel
      isOpen={showEdit && !!selected}
      onClose={() => !saving && setShowEdit(false)}
      title={selected ? `แก้ไขอุปกรณ์` : 'แก้ไขอุปกรณ์'}
      width="lg"
      disableBackdropClick={saving}
      headerActions={
        <>
          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            onClick={async () => {
              if (!selected) return;
              const confirm = await Swal.fire({
                title: 'ยืนยันการลบ',
                text: `ต้องการลบ "${selected.name}" หรือไม่?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ลบ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280'
              });
              if (!confirm.isConfirmed) return;
              try {
                setSaving(true);
                await apiService.deleteEquipment(selected.id);
                const res = await apiService.listEquipment();
                const data = res.data.equipment.map((e: EquipmentModel) => ({
                  id: e.id,
                  name: e.name,
                  category: e.category,
                  quantity: e.quantity_available ?? e.quantity_total ?? 0,
                  status: (e.status as EquipmentStatus) ?? 'available',
                  image_url: e.image_url,
                  description: e.description,
                  quantity_total: e.quantity_total,
                  quantity_available: e.quantity_available,
                }));
                setItems(data);
                setShowEdit(false);
                await Swal.fire({ title: 'สำเร็จ!', text: 'ลบอุปกรณ์เรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#0EA5E9' });
              } catch (err: any) {
                await Swal.fire({ title: 'ผิดพลาด', text: err.message || 'ลบไม่สำเร็จ', icon: 'error', confirmButtonColor: '#0EA5E9' });
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            ลบ
          </button>
          <button
            type="button"
            className="bg-[#0EA5E9] text-white px-4 py-2 rounded-lg hover:bg-[#0284C7] disabled:opacity-50"
            onClick={async () => {
              if (!selected) return;
              try {
                setSaving(true);
                await apiService.updateEquipment(selected.id, editForm);
                const res = await apiService.listEquipment();
                const data = res.data.equipment.map((e: EquipmentModel) => ({
                  id: e.id,
                  name: e.name,
                  category: e.category,
                  quantity: e.quantity_available ?? e.quantity_total ?? 0,
                  status: (e.status as EquipmentStatus) ?? 'available',
                  image_url: e.image_url,
                  description: e.description,
                  quantity_total: e.quantity_total,
                  quantity_available: e.quantity_available,
                }));
                setItems(data);
                setShowEdit(false);
                await Swal.fire({ title: 'สำเร็จ!', text: 'แก้ไขอุปกรณ์เรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#0EA5E9' });
              } catch (err: any) {
                await Swal.fire({ title: 'ผิดพลาด', text: err.message || 'แก้ไขไม่สำเร็จ', icon: 'error', confirmButtonColor: '#0EA5E9' });
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </>
      }
    >
      <EditEquipmentForm
        editForm={editForm}
        setEditForm={setEditForm}
        editError={null}
      />
    </SlideInPanel>

    {/* Slide-in Panel เพิ่มอุปกรณ์ */}
    <SlideInPanel
      isOpen={showCreate}
      onClose={() => !creating && setShowCreate(false)}
      title="เพิ่มอุปกรณ์"
      width="lg"
      disableBackdropClick={creating}
      headerActions={
        <button
          type="submit"
          className="bg-[#0EA5E9] text-white px-4 py-2 rounded-lg hover:bg-[#0284C7] disabled:opacity-50"
          onClick={async () => {
            try {
              setCreating(true);
                await apiService.createEquipment(createForm);
                const res = await apiService.listEquipment();
                const data = res.data.equipment.map((e: EquipmentModel) => ({
                  id: e.id,
                  name: e.name,
                  category: e.category,
                  quantity: e.quantity_available ?? e.quantity_total ?? 0,
                  status: (e.status as EquipmentStatus) ?? 'available',
                  image_url: e.image_url,
                  description: e.description,
                  quantity_total: e.quantity_total,
                  quantity_available: e.quantity_available,
                }));
                setItems(data);
              setShowCreate(false);
              setCreateForm({
                name: '',
                description: '',
                category: '',
                image_url: '',
                quantity_total: 0,
                quantity_available: 0,
                status: 'available',
              });
              
              await Swal.fire({
                title: 'สำเร็จ!',
                text: 'เพิ่มอุปกรณ์เรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#0EA5E9'
              });
            } catch (e: any) {
              await Swal.fire({
                title: 'ผิดพลาด',
                text: e.message || 'เพิ่มอุปกรณ์ไม่สำเร็จ',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#0EA5E9'
              });
            } finally {
              setCreating(false);
            }
          }}
          disabled={creating}
        >
          {creating ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      }
    >
      <CreateEquipmentForm
        createForm={createForm}
        setCreateForm={setCreateForm}
        formError={null}
      />
    </SlideInPanel>
    </>
  );
};

export default Equipment;


