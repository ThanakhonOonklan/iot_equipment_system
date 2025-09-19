import React from 'react';
import { Clock, User, Package, CheckCircle, XCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'borrow' | 'return' | 'approve' | 'reject';
  user: string;
  device: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'borrow',
    user: 'นาย สมชาย ใจดี',
    device: 'Arduino Uno R3',
    timestamp: '5 นาทีที่แล้ว'
  },
  {
    id: '2',
    type: 'return',
    user: 'นางสาว สุดา ทอง',
    device: 'Raspberry Pi 4',
    timestamp: '15 นาทีที่แล้ว'
  },
  {
    id: '3',
    type: 'approve',
    user: 'นาย วิชัย สมบูรณ์',
    device: 'ESP32 Development Board',
    timestamp: '30 นาทีที่แล้ว'
  },
  {
    id: '4',
    type: 'reject',
    user: 'นางสาว มาลี ใจงาม',
    device: 'Sensor Kit',
    timestamp: '1 ชั่วโมงที่แล้ว'
  }
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'borrow':
      return <Package className="w-4 h-4 text-blue-600" />;
    case 'return':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'approve':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'reject':
      return <XCircle className="w-4 h-4 text-red-600" />;
  }
};

const getActivityText = (activity: Activity) => {
  switch (activity.type) {
    case 'borrow':
      return `${activity.user} ยืม ${activity.device}`;
    case 'return':
      return `${activity.user} คืน ${activity.device}`;
    case 'approve':
      return `อนุมัติคำขอยืม ${activity.device} ของ ${activity.user}`;
    case 'reject':
      return `ปฏิเสธคำขอยืม ${activity.device} ของ ${activity.user}`;
  }
};

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="text-sm text-[#0EA5E9] hover:text-[#0284C7] font-medium">
          ดูกิจกรรมทั้งหมด →
        </button>
      </div>
    </div>
  );
};