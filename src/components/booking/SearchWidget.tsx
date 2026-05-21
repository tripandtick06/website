"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useT } from "@/lib/i18n/I18nProvider";

export function SearchWidget() {
  const t = useT();
  const router = useRouter();

  const TABS = [
    { id: "balloon", label: t.component.booking.search.tab_balon_ucusu, icon: Wind, path: "/balonlar" },
    { id: "hotel", label: t.component.booking.search.tab_otel, icon: Hotel, path: "/oteller" },
    { id: "atv", label: t.component.booking.search.tab_aktiviteler, icon: MountainSnow, path: "/aktiviteler" },
    { id: "tour", label: t.component.booking.search.tab_gezi_turlari, icon: TreePine, path: "/turlar" },
    { id: "package", label: t.component.booking.search.tab_paketler, icon: Package, path: "/paketler" },
  ];
  const [activeTab, setActiveTab] = useState("balloon");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("2026-03-20");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setSearching(true);

    // Override: destinasyon "Goreme"/"Göreme"/"Kapadokya" disinda doluysa /ara'ya yonlendir.
    const destTrimmed = destination.trim();
    const destNorm = destTrimmed.toLocaleLowerCase("tr");
    const isGoremeDefault =
      !destTrimmed ||
      destNorm === "goreme" ||
      destNorm === "göreme" ||
      destNorm.includes("kapadokya");

    if (!isGoremeDefault) {
      const qs = new URLSearchParams({ q: destTrimmed }).toString();
      setTimeout(() => {
        router.push(`/ara?${qs}`);
        setSearching(false);
      }, 300);
      return;
    }

    const tab = TABS.find((t) => t.id === activeTab);
    const basePath = tab?.path ?? "/balonlar";

    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (adults) params.set("adults", String(adults));
    if (activeTab !== "hotel" && children > 0) {
      params.set("children", String(children));
    }

    const qs = params.toString();
    const target = qs ? `${basePath}?${qs}` : basePath;

    setTimeout(() => {
      router.push(target);
      setSearching(false);
    }, 300);
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
            {t.component.booking.search.label_destinasyon}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t.component.booking.search.input_placeholder_goreme_kapadokya}
              className="input-field !pl-10"
              aria-label={t.component.booking.search.input_aria_label_destinasyon}
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t.component.booking.search.tarih}
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field !pl-10"
            />
          </div>
        </div>

        {/* Adults */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t.component.booking.search.yetiskin}
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
            {t.component.booking.search.cocuk_12}
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
          {searching
            ? t.component.booking.search.button_araniyor
            : t.component.booking.search.button_ara}
        </button>
      </div>

      {/* Age Warning */}
      {activeTab === "balloon" && (
        <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>{t.component.booking.search.onemli}</strong> {t.component.booking.search.yas_alti_cocuklar_balon}
          </div>
        </div>
      )}
    </div>
  );
}
