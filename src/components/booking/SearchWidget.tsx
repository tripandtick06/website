"use client";

// Anasayfa hero arama widget'i (booking-tarzi cila).
// Importers: src/components/sections/HeroSection.tsx
// Routing/state logic (Goreme override, query params) DEGISMEDI — sadece sunum.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wind, Hotel, MountainSnow, TreePine, Package,
  CalendarDays, MapPin, Search,
} from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import { PillTabs, type PillTabItem } from "@/components/ui/PillTabs";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

export function SearchWidget() {
  const t = useT();
  const router = useRouter();

  const TABS: { id: string; label: string; icon: typeof Wind; path: string }[] = [
    { id: "balloon", label: t.component.booking.search.tab_balon_ucusu, icon: Wind, path: "/balonlar" },
    { id: "hotel", label: t.component.booking.search.tab_otel, icon: Hotel, path: "/oteller" },
    { id: "atv", label: t.component.booking.search.tab_aktiviteler, icon: MountainSnow, path: "/aktiviteler" },
    { id: "tour", label: t.component.booking.search.tab_gezi_turlari, icon: TreePine, path: "/turlar" },
    { id: "package", label: t.component.booking.search.tab_paketler, icon: Package, path: "/paketler" },
  ];
  const tabItems: PillTabItem[] = TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    icon: <tab.icon className="h-4 w-4" aria-hidden />,
  }));

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

    const tab = TABS.find((tb) => tb.id === activeTab);
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

  const labelCls = "text-[11px] font-bold text-slate-500 uppercase tracking-wider";

  return (
    <div className="mx-auto w-full max-w-[880px] rounded-2xl bg-white p-5 shadow-elevated sm:rounded-3xl sm:p-7">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <PillTabs items={tabItems} value={activeTab} onValueChange={setActiveTab} groupId="hero-search" />
      </div>

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_auto]">
        {/* Destination */}
        <div className="space-y-1.5">
          <label htmlFor="sw-dest" className={labelCls}>{t.component.booking.search.label_destinasyon}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="sw-dest"
              type="text"
              name="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t.component.booking.search.input_placeholder_goreme_kapadokya}
              className="input-field !pl-10 focus-visible:ring-2 focus-visible:ring-booking/[0.35]"
              aria-label={t.component.booking.search.input_aria_label_destinasyon}
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="sw-date" className={labelCls}>{t.component.booking.search.tarih}</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="sw-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field !pl-10 focus-visible:ring-2 focus-visible:ring-booking/[0.35]"
            />
          </div>
        </div>

        {/* Adults */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t.component.booking.search.yetiskin}</label>
          <div className="flex h-[50px] items-center justify-center rounded-booking border-2 border-slate-200">
            <Stepper value={adults} onChange={setAdults} min={1} max={20} label={t.component.booking.search.yetiskin} />
          </div>
        </div>

        {/* Children */}
        <div className="space-y-1.5">
          <label className={labelCls}>{t.component.booking.search.cocuk_12}</label>
          <div className="flex h-[50px] items-center justify-center rounded-booking border-2 border-slate-200">
            <Stepper value={children} onChange={setChildren} min={0} max={10} label={t.component.booking.search.cocuk_12} />
          </div>
        </div>

        {/* Search */}
        <Button
          onClick={handleSearch}
          loading={searching}
          variant="accent"
          size="lg"
          className="sm:col-span-2 lg:col-span-1 lg:!px-8"
        >
          {!searching && <Search className="h-5 w-5" aria-hidden />}
          {searching ? t.component.booking.search.button_araniyor : t.component.booking.search.button_ara}
        </Button>
      </div>

      {/* Yas uyarisi — balon */}
      {activeTab === "balloon" && (
        <Banner variant="warning" className="mt-4">
          <strong>{t.component.booking.search.onemli}</strong> {t.component.booking.search.yas_alti_cocuklar_balon}
        </Banner>
      )}
    </div>
  );
}
