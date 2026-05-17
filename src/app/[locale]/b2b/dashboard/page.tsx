"use client";

// B2B acente dashboard — 4 tab + stat cards + auth gate.
//
// Importers: Next.js auto-route /b2b/dashboard. /b2b/login redirect target.
// Affected: B2B acente self-service portal.
// Data: agencies.ts MOCK_AGENCIES, mock-bookings.ts MOCK_BOOKINGS,
//        catalog.ts ACTIVITIES+TOURS+HOTELS+PACKAGES+TRANSFERS, founder.ts COMPANY.
//        Acente-bazli rezervasyon: ilk 6 mock booking deterministik atanir
//        (real DB Faz 2'de).
// User verbatim: "Acente dashboard: auth check, stat cards (Toplam rezervasyon,
// Aylik komisyon, Kalan kredi, Aktif kupon); 4 tab: Rezervasyonlar, Yeni
// Rezervasyon, Fiyat Listesi, API & Entegrasyon."

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  Building2,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Tag,
  Code2,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Ticket,
  Calendar,
  Wallet,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { agencyNetPrice, type Agency } from "@/data/agencies";
import { MOCK_BOOKINGS, type MockBooking } from "@/data/mock-bookings";
import {
  ACTIVITIES,
  TOURS,
  HOTELS,
  PACKAGES,
  TRANSFERS,
  type ServiceItem,
} from "@/data/services/catalog";
import { COMPANY } from "@/data/founder";

type Tab = "bookings" | "new" | "pricing" | "api";

const TABS: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "bookings", label: "Rezervasyonlar", icon: ClipboardList },
  { key: "new", label: "Yeni Rezervasyon", icon: PlusCircle },
  { key: "pricing", label: "Fiyat Listesi", icon: Tag },
  { key: "api", label: "API & Entegrasyon", icon: Code2 },
];

// Deterministik acente-rezervasyon eslemesi (mock):
// her acente id hash'i % MOCK_BOOKINGS.length ile baslayip 6 rezervasyon alir.
function bookingsForAgency(agency: Agency): MockBooking[] {
  const hash = agency.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const start = hash % MOCK_BOOKINGS.length;
  const slice: MockBooking[] = [];
  for (let i = 0; i < 6 && i < MOCK_BOOKINGS.length; i++) {
    slice.push(MOCK_BOOKINGS[(start + i) % MOCK_BOOKINGS.length]);
  }
  return slice;
}

const ALL_SERVICES: ServiceItem[] = [
  ...ACTIVITIES,
  ...TOURS,
  ...HOTELS,
  ...PACKAGES,
  ...TRANSFERS,
];

export default function B2BDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/b2b/auth/me", { credentials: "include" });
        if (!res.ok) {
          router.replace("/b2b/login");
          return;
        }
        const data = await res.json();
        if (!data?.ok || !data?.agency) {
          router.replace("/b2b/login");
          return;
        }
        if (cancelled) return;
        setAgency(data.agency as Agency);
        setAuthChecked(true);
      } catch {
        router.replace("/b2b/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/b2b/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // cookie zaten temizlenecek; redirect garantili
    }
    router.replace("/b2b/login");
  }

  if (!authChecked || !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Yetki kontrol ediliyor...</p>
      </div>
    );
  }

  const bookings = bookingsForAgency(agency);
  const totalBookings = bookings.length;
  const monthlyCommission = Math.round(
    bookings.reduce((acc, b) => acc + b.total * agency.commissionRate, 0)
  );
  const creditRemaining = agency.creditLimit - agency.creditUsed;
  const activeCoupons = 3; // mock — WELCOME10, B2B-SPRING, EMERCE5

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-slate-900 text-white">
        <div className="container-main py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold">
                <span className="text-accent">Trip</span> and{" "}
                <span className="text-accent">Tick</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Building2 className="w-3.5 h-3.5" />
              B2B
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:block text-right">
              <div className="font-semibold text-white">{agency.name}</div>
              <div className="text-slate-400 text-xs">{agency.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:text-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="container-main py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={ClipboardList}
            label="Toplam Rezervasyon"
            value={String(totalBookings)}
            sub="Son 90 gün"
            tone="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Aylık Komisyon"
            value={formatPrice(monthlyCommission, "EUR")}
            sub={`%${Math.round(agency.commissionRate * 100)} oran`}
            tone="success"
          />
          <StatCard
            icon={Wallet}
            label="Kalan Kredi"
            value={formatPrice(creditRemaining, "EUR")}
            sub={`${formatPrice(agency.creditLimit, "EUR")} limit`}
            tone="warning"
          />
          <StatCard
            icon={Ticket}
            label="Aktif Kupon"
            value={String(activeCoupons)}
            sub="WELCOME10 · B2B-SPRING · EMERCE5"
            tone="accent"
          />
        </div>

        {/* Tabs */}
        <nav
          className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto"
          role="tablist"
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              role="tab"
              aria-selected={tab === key}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                tab === key
                  ? "border-accent text-accent"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {tab === "bookings" && <BookingsTab bookings={bookings} agency={agency} />}
        {tab === "new" && <NewBookingTab agency={agency} />}
        {tab === "pricing" && <PricingTab agency={agency} />}
        {tab === "api" && <ApiTab agency={agency} />}
      </main>
    </div>
  );
}

/* ------------------------- STAT CARD ------------------------- */

interface StatCardProps {
  icon: typeof LayoutDashboard;
  label: string;
  value: string;
  sub: string;
  tone: "primary" | "success" | "warning" | "accent";
}

function StatCard({ icon: Icon, label, value, sub, tone }: StatCardProps) {
  const toneClass: Record<StatCardProps["tone"], string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", toneClass[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

/* ------------------------- BOOKINGS TAB ------------------------- */

function BookingsTab({ bookings, agency }: { bookings: MockBooking[]; agency: Agency }) {
  const statusLabel: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Onaylandı", cls: "bg-emerald-100 text-emerald-700" },
    pending: { label: "Bekliyor", cls: "bg-amber-100 text-amber-700" },
    completed: { label: "Tamamlandı", cls: "bg-slate-100 text-slate-700" },
    cancelled: { label: "İptal", cls: "bg-rose-100 text-rose-700" },
  };
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Acente Rezervasyonları</h2>
        <span className="text-xs text-slate-500">
          {bookings.length} kayıt · Komisyon %{Math.round(agency.commissionRate * 100)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Rez. No</th>
              <th className="px-4 py-3 text-left">Hizmet</th>
              <th className="px-4 py-3 text-left">Tarih</th>
              <th className="px-4 py-3 text-right">Kişi</th>
              <th className="px-4 py-3 text-right">Tutar</th>
              <th className="px-4 py-3 text-right">Komisyon</th>
              <th className="px-4 py-3 text-left">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => {
              const commission = Math.round(b.total * agency.commissionRate);
              const s = statusLabel[b.status] ?? { label: b.status, cls: "bg-slate-100 text-slate-700" };
              return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{b.id}</td>
                  <td className="px-4 py-3 text-slate-800">{b.serviceName}</td>
                  <td className="px-4 py-3 text-slate-600">{b.date}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{b.pax}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {formatPrice(b.total, b.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {formatPrice(commission, b.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", s.cls)}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------- NEW BOOKING TAB ------------------------- */

function NewBookingTab({ agency }: { agency: Agency }) {
  const [success, setSuccess] = useState<string | null>(null);
  const [pax, setPax] = useState(2);
  const [serviceSlug, setServiceSlug] = useState(ALL_SERVICES[0]?.slug ?? "");
  const service = ALL_SERVICES.find((s) => s.slug === serviceSlug);
  const netPrice = service ? agencyNetPrice(service.adultPrice, agency.commissionRate) : 0;
  const total = Math.round(netPrice * pax);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ref = `TT-B2B-${Date.now().toString(36).toUpperCase()}`;
    setSuccess(
      `Demo rezervasyon oluşturuldu. Ref: ${ref}. (Production'da /api/b2b/bookings POST tetiklenir.)`
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Yeni Toplu Rezervasyon</h2>
      <p className="text-sm text-slate-500 mb-5">
        Acente net fiyatı %{Math.round(agency.commissionRate * 100)} indirimli gösterilir.
      </p>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm text-emerald-800 flex items-start gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri Ad Soyad</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri E-posta</label>
          <input
            type="email"
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hizmet</label>
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white"
          >
            {ALL_SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
          <input
            type="date"
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kişi Sayısı</label>
          <input
            type="number"
            min={1}
            max={50}
            value={pax}
            onChange={(e) => setPax(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri Telefon</label>
          <input
            type="tel"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="lg:col-span-2 bg-slate-50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Net birim fiyat:{" "}
            <span className="font-semibold text-slate-900">
              {formatPrice(netPrice, "EUR")}
            </span>{" "}
            · Liste:{" "}
            <span className="line-through text-slate-400">
              {formatPrice(service?.adultPrice ?? 0, "EUR")}
            </span>
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            Toplam: {formatPrice(total, "EUR")}
          </div>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            className="w-full sm:w-auto bg-accent hover:bg-accent-light text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Rezervasyon Oluştur
          </button>
        </div>
      </form>
    </section>
  );
}

/* ------------------------- PRICING TAB ------------------------- */

function PricingTab({ agency }: { agency: Agency }) {
  const groups = useMemo(
    () => [
      { name: "Aktiviteler", items: ACTIVITIES },
      { name: "Turlar", items: TOURS },
      { name: "Oteller", items: HOTELS },
      { name: "Paketler", items: PACKAGES },
      { name: "Transferler", items: TRANSFERS },
    ],
    []
  );

  return (
    <section className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Acente net fiyatları aşağıdaki tabloda. Liste fiyatı üzerinden{" "}
          <strong>%{Math.round(agency.commissionRate * 100)}</strong> indirim uygulanır.
          Sezon kampanyalarında ek indirim olabilir.
        </span>
      </div>

      {groups.map((g) => (
        <div key={g.name} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">{g.name}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left">Hizmet</th>
                  <th className="px-4 py-2.5 text-right">Liste</th>
                  <th className="px-4 py-2.5 text-right">Acente Net</th>
                  <th className="px-4 py-2.5 text-right">Tasarruf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {g.items.map((s) => {
                  const net = agencyNetPrice(s.adultPrice, agency.commissionRate);
                  const saving = s.adultPrice - net;
                  return (
                    <tr key={s.slug} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-800">{s.name}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500 line-through">
                        {formatPrice(s.adultPrice, s.currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">
                        {formatPrice(net, s.currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        −{formatPrice(saving, s.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ------------------------- API TAB ------------------------- */

function ApiTab({ agency }: { agency: Agency }) {
  const [revealKey, setRevealKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSaved, setWebhookSaved] = useState(false);

  const apiBase =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/b2b`
      : "https://tripandtick.com/api/b2b";

  function copy(value: string, label: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(label);
        setTimeout(() => setCopied(null), 1500);
      });
    }
  }

  const curlExample = `curl -X POST ${apiBase}/bookings \\
  -H "x-api-key: ${revealKey ? agency.apiKey : "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceSlug": "kirmizi-tur",
    "date": "2026-06-15",
    "pax": 4,
    "customer": {
      "fullName": "Ali Yılmaz",
      "email": "ali@example.com",
      "phone": "+90 555 0001"
    }
  }'`;

  return (
    <section className="space-y-6">
      {/* API Key */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">API Key</h3>
            <p className="text-sm text-slate-500">
              Tüm B2B endpoint çağrılarında <code className="bg-slate-100 px-1 rounded">x-api-key</code> header
              olarak gönderin. Sızdırırsanız hemen rotate edin.
            </p>
          </div>
          <CreditCard className="w-5 h-5 text-slate-400" />
        </div>
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 flex items-center justify-between gap-3 font-mono text-sm overflow-x-auto">
          <span className="flex-1 whitespace-nowrap">
            {revealKey ? agency.apiKey : "•".repeat(agency.apiKey.length)}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setRevealKey((v) => !v)}
              className="text-slate-300 hover:text-white px-2 py-1 inline-flex items-center gap-1.5 text-xs"
              aria-label="API key reveal"
            >
              {revealKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {revealKey ? "Gizle" : "Reveal"}
            </button>
            <button
              onClick={() => copy(agency.apiKey, "key")}
              className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 inline-flex items-center gap-1.5 text-xs rounded"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied === "key" ? "Kopyalandı" : "Kopyala"}
            </button>
          </div>
        </div>
      </div>

      {/* Webhook */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-1">Webhook URL</h3>
        <p className="text-sm text-slate-500 mb-3">
          Rezervasyon durum değişikliklerinde (onay, iptal, iade) bu URL&apos;e POST
          isteği gönderilir. Gövdede HMAC-SHA256 imza header&apos;i bulunur.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="https://your-system.example.com/webhooks/tripandtick"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookUrl(e.target.value);
              setWebhookSaved(false);
            }}
            className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
          />
          <button
            onClick={() => setWebhookSaved(true)}
            disabled={!webhookUrl}
            className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
          >
            Kaydet
          </button>
        </div>
        {webhookSaved && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Demo kayıt — production&apos;da Supabase&apos;e yazılır.
          </p>
        )}
      </div>

      {/* Endpoint listesi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Endpoint&apos;ler</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">GET</span>
            <code className="text-slate-800">{apiBase}/services</code>
            <span className="text-slate-500 hidden sm:inline">— Acente fiyat listesi</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">GET</span>
            <code className="text-slate-800">{apiBase}/bookings</code>
            <span className="text-slate-500 hidden sm:inline">— Acente rezervasyonları</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold">POST</span>
            <code className="text-slate-800">{apiBase}/bookings</code>
            <span className="text-slate-500 hidden sm:inline">— Yeni rezervasyon</span>
          </li>
        </ul>
      </div>

      {/* curl ornek */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">Örnek curl</h3>
          <button
            onClick={() => copy(curlExample, "curl")}
            className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied === "curl" ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre">
          <code>{curlExample}</code>
        </pre>
      </div>

      {/* Docs link */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg mb-1">Tam API Dökümantasyonu</h3>
          <p className="text-slate-300 text-sm">
            OpenAPI 3.1 şeması, Postman koleksiyonu, hata kodları, rate-limit.
          </p>
        </div>
        <a
          href={`mailto:${COMPANY.email}?subject=B2B%20API%20Dokumantasyon%20Talebi`}
          className="bg-accent hover:bg-accent-light text-white font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Dökümantasyonu Talep Et
        </a>
      </div>
    </section>
  );
}
