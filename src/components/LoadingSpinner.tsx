import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
        <Loader2 className="w-8 h-8 text-[#0EA5E9] animate-spin" />
        <p className="text-gray-700 font-medium">กำลังโหลด...</p>
      </div>
    </div>
  );
};
