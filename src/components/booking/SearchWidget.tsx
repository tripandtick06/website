"use client";

import { useState } from "react";
import {
  Wind,
  Hotel,
  MountainSnow,
  TreePine,
  Package,
  CalendarDays,
  MapPin,
  Search,
  Minus,
  Plus,
  AlertTriangle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "balloon", label: "Balon Uçuşu", icon: Wind },
  { id: "hotel", label: "Otel", icon: Hotel },
  { id: "atv", label: "Aktiviteler", icon: MountainSnow },
  { id: "tour", label: "Gezi Turları", icon: TreePine },
  { id: "package", label: "Paketler", icon: Package },
];

export function SearchWidget() {
  const [activeTab, setActiveTab] = useState("balloon");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => setSearching(false), 1500);
  };

  return (
    <div className="w-full max-w-[880px] bg-white rounded-2xl sm:rounded-3xl shadow-elevated p-5 sm:p-7 mx-auto">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-4 mb-5 border-b border-slate-100 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_auto] gap-3 items-end">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Destinasyon
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Göreme, Kapadokya"
              className="input-field !pl-10"
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tarih
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              defaultValue="2026-03-20"
              className="input-field !pl-10"
            />
          </div>
        </div>

        {/* Adults */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Yetişkin
          </label>
          <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className="w-10 h-[46px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-primary" />
            </button>
            <span className="flex-1 text-center font-bold text-slate-800">{adults}</span>
            <button
              onClick={() => setAdults(Math.min(20, adults + 1))}
              className="w-10 h-[46px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Çocuk (7-12)
          </label>
          <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setChildren(Math.max(0, children - 1))}
              className="w-10 h-[46px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-primary" />
            </button>
            <span className="flex-1 text-center font-bold text-slate-800">{children}</span>
            <button
              onClick={() => setChildren(Math.min(10, children + 1))}
              className="w-10 h-[46px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={searching}
          className="btn-accent flex items-center justify-center gap-2.5 !py-3 lg:col-span-1 sm:col-span-2 lg:!px-8"
        >
          <Search className="w-5 h-5" />
          {searching ? "Aranıyor..." : "Ara"}
        </button>
      </div>

      {/* Age Warning */}
      {activeTab === "balloon" && (
        <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>Önemli:</strong> 6 yaş altı çocuklar balon uçuşlarına katılamaz. Hamileler
            ve ciddi kalp/sağlık sorunu olanlar binemez.
          </div>
        </div>
      )}
    </div>
  );
}
