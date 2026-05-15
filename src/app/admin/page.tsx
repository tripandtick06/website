"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  TrendingUp,
  Users as UsersIcon,
  Sun,
  Cloud,
  CloudRain,
  Plus,
  Bot,
  RefreshCcw,
  Search,
  ExternalLink,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";
import { OPERATORS } from "@/data/services/operators";
import { formatPrice, cn } from "@/lib/utils";
import type { AvailabilityStatus, DayAvailability } from "@/data/availability";
import {
  MOCK_BOOKINGS,
  getBookingStats,
  type BookingStatus,
} from "@/data/mock-bookings";
import {
  MOCK_CUSTOMERS,
  getCustomerStats,
  getNationalityLabel,
  type CustomerSegment,
} from "@/data/mock-customers";
import type { Coupon, CouponType } from "@/data/coupons";
import { getCouponStatus } from "@/data/coupons";

const ADMIN_AUTH_KEY = "tripandtick:admin:auth";

type Tab =
  | "dashboard"
  | "fiyatlar"
  | "rezervasyonlar"
  | "takvim"
  | "operatorler"
  | "kuponlar"
  | "musteriler"
  | "seo";
type BookingFilter = "all" | BookingStatus;

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get("tab") as Tab) ?? "dashboard";
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const next = (searchParams?.get("tab") as Tab) ?? "dashboard";
    setTab(next);
  }, [searchParams]);

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
        {tab === "dashboard" && "Dashboard"}
        {tab === "fiyatlar" && "Fiyat Yonetimi"}
        {tab === "rezervasyonlar" && "Rezervasyonlar"}
        {tab === "takvim" && "Takvim & Doluluk"}
        {tab === "operatorler" && "Operatorler"}
        {tab === "kuponlar" && "Kuponlar"}
        {tab === "musteriler" && "Musteriler"}
        {tab === "seo" && "SEO Agent"}
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        {tab === "dashboard" && "Gunluk ozet, son rezervasyonlar ve doluluk."}
        {tab === "fiyatlar" && "Balon paket fiyatlarini guncelleyin."}
        {tab === "rezervasyonlar" && "Tum rezervasyonlari filtrele ve yonet."}
        {tab === "takvim" && "Aylik takvim, gunluk doluluk durumu."}
        {tab === "operatorler" && "Operatorler ve komisyon yonetimi."}
        {tab === "kuponlar" && "Kupon kodlari, indirim oranlari ve kullanim limitleri."}
        {tab === "musteriler" && "Musteri segmentleri, harcama ve aktivite."}
        {tab === "seo" && "SEO agent makale uretim panosu."}
      </p>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "fiyatlar" && <PricesTab />}
      {tab === "rezervasyonlar" && <BookingsTab />}
      {tab === "takvim" && <CalendarTab />}
      {tab === "operatorler" && <OperatorsTab />}
      {tab === "kuponlar" && <CouponsTab />}
      {tab === "musteriler" && <CustomersTab />}
      {tab === "seo" && <SeoAgentTab />}
    </div>
  );
}

function DashboardTab() {
  const stats = useMemo(() => getBookingStats(), []);
  const recentBookings = useMemo(
    () =>
      [...MOCK_BOOKINGS]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 10),
    []
  );
  const occupancy = Math.min(
    100,
    Math.round((stats.byStatus.confirmed + stats.byStatus.completed) / Math.max(1, stats.total) * 100)
  );

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          title="Bugün Rezervasyon"
          value={String(stats.todayCount)}
          delta={`${stats.byStatus.pending} bekliyor`}
          tone="emerald"
        />
        <StatCard
          icon={TrendingUp}
          title="Aylık Gelir"
          value={formatPrice(stats.monthRevenue, "EUR")}
          delta={`${stats.total} toplam rez.`}
          tone="amber"
        />
        <StatCard
          icon={UsersIcon}
          title="Doluluk Oranı"
          value={`${occupancy}%`}
          delta={`${stats.byStatus.confirmed} onaylı`}
          tone="primary"
        />
        <StatCard
          icon={CalendarDays}
          title="Ort. Sepet"
          value={formatPrice(stats.averageTicket, "EUR")}
          delta={formatPrice(stats.todayRevenue, "EUR") + " bugün"}
          tone="slate"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Son Rezervasyonlar</h2>
            <span className="text-xs text-slate-400">son 10 kayıt</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2">Kod</th>
                  <th className="py-2">Müşteri</th>
                  <th className="py-2">Hizmet</th>
                  <th className="py-2">Tarih</th>
                  <th className="py-2 text-right">Tutar</th>
                  <th className="py-2 text-right">Durum</th>
                  <th className="py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 font-mono text-xs">{b.id}</td>
                    <td className="py-2">{b.customerName}</td>
                    <td className="py-2 text-slate-600">{b.serviceName}</td>
                    <td className="py-2 text-slate-600">{b.date}</td>
                    <td className="py-2 text-right font-medium">{formatPrice(b.total, b.currency)}</td>
                    <td className="py-2 text-right"><StatusBadge status={b.status} /></td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/rezervasyon/${b.id}`}
                        className="text-primary hover:text-primary-dark inline-flex items-center gap-1 text-xs font-medium"
                      >
                        Detay <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-3">Operatör Doluluk</h3>
            <div className="space-y-2">
              {OPERATORS.slice(0, 6).map((o, i) => {
                const pct = 90 - i * 10;
                return (
                  <div key={o.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700">{o.name}</span>
                      <span className="text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <WeatherCard />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, delta, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  delta?: string;
  tone: "emerald" | "amber" | "primary" | "slate";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    primary: "bg-blue-50 text-blue-600",
    slate: "bg-slate-100 text-slate-600",
  }[tone];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">{title}</p>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", toneClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {delta && <span className="text-xs font-medium text-emerald-600">{delta}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { color: string; label: string }> = {
    confirmed: { color: "bg-emerald-100 text-emerald-700", label: "Onaylı" },
    pending: { color: "bg-amber-100 text-amber-700", label: "Bekliyor" },
    cancelled: { color: "bg-rose-100 text-rose-700", label: "İptal" },
    completed: { color: "bg-slate-100 text-slate-700", label: "Tamam" },
  };
  const m = map[status];
  return <span className={cn("inline-block px-2 py-0.5 rounded text-xs", m.color)}>{m.label}</span>;
}

function WeatherCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-bold text-slate-900 mb-3">Hava Durumu (Kapadokya)</h3>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { d: "Yarın", t: "12°C", icon: Sun, status: "Açık", color: "text-amber-500" },
          { d: "+2 gün", t: "9°C", icon: Cloud, status: "Bulutlu", color: "text-slate-500" },
          { d: "+3 gün", t: "7°C", icon: CloudRain, status: "Yağışlı", color: "text-blue-500" },
        ].map((w) => {
          const Icon = w.icon;
          return (
            <div key={w.d} className="border border-slate-100 rounded-lg p-3">
              <p className="text-slate-500">{w.d}</p>
              <Icon className={cn("w-7 h-7 mx-auto my-2", w.color)} />
              <p className="font-bold">{w.t}</p>
              <p className="text-slate-500">{w.status}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-3">Faz 2: OpenWeatherMap API ile canlı veri.</p>
    </div>
  );
}

function PricesTab() {
  const [packages, setPackages] = useState(() => BALLOON_PACKAGES.map((p) => ({ ...p })));

  function updatePrice(idx: number, field: "adultPrice" | "marketPrice", value: number) {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
          <tr>
            <th className="p-4">Slug</th>
            <th className="p-4">Paket Adı</th>
            <th className="p-4">Sure</th>
            <th className="p-4 text-right">Yetiskin €</th>
            <th className="p-4 text-right">Piyasa €</th>
            <th className="p-4 text-right">Marj</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((p, i) => {
            const margin = p.marketPrice ? Math.round(((p.marketPrice - p.adultPrice) / p.marketPrice) * 100) : 0;
            return (
              <tr key={p.slug} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-mono text-xs text-slate-500">{p.slug}</td>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-slate-600">{p.duration}</td>
                <td className="p-4 text-right">
                  <input
                    type="number"
                    value={p.adultPrice}
                    onChange={(e) => updatePrice(i, "adultPrice", Number(e.target.value))}
                    className="w-24 text-right border border-slate-200 rounded px-2 py-1"
                  />
                </td>
                <td className="p-4 text-right">
                  <input
                    type="number"
                    value={p.marketPrice}
                    onChange={(e) => updatePrice(i, "marketPrice", Number(e.target.value))}
                    className="w-24 text-right border border-slate-200 rounded px-2 py-1"
                  />
                </td>
                <td className={cn("p-4 text-right font-medium", margin > 0 ? "text-emerald-600" : "text-slate-400")}>
                  {margin}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-500">Faz 2: Supabase persist + audit log.</p>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Değişiklikleri Kaydet (Demo)
        </button>
      </div>
    </div>
  );
}

function BookingsTab() {
  const all = MOCK_BOOKINGS;
  const [statusFilter, setStatusFilter] = useState<BookingFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = all.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        b.customerName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta, kod veya hizmet ara..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingFilter)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="all">Tüm Durumlar ({all.length})</option>
          <option value="confirmed">Onaylı</option>
          <option value="pending">Bekliyor</option>
          <option value="cancelled">İptal</option>
          <option value="completed">Tamamlanan</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Kod</th>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Hizmet</th>
              <th className="p-3">Tarih</th>
              <th className="p-3 text-right">Kişi</th>
              <th className="p-3 text-right">Tutar</th>
              <th className="p-3 text-right">Durum</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">{b.id}</td>
                <td className="p-3">
                  <p>{b.customerName}</p>
                  <p className="text-xs text-slate-400">{b.customerEmail}</p>
                </td>
                <td className="p-3 text-slate-600">{b.serviceName}</td>
                <td className="p-3 text-slate-600">{b.date}</td>
                <td className="p-3 text-right">{b.pax}</td>
                <td className="p-3 text-right font-medium">{formatPrice(b.total, b.currency)}</td>
                <td className="p-3 text-right"><StatusBadge status={b.status} /></td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/rezervasyon/${b.id}`}
                    className="text-primary hover:text-primary-dark inline-flex items-center gap-1 text-xs font-medium"
                  >
                    Detay <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400">Filtreye uyan rezervasyon yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ServiceOption {
  slug: string;
  name: string;
  category: string;
}

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function buildServiceOptions(): ServiceOption[] {
  const balloons: ServiceOption[] = BALLOON_PACKAGES.map((b) => ({
    slug: b.slug, name: b.name, category: "Balon",
  }));
  const acts: ServiceOption[] = ACTIVITIES.map((s) => ({
    slug: s.slug, name: s.name, category: "Aktivite",
  }));
  const tours: ServiceOption[] = TOURS.map((s) => ({
    slug: s.slug, name: s.name, category: "Tur",
  }));
  const hotels: ServiceOption[] = HOTELS.map((s) => ({
    slug: s.slug, name: s.name, category: "Otel",
  }));
  const packs: ServiceOption[] = PACKAGES.map((s) => ({
    slug: s.slug, name: s.name, category: "Paket",
  }));
  const transfers: ServiceOption[] = TRANSFERS.map((s) => ({
    slug: s.slug, name: s.name, category: "Transfer",
  }));
  return [...balloons, ...acts, ...tours, ...hotels, ...packs, ...transfers];
}

function toIso(year: number, monthIdx: number, day: number): string {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function CalendarTab() {
  const services = useMemo(buildServiceOptions, []);
  const [slug, setSlug] = useState<string>(services[0]?.slug ?? "");
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [monthIdx, setMonthIdx] = useState<number>(today.getMonth());
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AvailabilityStatus>("available");
  const [editRemaining, setEditRemaining] = useState<number>(0);
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function authToken(): string {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(ADMIN_AUTH_KEY) ?? "";
  }

  const fromIso = toIso(year, monthIdx, 1);
  const lastDayOfMonth = new Date(year, monthIdx + 1, 0).getDate();
  const toIsoEnd = toIso(year, monthIdx, lastDayOfMonth);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setEditingDate(null);
    const token = authToken();
    fetch(`/api/availability?slug=${encodeURIComponent(slug)}&from=${fromIso}&to=${toIsoEnd}`, {
      headers: token ? { "x-admin-token": token } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.days) setDays(data.days as DayAvailability[]);
        else setDays([]);
      })
      .catch(() => setDays([]))
      .finally(() => setLoading(false));
  }, [slug, fromIso, toIsoEnd]);

  function openEdit(day: DayAvailability) {
    setEditingDate(day.date);
    setEditStatus(day.status);
    setEditRemaining(day.remainingSlots);
    setEditTotal(day.totalSlots);
    setEditNote(day.note ?? "");
    setSaveError(null);
  }

  async function saveEdit() {
    if (!editingDate) return;
    setSaving(true);
    setSaveError(null);
    const token = authToken();
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify({
          slug,
          date: editingDate,
          status: editStatus,
          remainingSlots: editRemaining,
          totalSlots: editTotal,
          note: editNote || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Kaydedilemedi (${res.status})`);
      }
      const data = await res.json();
      const updated = data.day as DayAvailability;
      setDays((prev) => prev.map((d) => (d.date === updated.date ? updated : d)));
      setEditingDate(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setSaving(false);
    }
  }

  function dayCellStyle(d: DayAvailability) {
    const dateObj = new Date(`${d.date}T00:00:00Z`);
    const isPast = dateObj < new Date(new Date().toISOString().slice(0, 10));
    if (isPast) return "bg-slate-100 text-slate-400";
    if (d.status === "full") return "bg-rose-50 border-rose-300 text-rose-900";
    if (d.status === "limited") return "bg-amber-50 border-amber-300 text-amber-900";
    return "bg-emerald-50 border-emerald-300 text-emerald-900";
  }

  function changeMonth(delta: number) {
    let m = monthIdx + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonthIdx(m);
    setYear(y);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Hizmet:</label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[280px]"
        >
          {(() => {
            const groups: Record<string, ServiceOption[]> = {};
            services.forEach((s) => {
              groups[s.category] = groups[s.category] ?? [];
              groups[s.category].push(s);
            });
            return Object.entries(groups).map(([cat, items]) => (
              <optgroup key={cat} label={cat}>
                {items.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </optgroup>
            ));
          })()}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">‹</button>
          <span className="text-sm font-semibold text-slate-900 min-w-[140px] text-center">
            {TR_MONTHS[monthIdx]} {year}
          </span>
          <button onClick={() => changeMonth(1)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">›</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Doluluk Takvimi</h2>
          {loading && <span className="text-xs text-slate-500">Yükleniyor...</span>}
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 mb-2">
          {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {(() => {
            const firstDay = new Date(year, monthIdx, 1).getDay(); // 0=Pa..6=Ct
            // Pazartesi=0 olacak sekilde shift: (firstDay+6)%7
            const shift = (firstDay + 6) % 7;
            const blanks = Array.from({ length: shift }, (_, i) => (
              <div key={`b${i}`} className="h-20" />
            ));
            const cells = days.map((d) => {
              const dayNum = Number(d.date.slice(8, 10));
              return (
                <button
                  key={d.date}
                  onClick={() => openEdit(d)}
                  className={cn(
                    "h-20 border-2 rounded-lg p-2 text-left hover:shadow transition-all",
                    dayCellStyle(d)
                  )}
                  title={`${d.date} — ${d.status}, ${d.remainingSlots}/${d.totalSlots}`}
                >
                  <p className="font-bold text-sm">{dayNum}</p>
                  <p className="text-[10px] uppercase font-semibold mt-0.5">
                    {d.status === "full" ? "Dolu" : d.status === "limited" ? "Az" : "Müsait"}
                  </p>
                  <p className="text-[10px] mt-0.5">{d.remainingSlots}/{d.totalSlots}</p>
                </button>
              );
            });
            return [...blanks, ...cells];
          })()}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <Legend color="bg-emerald-500" label="Müsait" />
          <Legend color="bg-amber-500" label="Az koltuk (≤3)" />
          <Legend color="bg-rose-500" label="Dolu" />
          <Legend color="bg-slate-300" label="Geçmiş" />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Bir güne tıklayarak status, koltuk sayısı ve not düzenleyebilirsiniz.
          Değişiklikler anında booking sayfasına yansır (POST /api/availability).
        </p>
      </div>

      {editingDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditingDate(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-1">{editingDate} — Doluluk Düzenle</h3>
            <p className="text-xs text-slate-500 mb-4">
              {services.find((s) => s.slug === slug)?.name ?? slug}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Durum</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AvailabilityStatus)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="available">Müsait</option>
                  <option value="limited">Az koltuk</option>
                  <option value="full">Dolu</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kalan Koltuk</label>
                  <input
                    type="number"
                    min={0}
                    value={editRemaining}
                    onChange={(e) => setEditRemaining(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Toplam Kapasite</label>
                  <input
                    type="number"
                    min={0}
                    value={editTotal}
                    onChange={(e) => setEditTotal(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Not (opsiyonel)</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={2}
                  placeholder="Örn: Hava durumu nedeniyle iptal riski"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600">
                <strong>İpucu:</strong> Status'u boş bırakırsanız kalan/toplam slot'tan otomatik hesaplanır
                (0=dolu, ≤3=limited, üstü=müsait).
              </div>

              {saveError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-2 rounded">
                  {saveError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditingDate(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">
                İptal
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded", color)} />
      <span>{label}</span>
    </div>
  );
}

function OperatorsTab() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Yeni Operatör
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Ad</th>
              <th className="p-3">Lisans No</th>
              <th className="p-3 text-right">Kapasite</th>
              <th className="p-3 text-right">Komisyon %</th>
              <th className="p-3 text-right">Durum</th>
            </tr>
          </thead>
          <tbody>
            {OPERATORS.map((o, i) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{o.name}</td>
                <td className="p-3 font-mono text-xs">{o.licenseNo}</td>
                <td className="p-3 text-right">{12 + (i % 8)}</td>
                <td className="p-3 text-right">15%</td>
                <td className="p-3 text-right">
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">Aktif</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Yeni Operatör Ekle</h3>
            <div className="space-y-3 text-sm">
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Operatör adı" />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Lisans no (örn: A-2500)" />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Kapasite" type="number" />
              <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Komisyon %" type="number" defaultValue="15" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">İptal</button>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold">Ekle (Demo)</button>
            </div>
            <p className="text-xs text-slate-400 mt-3">Faz 2: Supabase persist + lisans dogrulama.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Stubs — CouponsTab + CustomersTab task #24 alaninda zenginlestirilecek.
// Build YESIL kalmasi icin placeholder.
function CouponsTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center text-slate-500">
      <TagIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="font-semibold">Kupon yönetimi (Faz 2)</p>
      <p className="text-xs mt-1">Bu sekme diger sprint'te eklenecek.</p>
    </div>
  );
}

function CustomersTab() {
  const stats = useMemo(() => getCustomerStats(), []);
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} title="Toplam Musteri" value={String(stats.total)} tone="primary" />
        <StatCard icon={TrendingUp} title="Toplam Gelir" value={formatPrice(stats.totalRevenue, "EUR")} tone="emerald" />
        <StatCard icon={CalendarDays} title="VIP" value={String(stats.vip)} tone="amber" />
        <StatCard icon={UsersIcon} title="Yeni" value={String(stats.new)} tone="slate" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Ad</th>
              <th className="p-3">E-posta</th>
              <th className="p-3">Uyruk</th>
              <th className="p-3 text-right">Rezervasyon</th>
              <th className="p-3 text-right">Harcama</th>
              <th className="p-3 text-right">Segment</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CUSTOMERS.slice(0, 20).map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium">{c.fullName}</td>
                <td className="p-3 text-xs text-slate-500">{c.email}</td>
                <td className="p-3 text-slate-600">{getNationalityLabel(c.nationality)}</td>
                <td className="p-3 text-right">{c.totalBookings}</td>
                <td className="p-3 text-right">{formatPrice(c.totalSpent, "EUR")}</td>
                <td className="p-3 text-right">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs capitalize">{c.segment}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeoAgentTab() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [articleCount, setArticleCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/seo-agent")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.count !== undefined) setArticleCount(data.count);
      })
      .catch(() => setArticleCount(0));
  }, []);

  async function runAgent() {
    setRunning(true);
    setOutput("Agent calistiriliyor...");
    try {
      const res = await fetch("/api/seo-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manual", secret: "tripandtick-seo-agent-secret" }),
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Bot} title="Toplam Makale" value={articleCount !== null ? String(articleCount) : "—"} tone="primary" />
        <StatCard icon={TrendingUp} title="Bu Ay" value="—" tone="emerald" />
        <StatCard icon={CalendarDays} title="Son Çalışma" value="—" tone="slate" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-2">SEO Agent</h2>
        <p className="text-sm text-slate-500 mb-4">
          Anthropic Claude ile Kapadokya odaklı SEO makaleleri otomatik üretilir.
          Manuel calistir veya gunluk cron'la otomatik islet.
        </p>
        <button
          onClick={runAgent}
          disabled={running}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          <RefreshCcw className={cn("w-4 h-4", running && "animate-spin")} />
          {running ? "Calisiyor..." : "SEO Agent Çalıştır"}
        </button>

        {output && (
          <pre className="mt-4 bg-slate-900 text-emerald-300 text-xs p-4 rounded-lg overflow-x-auto max-h-60">
            {output}
          </pre>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Son Üretilen Makaleler</h3>
        <p className="text-sm text-slate-500">
          {articleCount === null ? "Yukleniyor..." : articleCount === 0 ? "Henuz makale yok. Agent calistirin." : `${articleCount} makale uretildi.`}
        </p>
      </div>
    </div>
  );
}
