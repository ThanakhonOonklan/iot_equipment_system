import React from "react";
import { cn } from "../../lib/utils";

export type EquipmentStatus = "available" | "unavailable" | "maintenance" | "limited";

export interface EquipmentCardProps {
  name: string;
  category: string;
  quantityAvailable: number;
  quantityTotal?: number;
  status: EquipmentStatus;
  imageUrl?: string;
  className?: string;
  onSelect?: () => void;
}

const statusMap: Record<EquipmentStatus, { label: string; color: string; dot: string }> = {
  available: { label: "พร้อมยืม", color: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
  limited: { label: "เหลือน้อย", color: "text-amber-700 bg-amber-50", dot: "bg-amber-500" },
  unavailable: { label: "ไม่พร้อมยืม", color: "text-rose-700 bg-rose-50", dot: "bg-rose-500" },
  maintenance: { label: "ซ่อมบำรุง", color: "text-sky-700 bg-sky-50", dot: "bg-sky-500" },
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  name,
  category,
  quantityAvailable,
  quantityTotal,
  status,
  imageUrl,
  className,
  onSelect,
}) => {
  const statusCfg = statusMap[status] || statusMap.available;
  const total = typeof quantityTotal === 'number' ? quantityTotal : quantityAvailable;
  const available = Math.max(0, quantityAvailable);
  const ratio = total > 0 ? available / total : 0;
  const qtyColor = available === 0
    ? 'text-rose-700 bg-rose-50'
    : ratio < 0.5
      ? 'text-amber-700 bg-amber-50'
      : 'text-emerald-700 bg-emerald-50';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full text-left rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200",
        className
      )}
    >
      <div className="aspect-[3/2] w-full overflow-hidden rounded-t-xl bg-gray-50 flex items-center justify-center relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5Z" fill="currentColor"/>
            </svg>
          </div>
        )}
        <span className={cn("absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium", statusCfg.color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
          {statusCfg.label}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
            <p className="truncate text-xs text-gray-500">{category}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">จำนวน</span>
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", qtyColor)}>
            {available}/{total}
          </span>
        </div>
        {/* actions moved to SlideInPanel on card click */}
      </div>
    </button>
  );
};

export default EquipmentCard;


