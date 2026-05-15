"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { OPERATORS } from "@/data/services/operators";
import { formatPrice, cn } from "@/lib/utils";

type Tab = "dashboard" | "fiyatlar" | "rezervasyonlar" | "takvim" | "operatorler" | "seo";
type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type BookingFilter = "all" | BookingStatus;

interface MockBooking {
  id: string;
  customerName: string;
  email: string;
  service: string;
  date: string;
  pax: number;
  total: number;
  status: BookingStatus;
}

function mockBookings(): MockBooking[] {
  const names = ["Ayse Demir", "Mehmet Kara", "Lisa Schneider", "John Smith", "Maria Garcia", "Wei Chen", "Ahmed Hassan", "Sophie Martin", "Anna Schmidt", "Carlos Mendez"];
  const services = ["Standart Balon Uçuşu", "Konfor Balon Uçuşu", "Deluxe Balon Uçuşu", "Romantik Özel Balon", "ATV Tur", "Kırmızı Tur"];
  const statuses: BookingStatus[] = ["confirmed", "confirmed", "confirmed", "pending", "completed", "cancelled"];
  return Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i % 20) - 5);
    return {
      id: `TT-${(1000 + i).toString().padStart(4, "0")}`,
      customerName: names[i % names.length],
      email: names[i % names.length].toLowerCase().replace(" ", ".") + "@example.com",
      service: services[i % services.length],
      date: d.toISOString().slice(0, 10),
      pax: ((i % 4) + 1) * 2,
      total: 165 * (((i % 4) + 1) * 2) + (i % 3) * 50,
      status: statuses[i % statuses.length],
    };
  });
}

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
        {tab === "seo" && "SEO Agent"}
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        {tab === "dashboard" && "Gunluk ozet, son rezervasyonlar ve doluluk."}
        {tab === "fiyatlar" && "Balon paket fiyatlarini guncelleyin."}
        {tab === "rezervasyonlar" && "Tum rezervasyonlari filtrele ve yonet."}
        {tab === "takvim" && "Aylik takvim, gunluk doluluk durumu."}
        {tab === "operatorler" && "Operatorler ve komisyon yonetimi."}
        {tab === "seo" && "SEO agent makale uretim panosu."}
      </p>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "fiyatlar" && <PricesTab />}
      {tab === "rezervasyonlar" && <BookingsTab />}
      {tab === "takvim" && <CalendarTab />}
      {tab === "operatorler" && <OperatorsTab />}
      {tab === "seo" && <SeoAgentTab />}
    </div>
  );
}

function DashboardTab() {
  const bookings = useMemo(() => mockBookings(), []);
  const recentBookings = bookings.slice(0, 10);
  const todayRevenue = bookings.filter((b) => b.date === new Date().toISOString().slice(0, 10)).reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} title="Bugün Rezervasyon" value="12" delta="+24%" tone="emerald" />
        <StatCard icon={TrendingUp} title="Aylık Gelir" value={formatPrice(48750, "EUR")} delta="+18%" tone="amber" />
        <StatCard icon={UsersIcon} title="Doluluk Oranı" value="78%" delta="+5%" tone="primary" />
        <StatCard icon={CalendarDays} title="Bugün Toplam" value={formatPrice(todayRevenue, "EUR")} delta="" tone="slate" />
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
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 font-mono text-xs">{b.id}</td>
                    <td className="py-2">{b.customerName}</td>
                    <td className="py-2 text-slate-600">{b.service}</td>
                    <td className="py-2 text-slate-600">{b.date}</td>
                    <td className="py-2 text-right font-medium">{formatPrice(b.total, "EUR")}</td>
                    <td className="py-2 text-right"><StatusBadge status={b.status} /></td>
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
  const all = useMemo(() => mockBookings(), []);
  const [statusFilter, setStatusFilter] = useState<BookingFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = all.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search && !b.customerName.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
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
            placeholder="Ad veya kod ara..."
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingFilter)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="all">Tüm Durumlar</option>
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">{b.id}</td>
                <td className="p-3">
                  <p>{b.customerName}</p>
                  <p className="text-xs text-slate-400">{b.email}</p>
                </td>
                <td className="p-3 text-slate-600">{b.service}</td>
                <td className="p-3 text-slate-600">{b.date}</td>
                <td className="p-3 text-right">{b.pax}</td>
                <td className="p-3 text-right font-medium">{formatPrice(b.total, "EUR")}</td>
                <td className="p-3 text-right"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-400">Filtreye uyan rezervasyon yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarTab() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const occupancy = (d: number): { pct: number; color: string; status: string } => {
    const seed = (d * 7 + 13) % 100;
    if (seed > 85) return { pct: seed, color: "bg-rose-500", status: "Dolu" };
    if (seed > 60) return { pct: seed, color: "bg-amber-500", status: "Doluyor" };
    if (seed > 20) return { pct: seed, color: "bg-emerald-500", status: "Müsait" };
    return { pct: seed, color: "bg-slate-300", status: "Az" };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="font-bold text-slate-900 mb-4">Mart 2026 — Doluluk Takvimi</h2>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 mb-2">
        {["Pt", "Sa", "Ca", "Pe", "Cu", "Ct", "Pa"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const o = occupancy(d);
          return (
            <div key={d} className="border border-slate-200 rounded-lg p-2 hover:shadow transition-shadow cursor-pointer">
              <p className="font-semibold text-sm">{d}</p>
              <div className={cn("h-1.5 rounded-full mt-1", o.color)} style={{ width: `${o.pct}%` }} />
              <p className="text-xs text-slate-500 mt-1">{o.pct}%</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <Legend color="bg-emerald-500" label="Müsait" />
        <Legend color="bg-amber-500" label="Doluyor" />
        <Legend color="bg-rose-500" label="Dolu" />
        <Legend color="bg-slate-300" label="Az satış" />
      </div>
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
