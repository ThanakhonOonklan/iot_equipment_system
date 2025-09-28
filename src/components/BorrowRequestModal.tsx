import React, { useState } from 'react';
import { X, Calendar, Package, User, FileText } from 'lucide-react';

interface BorrowRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Array<{
    id: number;
    name: string;
    category: string;
    quantity_available: number;
    image_url?: string;
    description?: string;
    selected_quantity: number;
  }>;
  onSubmit: (data: {
    borrow_date: string;
    return_date: string;
    notes: string;
    items: Array<{
      equipment_id: number;
      quantity: number;
    }>;
  }) => void;
}

export const BorrowRequestModal: React.FC<BorrowRequestModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    borrow_date: '',
    return_date: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.borrow_date || !formData.return_date) {
      alert('กรุณาเลือกวันที่ยืมและวันที่คืน');
      return;
    }

    if (new Date(formData.borrow_date) >= new Date(formData.return_date)) {
      alert('วันที่คืนต้องมากกว่าวันที่ยืม');
      return;
    }

    const items = selectedItems.map(item => ({
      equipment_id: item.id,
      quantity: item.selected_quantity
    }));

    onSubmit({
      ...formData,
      items
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.selected_quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">รายการยืม-คืนอุปกรณ์</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            {/* ข้อมูลผู้ยืม */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">ข้อมูลผู้ยืม</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">ชื่อ: <span className="font-medium text-gray-800">ผู้ใช้ระบบ</span></p>
                <p className="text-gray-600">วันที่ส่งคำขอ: <span className="font-medium text-gray-800">{new Date().toLocaleDateString('th-TH')}</span></p>
              </div>
            </div>

            {/* วันที่ยืม-คืน */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">กำหนดการยืม-คืน</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่ต้องการยืม *
                  </label>
                  <input
                    type="date"
                    name="borrow_date"
                    value={formData.borrow_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่ต้องการคืน *
                  </label>
                  <input
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleInputChange}
                    min={formData.borrow_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* รายการอุปกรณ์ */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">รายการอุปกรณ์ที่เลือก ({totalItems} ชิ้น)</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">รูปภาพ</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ชื่ออุปกรณ์</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">หมวดหมู่</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">จำนวนที่เลือก</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">คงเหลือ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                              {item.selected_quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-600">{item.quantity_available}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุเพิ่มเติม
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)..."
              />
            </div>

            {/* ปุ่ม */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ส่งคำขอยืม
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
