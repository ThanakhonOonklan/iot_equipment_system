import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "../../components/Layout/Sidebar";
import { EquipmentCard, EquipmentStatus } from "../../components/ui/EquipmentCard";
import { BorrowRequestModal } from "../../components/BorrowRequestModal";
import { apiService } from "../../services/api";
import { Search, ShoppingCart, Send } from "lucide-react";

interface EquipmentItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  status: EquipmentStatus;
  image_url?: string;
  description?: string;
  quantity_total?: number;
  quantity_available?: number;
}

interface SelectedEquipment {
  id: number;
  name: string;
  category: string;
  quantity_available: number;
  image_url?: string;
  description?: string;
  selected_quantity: number; // จำนวนชิ้นที่เลือกยืม
}

export const BorrowEquipment: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedEquipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showBorrowModal, setShowBorrowModal] = useState(false);

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
        const data = res.data.equipment.map((e: any) => ({
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
    let filteredItems = items;
    
    // กรองตามหมวดหมู่
    if (selectedCategory) {
      filteredItems = filteredItems.filter(item => item.category === selectedCategory);
    }
    
    // กรองตามคำค้นหา
    if (q) {
      filteredItems = filteredItems.filter((it) =>
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q)
      );
    }
    
    return filteredItems;
  }, [items, query, selectedCategory]);

  // ดึงรายการหมวดหมู่ที่ไม่ซ้ำ
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [items]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const handleEquipmentSelect = (item: EquipmentItem) => {
    // ตรวจสอบว่าอุปกรณ์พร้อมยืมหรือไม่ (ยืมได้เมื่อสถานะ available หรือ limited และมีจำนวนคงเหลือ > 0)
    if ((item.status !== 'available' && item.status !== 'limited') || item.quantity_available === 0) {
      return;
    }

    // ตรวจสอบว่าอุปกรณ์นี้ถูกเลือกแล้วหรือไม่
    const existingItem = selectedItems.find(selected => selected.id === item.id);
    
    if (existingItem) {
      // ถ้าเลือกแล้ว ให้เพิ่มจำนวน 1 ชิ้น
      if (existingItem.selected_quantity < (item.quantity_available || 0)) {
        setSelectedItems(prev => prev.map(selected => 
          selected.id === item.id 
            ? { ...selected, selected_quantity: selected.selected_quantity + 1 }
            : selected
        ));
      }
    } else {
      // ถ้ายังไม่เลือก ให้เพิ่มเข้าไป 1 ชิ้น
      setSelectedItems(prev => [...prev, {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity_available: item.quantity_available || 0,
        image_url: item.image_url,
        description: item.description,
        selected_quantity: 1,
      }]);
    }
  };

  const handleRemoveSelected = (id: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleIncreaseQuantity = (id: number, maxAvailable: number) => {
    setSelectedItems(prev => prev.map(item => 
      item.id === id && item.selected_quantity < maxAvailable
        ? { ...item, selected_quantity: item.selected_quantity + 1 }
        : item
    ));
  };

  const handleDecreaseQuantity = (id: number) => {
    setSelectedItems(prev => prev.map(item => 
      item.id === id && item.selected_quantity > 1
        ? { ...item, selected_quantity: item.selected_quantity - 1 }
        : item
    ).filter(item => item.selected_quantity > 0));
  };

  const handleBorrowRequest = () => {
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกอุปกรณ์ที่ต้องการยืม');
      return;
    }
    
    setShowBorrowModal(true);
  };

  const handleSubmitBorrowRequest = async (data: {
    borrow_date: string;
    return_date: string;
    notes: string;
    items: Array<{
      equipment_id: number;
      quantity: number;
    }>;
  }) => {
    try {
      const currentUser = apiService.getCurrentUser();
      if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      const requestData = {
        user_id: currentUser.id,
        borrow_date: data.borrow_date,
        return_date: data.return_date,
        notes: data.notes,
        items: data.items
      };

      await apiService.createBorrowRequest(requestData);
      
      // รีเซ็ตข้อมูล
      setSelectedItems([]);
      setShowBorrowModal(false);
      
      alert('ส่งคำขอยืมเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error creating borrow request:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userRole="user" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">ยืมอุปกรณ์</h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userRole="user" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">ยืมอุปกรณ์</h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} userRole="user" />
      <div className="flex-1 flex flex-col overflow-hidden">
     


        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Equipment List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Controls */}
            <div className="p-4 bg-white border-b">
              <div className="flex items-center gap-4">
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
                
                {/* ช่องเลือกหมวดหมู่ */}
                <div className="min-w-[200px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">ทุกหมวดหมู่</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {totalItems} รายการ
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 รายการ/หน้า</option>
                    <option value={10}>10 รายการ/หน้า</option>
                    <option value={20}>20 รายการ/หน้า</option>
                    <option value={50}>50 รายการ/หน้า</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {paginatedItems.map((item) => {
                  const isSelected = selectedItems.some(selected => selected.id === item.id);
                  const isAvailable = (item.status === 'available' || item.status === 'limited') && (item.quantity_available || 0) > 0;
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative ${isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''} ${!isAvailable ? 'opacity-50' : ''}`}
                    >
                      <EquipmentCard
                        name={item.name}
                        category={item.category}
                        quantityAvailable={item.quantity_available ?? item.quantity}
                        quantityTotal={item.quantity_total ?? item.quantity}
                        status={item.status}
                        imageUrl={item.image_url}
                        onSelect={() => handleEquipmentSelect(item)}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {selectedItems.find(selected => selected.id === item.id)?.selected_quantity || 0}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Selected Items */}
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                รายการอุปกรณ์ที่เลือก ({selectedItems.reduce((sum, item) => sum + item.selected_quantity, 0)} ชิ้น)
              </h2>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {selectedItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>ยังไม่ได้เลือกอุปกรณ์</p>
                  <p className="text-sm">คลิกที่อุปกรณ์เพื่อเลือก</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">{item.category}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            คงเหลือ: {item.quantity_available} ชิ้น
                          </p>
                          
                          {/* ปุ่มควบคุมจำนวน */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleDecreaseQuantity(item.id)}
                              className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium min-w-[20px] text-center">
                              {item.selected_quantity}
                            </span>
                            <button
                              onClick={() => handleIncreaseQuantity(item.id, item.quantity_available || 0)}
                              disabled={item.selected_quantity >= (item.quantity_available || 0)}
                              className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSelected(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Borrow Button */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleBorrowRequest}
                disabled={selectedItems.length === 0}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                ส่งคำขอยืม ({selectedItems.reduce((sum, item) => sum + item.selected_quantity, 0)} ชิ้น)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
      <BorrowRequestModal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        selectedItems={selectedItems}
        onSubmit={handleSubmitBorrowRequest}
      />
    </div>
  );
};

