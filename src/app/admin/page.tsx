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
  Mail,
  Send,
  Power,
  PowerOff,
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
import {
  MOCK_LOYALTY_TX,
  LOYALTY_CONFIG,
  getCustomerBalance,
  getLoyaltyStats,
  getTier,
} from "@/data/loyalty";
import { generateReferralCode, getReferralStats } from "@/lib/referral";
import { CAMPAIGNS, type EmailCampaign } from "@/data/email-campaigns";

const ADMIN_AUTH_KEY = "tripandtick:admin:auth";

type Tab =
  | "dashboard"
  | "fiyatlar"
  | "rezervasyonlar"
  | "takvim"
  | "operatorler"
  | "kuponlar"
  | "musteriler"
  | "sadakat"
  | "eposta"
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
        {tab === "sadakat" && "Sadakat"}
        {tab === "eposta" && "E-posta Kampanyalari"}
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
        {tab === "sadakat" && "Puan dagilimi, tier istatistigi, referans performansi."}
        {tab === "eposta" && "Brevo kampanyalari, abone sayisi, test gonderim."}
        {tab === "seo" && "SEO agent makale uretim panosu."}
      </p>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "fiyatlar" && <PricesTab />}
      {tab === "rezervasyonlar" && <BookingsTab />}
      {tab === "takvim" && <CalendarTab />}
      {tab === "operatorler" && <OperatorsTab />}
      {tab === "kuponlar" && <CouponsTab />}
      {tab === "musteriler" && <CustomersTab />}
      {tab === "sadakat" && <LoyaltyTab />}
      {tab === "eposta" && <EmailCampaignsTab />}
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
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
        <p className="font-semibold text-amber-900 mb-1">Günlük dinamik fiyat + iptal/rotar</p>
        <p className="text-amber-800 text-xs mb-2">
          Tarihe özel fiyat override, hava iptal ve rotar yönetimi için yeni paneli kullanın.
        </p>
        <Link href="/admin/fiyat" className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
          Fiyat & İptal Paneline Git →
        </Link>
      </div>
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

// ─────────────────────────────────────────────────────────────
// Kuponlar tab
// ─────────────────────────────────────────────────────────────

interface CouponFormState {
  code: string;
  type: CouponType;
  value: string;
  validFrom: string;
  validUntil: string;
  usageLimit: string;
  minPurchase: string;
  applicableSlugs: string;
  active: boolean;
  description: string;
}

function emptyCouponForm(): CouponFormState {
  const now = new Date();
  const inAYear = new Date(now.getTime() + 365 * 86400000);
  return {
    code: "",
    type: "percent",
    value: "10",
    validFrom: now.toISOString().slice(0, 10),
    validUntil: inAYear.toISOString().slice(0, 10),
    usageLimit: "100",
    minPurchase: "",
    applicableSlugs: "",
    active: true,
    description: "",
  };
}

function couponAuthToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_AUTH_KEY) ?? "";
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CouponFormState>(emptyCouponForm());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        headers: { "x-admin-token": couponAuthToken() },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Yüklenemedi (${res.status})`);
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveCoupon() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        validFrom: new Date(form.validFrom + "T00:00:00.000Z").toISOString(),
        validUntil: new Date(form.validUntil + "T23:59:59.000Z").toISOString(),
        usageLimit: Number(form.usageLimit),
        usedCount: 0,
        minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
        applicableSlugs: form.applicableSlugs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        active: form.active,
        description: form.description || undefined,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": couponAuthToken(),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Kaydedilemedi (${res.status})`);
      }
      setModalOpen(false);
      setForm(emptyCouponForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setSaving(false);
    }
  }

  async function removeCoupon(code: string) {
    if (!confirm(`${code} kuponunu silmek istiyor musunuz?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: { "x-admin-token": couponAuthToken() },
      });
      if (!res.ok) throw new Error(`Silinemedi (${res.status})`);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <TagIcon className="w-4 h-4" />
          <span>{loading ? "Yükleniyor..." : `${coupons.length} kupon`}</span>
        </div>
        <button
          onClick={() => {
            setForm(emptyCouponForm());
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Yeni Kupon
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-sm p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Kod</th>
              <th className="p-3">Tip</th>
              <th className="p-3 text-right">Değer</th>
              <th className="p-3 text-right">Kullanım</th>
              <th className="p-3">Son Tarih</th>
              <th className="p-3">Hizmet</th>
              <th className="p-3 text-right">Durum</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const status = getCouponStatus(c);
              const statusMap: Record<typeof status, { color: string; label: string }> = {
                active: { color: "bg-emerald-100 text-emerald-700", label: "Aktif" },
                expired: { color: "bg-slate-200 text-slate-600", label: "Süresi Doldu" },
                exhausted: { color: "bg-rose-100 text-rose-700", label: "Limit Doldu" },
                inactive: { color: "bg-slate-100 text-slate-500", label: "Pasif" },
              };
              const s = statusMap[status];
              return (
                <tr key={c.code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{c.code}</td>
                  <td className="p-3 text-slate-600">
                    {c.type === "percent" ? "Yüzde" : "Sabit"}
                  </td>
                  <td className="p-3 text-right font-medium">
                    {c.type === "percent" ? `%${c.value}` : formatPrice(c.value, "EUR")}
                  </td>
                  <td className="p-3 text-right text-slate-600">
                    {c.usedCount} / {c.usageLimit}
                  </td>
                  <td className="p-3 text-slate-600">
                    {new Date(c.validUntil).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {c.applicableSlugs && c.applicableSlugs.length > 0
                      ? `${c.applicableSlugs.length} hizmet`
                      : "Tümü"}
                    {c.minPurchase ? ` · min €${c.minPurchase}` : ""}
                  </td>
                  <td className="p-3 text-right">
                    <span className={cn("inline-block px-2 py-0.5 rounded text-xs", s.color)}>
                      {s.label}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeCoupon(c.code)}
                      className="text-rose-500 hover:text-rose-700"
                      aria-label={`${c.code} sil`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  Henüz kupon yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-bold text-lg mb-4">Yeni Kupon Ekle</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kod</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME10"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tip</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="percent">Yüzde (%)</option>
                    <option value="fixed">Sabit (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Değer</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Başlangıç</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bitiş</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kullanım Limiti</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Min. Sepet (€)</label>
                  <input
                    type="number"
                    value={form.minPurchase}
                    onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                    placeholder="0"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hizmet Slug&apos;ları (virgülle, boş = tümü)
                </label>
                <input
                  value={form.applicableSlugs}
                  onChange={(e) => setForm({ ...form, applicableSlugs: e.target.value })}
                  placeholder="aile-paketi, macera-paketi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Aktif</span>
              </label>

              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-2 rounded">
                  {error}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                İptal
              </button>
              <button
                onClick={saveCoupon}
                disabled={saving || !form.code.trim()}
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

// ─────────────────────────────────────────────────────────────
// Musteriler tab
// ─────────────────────────────────────────────────────────────

function CustomersTab() {
  const stats = useMemo(() => getCustomerStats(), []);
  const [segmentFilter, setSegmentFilter] = useState<"all" | CustomerSegment>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const countries = useMemo(() => {
    const set = new Set<string>();
    MOCK_CUSTOMERS.forEach((c) => set.add(c.nationality));
    return Array.from(set).sort();
  }, []);

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    if (segmentFilter !== "all" && c.segment !== segmentFilter) return false;
    if (countryFilter !== "all" && c.nationality !== countryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit =
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  const segmentLabel: Record<CustomerSegment, { color: string; label: string }> = {
    new: { color: "bg-blue-100 text-blue-700", label: "Yeni" },
    returning: { color: "bg-emerald-100 text-emerald-700", label: "Tekrar" },
    vip: { color: "bg-amber-100 text-amber-700", label: "VIP" },
    cancelled: { color: "bg-rose-100 text-rose-700", label: "İptal" },
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} title="Toplam Müşteri" value={String(stats.total)} tone="primary" />
        <StatCard icon={TrendingUp} title="VIP" value={String(stats.vip)} delta={`${stats.returning} tekrar`} tone="amber" />
        <StatCard icon={UsersIcon} title="Yeni" value={String(stats.new)} delta={`${stats.cancelled} iptal`} tone="emerald" />
        <StatCard
          icon={TrendingUp}
          title="Toplam Gelir"
          value={formatPrice(stats.totalRevenue, "EUR")}
          tone="slate"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta veya ID ara..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value as "all" | CustomerSegment)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="all">Tüm Segmentler</option>
          <option value="new">Yeni</option>
          <option value="returning">Tekrar</option>
          <option value="vip">VIP</option>
          <option value="cancelled">İptal</option>
        </select>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="all">Tüm Ülkeler</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {getNationalityLabel(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Uyruk</th>
              <th className="p-3">Segment</th>
              <th className="p-3 text-right">Rezervasyon</th>
              <th className="p-3 text-right">Harcama</th>
              <th className="p-3">Son Aktivite</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <p className="font-medium">{c.fullName}</p>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </td>
                <td className="p-3 text-slate-600">{getNationalityLabel(c.nationality)}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs font-medium",
                      segmentLabel[c.segment].color
                    )}
                  >
                    {segmentLabel[c.segment].label}
                  </span>
                </td>
                <td className="p-3 text-right">{c.totalBookings}</td>
                <td className="p-3 text-right font-medium">
                  {formatPrice(c.totalSpent, "EUR")}
                </td>
                <td className="p-3 text-xs text-slate-500">
                  {new Date(c.lastActivity).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Filtreye uyan müşteri yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sadakat tab — puan ozeti + per-customer tablo + admin override
// ─────────────────────────────────────────────────────────────

function LoyaltyTab() {
  const stats = useMemo(() => getLoyaltyStats(), []);
  const [search, setSearch] = useState("");
  const [overrideOpen, setOverrideOpen] = useState<string | null>(null);
  const [overrideAmount, setOverrideAmount] = useState<number>(100);
  const [overrideNote, setOverrideNote] = useState<string>("Admin bonus");
  const [overrideMsg, setOverrideMsg] = useState<string>("");

  const rows = useMemo(() => {
    const seen = new Set<string>();
    MOCK_LOYALTY_TX.forEach((tx) => seen.add(tx.customerId));
    return Array.from(seen)
      .map((id) => {
        const cust = MOCK_CUSTOMERS.find((c) => c.id === id);
        const balance = getCustomerBalance(id);
        const tier = getTier(balance);
        const referral = getReferralStats(id);
        return { id, cust, balance, tier, referral };
      })
      .filter((r) => r.cust)
      .filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          r.cust!.fullName.toLowerCase().includes(q) ||
          r.cust!.email.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.balance - a.balance);
  }, [search]);

  function applyOverride(customerId: string) {
    // Mock: in-memory MOCK_LOYALTY_TX'e ekleme. Faz 2: Supabase write.
    MOCK_LOYALTY_TX.unshift({
      id: `LTX-ADM-${Date.now()}`,
      customerId,
      points: overrideAmount,
      type: "bonus",
      description: overrideNote || "Admin override",
      createdAt: new Date().toISOString(),
    });
    setOverrideMsg(
      `${customerId} icin ${overrideAmount > 0 ? "+" : ""}${overrideAmount} puan eklendi (mock).`
    );
    setTimeout(() => setOverrideMsg(""), 3000);
    setOverrideOpen(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Bot}
          title="Aktif Musteri"
          value={String(stats.customers)}
          delta={`ort ${stats.averageBalance} puan`}
          tone="primary"
        />
        <StatCard
          icon={TrendingUp}
          title="Toplam Dagitilan"
          value={String(stats.totalEarned)}
          delta="puan"
          tone="emerald"
        />
        <StatCard
          icon={CalendarDays}
          title="Toplam Harcanan"
          value={String(stats.totalRedeemed)}
          delta="puan"
          tone="amber"
        />
        <StatCard
          icon={UsersIcon}
          title="Referans Bonusu"
          value={String(stats.totalReferralBonus)}
          delta="puan"
          tone="slate"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 grid sm:grid-cols-4 gap-3">
        <div>
          <p className="text-xs uppercase text-amber-700">Kazanim Orani</p>
          <p className="font-semibold">€1 = {LOYALTY_CONFIG.earnRate} puan</p>
        </div>
        <div>
          <p className="text-xs uppercase text-amber-700">Kullanim Orani</p>
          <p className="font-semibold">{LOYALTY_CONFIG.redemptionRate} puan = €1</p>
        </div>
        <div>
          <p className="text-xs uppercase text-amber-700">Referans Bonusu</p>
          <p className="font-semibold">+{LOYALTY_CONFIG.referralBonus} puan</p>
        </div>
        <div>
          <p className="text-xs uppercase text-amber-700">Tier Sayisi</p>
          <p className="font-semibold">{LOYALTY_CONFIG.tiers.length} (Standard → Platinum)</p>
        </div>
      </div>

      {overrideMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm">
          {overrideMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta veya ID ara..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Musteri</th>
              <th className="p-3">Referans Kodu</th>
              <th className="p-3 text-right">Bakiye</th>
              <th className="p-3 text-right">Tier</th>
              <th className="p-3 text-right">Davet/Onayli</th>
              <th className="p-3 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <p className="font-medium">{r.cust!.fullName}</p>
                  <p className="text-xs text-slate-400">{r.cust!.email}</p>
                </td>
                <td className="p-3 font-mono text-xs">{generateReferralCode(r.cust!.email)}</td>
                <td className="p-3 text-right">
                  <span className="font-bold text-amber-700">{r.balance}</span>
                  <span className="text-xs text-slate-400 ml-1">puan</span>
                </td>
                <td className="p-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-violet-100 text-violet-700">
                    {r.tier.name}
                  </span>
                </td>
                <td className="p-3 text-right text-slate-600">
                  {r.referral.invited} / <span className="text-emerald-600 font-medium">{r.referral.confirmed}</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setOverrideOpen(r.id);
                      setOverrideAmount(100);
                      setOverrideNote("Admin bonus");
                    }}
                    className="text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Puan Ekle
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Henuz puan kaydi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {overrideOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setOverrideOpen(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-3">Puan Override — {overrideOpen}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Miktar (negatif degerle dusurun)
                </label>
                <input
                  type="number"
                  value={overrideAmount}
                  onChange={(e) => setOverrideAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Aciklama</label>
                <input
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-2 text-xs rounded">
                Bu islem mock-data tarafinda log'lanir. Faz 2'de Supabase audit trail.
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setOverrideOpen(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                Iptal
              </button>
              <button
                onClick={() => applyOverride(overrideOpen)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// E-posta Kampanyalari tab (Brevo)
// ─────────────────────────────────────────────────────────────

const CAMPAIGN_TRIGGER_LABEL: Record<EmailCampaign["trigger"], string> = {
  newsletter_signup: "Newsletter Kayit",
  abandoned_cart: "Sepet Terki",
  post_flight: "Ucus Sonrasi",
  birthday: "Dogum Gunu",
  seasonal: "Sezon Kampanya",
};

function EmailCampaignsTab() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(() => CAMPAIGNS);
  const [testEmail, setTestEmail] = useState("admin@tripandtick.com");
  const [testCampaign, setTestCampaign] = useState<string>(CAMPAIGNS[0]?.id ?? "");
  const [testStatus, setTestStatus] = useState<string>("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    sent: number;
    opened: number;
    clicked: number;
    openRate: string;
    clickRate: string;
  } | null>(null);

  useEffect(() => {
    // Mock — Brevo Contacts API GET counts (Faz 2: real call).
    setSubscriberCount(1247);
    setStats({
      sent: 4892,
      opened: 2104,
      clicked: 612,
      openRate: "43.0%",
      clickRate: "12.5%",
    });
  }, []);

  function toggleActive(id: string) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }

  async function sendTest() {
    if (!testEmail.includes("@")) {
      setTestStatus("Gecerli e-posta girin.");
      return;
    }
    setTestStatus("Gonderim hazirlaniyor...");
    // Faz 2: real Brevo test send via /api/admin/email-test.
    setTimeout(() => {
      setTestStatus(
        `Mock: ${testCampaign} sablonu ${testEmail} adresine gonderildi (Faz 2'de gercek API'a baglanacak).`
      );
    }, 800);
  }

  const activeCount = campaigns.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard
          icon={Mail}
          title="Aboneler"
          value={subscriberCount !== null ? subscriberCount.toLocaleString("tr-TR") : "—"}
          delta="Brevo listesi"
          tone="primary"
        />
        <StatCard
          icon={Send}
          title="Bu Ay Gonderim"
          value={stats ? stats.sent.toLocaleString("tr-TR") : "—"}
          delta={stats ? `Acilim %${stats.openRate}` : ""}
          tone="emerald"
        />
        <StatCard
          icon={TrendingUp}
          title="Tiklama Orani"
          value={stats?.clickRate ?? "—"}
          delta={stats ? `${stats.clicked} tiklama` : ""}
          tone="amber"
        />
        <StatCard
          icon={Power}
          title="Aktif Kampanya"
          value={`${activeCount} / ${campaigns.length}`}
          tone="slate"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">Kampanyalar</h2>
          <span className="text-xs text-slate-500">
            Brevo otomasyon — toggle ile aktif/pasif.
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                    {CAMPAIGN_TRIGGER_LABEL[c.trigger]}
                  </span>
                  {c.delay_hours !== undefined && c.delay_hours > 0 && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                      +{c.delay_hours}h
                    </span>
                  )}
                  {c.audience_segment && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide">
                      {c.audience_segment}
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => toggleActive(c.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  c.active
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {c.active ? (
                  <>
                    <Power className="w-3.5 h-3.5" />
                    Aktif
                  </>
                ) : (
                  <>
                    <PowerOff className="w-3.5 h-3.5" />
                    Pasif
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-3">Test Gonderim</h2>
        <p className="text-sm text-slate-500 mb-4">
          Secili sablonu kendinize gondererek tasarimi inceleyin (mock — Faz 2&apos;de
          gercek Brevo API).
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={testCampaign}
            onChange={(e) => setTestCampaign(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@tripandtick.com"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={sendTest}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
            Test Gonder
          </button>
        </div>
        {testStatus && (
          <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            {testStatus}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Brevo Entegrasyon Notlari</h3>
        <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <li>• Newsletter abone API: <code className="bg-slate-100 px-1.5 py-0.5 rounded">POST /api/newsletter</code> (canli)</li>
          <li>• Welcome mail Brevo template ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded">BREVO_WELCOME_TEMPLATE_ID</code> env</li>
          <li>• List ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded">BREVO_LIST_ID</code> env (varsayilan 2)</li>
          <li>• Sepet terki, dogum gunu, sezon kampanyalari Faz 2&apos;de Brevo Automation Workflow ile tetiklenecek.</li>
        </ul>
      </div>
    </div>
  );
}
