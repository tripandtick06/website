"use client";

import { cn } from "@/lib/utils";

/**
 * Booking-pill sekme cubugu. Aktif gosterge CSS transition ile kayar
 * (bg-primary scale+opacity gecisi; reduced-motion'da aninda gecer).
 * Radix degil — basit tek-secimli pill grubu icin yeterli, edge-safe.
 */
export interface PillTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface PillTabsProps {
  items: PillTabItem[];
  value: string;
  onValueChange: (id: string) => void;
  className?: string;
  /** Benzersizlik icin (ayni sayfada birden cok PillTabs varsa) — artik CSS'de kullanilmiyor ama API uyumu icin sakli. */
  groupId?: string;
}

export function PillTabs({ items, value, onValueChange, className }: PillTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.id)}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold",
              "transition-all duration-200 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.4]",
              active
                ? "bg-primary text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-primary"
            )}
          >
            {item.icon}
            {item.label}
            {item.count != null && (
              <span className={cn("text-xs", active ? "text-white/80" : "text-slate-400")}>
                ({item.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
