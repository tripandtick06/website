"use client";

// /hesabim — Musteri rezervasyon dashboard'u.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: Next.js route /hesabim (Header + Footer link target).
// Glob check: src/app/hesabim/** previously empty.
// Data: localStorage key "tripandtick:bookings" JSON array (Faz 2 Supabase).
//       Lookup-form fallback (kod + email): mock match-by-id (kod normalize TT-XXXXXXXX).
// Iptal: /api/cancel POST.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Gift,
  Mail,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  XCircle,
  Share2,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import type { LoyaltyTransaction, LoyaltyTier } from "@/data/loyalty";

interface StoredBooking {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  serviceSlug: string;
  date: string;
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  insurance?: boolean;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

const STORAGE_KEY = "tripandtick:bookings";

function readBookings(): StoredBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((b): b is StoredBooking =>
      typeof b === "object" && b !== null && typeof (b as StoredBooking).bookingId === "string"
    );
  } catch {
    return [];
  }
}

function writeBookings(list: StoredBooking[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function formatDateTr(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", weekday: "long" });
  } catch {
    return iso;
  }
}

function daysUntil(iso: string): number {
  const d = new Date(iso + "T05:00:00+03:00").getTime();
  if (isNaN(d)) return 999;
  return Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
}

function statusMeta(status: StoredBooking["status"], iso: string): { label: string; cls: string } {
  const days = daysUntil(iso);
  if (status === "cancelled") return { label: "Iptal", cls: "bg-red-100 text-red-700" };
  if (status === "completed" || days < -1) return { label: "Tamamlandi", cls: "bg-slate-100 text-slate-700" };
  if (status === "confirmed") return { label: "Onaylandi", cls: "bg-emerald-100 text-emerald-700" };
  return { label: "Bekliyor", cls: "bg-amber-100 text-amber-700" };
}

function receiptUrl(b: StoredBooking, locale: "tr" | "en" = "tr"): string {
  const params = new URLSearchParams({
    serviceName: b.serviceName,
    serviceSlug: b.serviceSlug,
    date: b.date,
    adults: String(b.adults),
    children: String(b.children),
    total: String(b.totalPrice),
    currency: b.currency,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone ?? "",
    insurance: b.insurance ? "1" : "0",
    lang: locale,
  });
  return `/api/receipt/${encodeURIComponent(b.bookingId)}?${params.toString()}`;
}

function icalDownloadUrl(b: StoredBooking): string {
  const params = new URLSearchParams({
    bookingId: b.bookingId,
    serviceName: b.serviceName,
    date: b.date,
    time: "05:00",
  });
  return `/api/ical?${params.toString()}`;
}

type HesabimTab = "rezervasyonlar" | "puanlarim" | "referans";

interface LoyaltyData {
  balance: number;
  redeemableEuro: number;
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  transactions: LoyaltyTransaction[];
  referral: {
    code: string;
    invited: number;
    confirmed: number;
    pending: number;
    totalBonus: number;
  };
  config?: { earnRate: number; redemptionRate: number; referralBonus: number };
}

export default function HesabimPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code")?.toUpperCase() ?? "";
  const initialTab = (searchParams.get("tab") as HesabimTab) ?? "rezervasyonlar";
  const { format } = useCurrency();
  const [tab, setTab] = useState<HesabimTab>(initialTab);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<StoredBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelResult, setCancelResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [loyaltyEmail, setLoyaltyEmail] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBookings(readBookings());
  }, []);

  // Email seed loyalty fetch icin — son bookingden veya local lookup
  useEffect(() => {
    const stored = readBookings();
    if (stored.length > 0) {
      setLoyaltyEmail((prev) => prev || stored[0].customerEmail);
    }
  }, []);

  const fetchLoyalty = useCallback(async (queryEmail: string) => {
    if (!queryEmail || !/^\S+@\S+\.\S+$/.test(queryEmail)) return;
    setLoyaltyLoading(true);
    try {
      const res = await fetch(`/api/loyalty?email=${encodeURIComponent(queryEmail)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as LoyaltyData;
      setLoyalty(data);
    } catch (err) {
      console.error("[hesabim] loyalty fetch error", err);
      setLoyalty(null);
    } finally {
      setLoyaltyLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((tab === "puanlarim" || tab === "referans") && loyaltyEmail) {
      fetchLoyalty(loyaltyEmail);
    }
  }, [tab, loyaltyEmail, fetchLoyalty]);

  const tierProgress = useMemo(() => {
    if (!loyalty?.nextTier) return 100;
    const current = loyalty.tier.min;
    const next = loyalty.nextTier.min;
    if (next === current) return 100;
    return Math.min(100, Math.round(((loyalty.balance - current) / (next - current)) * 100));
  }, [loyalty]);

  function copyReferral() {
    if (!loyalty?.referral?.code) return;
    const inviteUrl = `${window.location.origin}/davet/${loyalty.referral.code}`;
    navigator.clipboard.writeText(inviteUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }

  const handleLookup = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setLookupError(null);
      const normalized = code.trim().toUpperCase();
      if (!/^TT-[A-Z0-9]{6,12}$/.test(normalized)) {
        setLookupError("Rezervasyon kodu TT-XXXXXXXX formatinda olmalidir.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        setLookupError("Gecerli bir e-posta girin.");
        return;
      }
      const stored = readBookings();
      const match = stored.find(
        (b) =>
          b.bookingId.toUpperCase() === normalized &&
          b.customerEmail.toLowerCase().trim() === email.toLowerCase().trim()
      );
      if (match) {
        const others = stored.filter((b) => b.bookingId !== match.bookingId);
        setBookings([match, ...others]);
        setLookupError(null);
        return;
      }
      const demo: StoredBooking = {
        bookingId: normalized,
        customerName: "Musafir",
        customerEmail: email.trim(),
        serviceName: "Kapadokya Balon Turu",
        serviceSlug: "kapadokya-balon-turu",
        date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        adults: 2,
        children: 0,
        totalPrice: 350,
        currency: "EUR",
        insurance: false,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      const next = [demo, ...stored];
      writeBookings(next);
      setBookings(next);
    },
    [code, email]
  );

  const handleRemoveLocal = useCallback((id: string) => {
    const stored = readBookings();
    const next = stored.filter((b) => b.bookingId !== id);
    writeBookings(next);
    setBookings(next);
  }, []);

  const submitCancel = useCallback(async () => {
    if (!cancelDialog) return;
    setCancelLoading(true);
    setCancelResult(null);
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: cancelDialog.bookingId,
          email: cancelDialog.customerEmail,
          reason: cancelReason || undefined,
          bookingDate: cancelDialog.date,
          totalPrice: cancelDialog.totalPrice,
          currency: cancelDialog.currency as "EUR" | "TRY" | "USD",
          serviceName: cancelDialog.serviceName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelResult({ ok: false, msg: data?.error ?? "Iptal talebi gonderilemedi." });
      } else {
        const stored = readBookings();
        const next = stored.map((b) =>
          b.bookingId === cancelDialog.bookingId ? { ...b, status: "cancelled" as const } : b
        );
        writeBookings(next);
        setBookings(next);
        setCancelResult({ ok: true, msg: data?.message ?? "Iptal talebi alindi." });
      }
    } catch {
      setCancelResult({ ok: false, msg: "Baglanti hatasi. Lutfen tekrar deneyin." });
    } finally {
      setCancelLoading(false);
    }
  }, [cancelDialog, cancelReason]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 pt-[88px] pb-20">
      <div className="container-main max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Hesabim</h1>
          <p className="text-slate-600">Rezervasyonlar, puanlar, referans kodu — hepsi tek yerde.</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {([
            { id: "rezervasyonlar" as const, label: "Rezervasyonlar", icon: Ticket },
            { id: "puanlarim" as const, label: "Puanlarim", icon: Sparkles },
            { id: "referans" as const, label: "Referans", icon: Gift },
          ]).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  active
                    ? "inline-flex items-center gap-2 px-4 py-2.5 border-b-2 border-amber-500 text-amber-700 font-semibold"
                    : "inline-flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-800"
                }
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "rezervasyonlar" && <>

        <form
          onSubmit={handleLookup}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 grid sm:grid-cols-[1fr_1fr_auto] gap-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Rezervasyon Kodu
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="TT-XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-mono tracking-wider text-slate-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-900"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" /> Bul
            </button>
          </div>
          {lookupError && (
            <div className="sm:col-span-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              {lookupError}
            </div>
          )}
        </form>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-700 mb-1">Henuz rezervasyonunuz yok</h2>
            <p className="text-sm text-slate-500 mb-5">
              Yukarda rezervasyon kodunuzu girerek mevcut bir rezervasyonu cagirabilir veya hemen yenisini olusturabilirsiniz.
            </p>
            <Link
              href="/balonlar"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg"
            >
              Balon Turu Sec <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const meta = statusMeta(b.status, b.date);
              const days = daysUntil(b.date);
              const currencyCode = ((["EUR", "TRY", "USD", "GBP"].includes(b.currency)) ? b.currency : "EUR") as "EUR" | "TRY" | "USD" | "GBP";
              return (
                <article
                  key={b.bookingId}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 lg:p-6"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${meta.cls}`}>{meta.label}</span>
                        <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">{b.bookingId}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{b.serviceName}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateTr(b.date)}
                        {days >= 0 && days < 30 && (
                          <span className="ml-1 text-amber-600 font-medium">({days} gun kaldi)</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase text-slate-500 mb-0.5">Toplam</div>
                      <div className="text-xl font-extrabold text-amber-600">{format(b.totalPrice, currencyCode)}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{b.adults} yetiskin · {b.children} cocuk</div>
                    </div>
                  </header>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <a
                      href={receiptUrl(b)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <FileText className="w-4 h-4" /> Fatura PDF
                    </a>
                    <a
                      href={icalDownloadUrl(b)}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Download className="w-4 h-4" /> iCal
                    </a>
                    <a
                      href={`mailto:info@tripandtick.com?subject=Rezervasyon%20${encodeURIComponent(b.bookingId)}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Iletisim
                    </a>
                    {b.status !== "cancelled" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelDialog(b);
                          setCancelReason("");
                          setCancelResult(null);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 bg-red-50 text-red-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <XCircle className="w-4 h-4" /> Iptal Et
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocal(b.bookingId)}
                        className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Sil
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-amber-600">
            <ChevronRight className="w-4 h-4 rotate-180" /> Ana Sayfa
          </Link>
          <a
            href="https://wa.me/905001234567"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-amber-600"
          >
            <ExternalLink className="w-4 h-4" /> WhatsApp destek
          </a>
        </div>

        </>}

        {tab === "puanlarim" && (
          <section className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                E-posta
              </label>
              <div className="flex gap-2">
                <input
                  value={loyaltyEmail}
                  onChange={(e) => setLoyaltyEmail(e.target.value)}
                  type="email"
                  placeholder="ornek@email.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-900"
                />
                <button
                  onClick={() => fetchLoyalty(loyaltyEmail)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm"
                >
                  Sorgula
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Mock veri: ilk 10 musterinin (CUST-0001..CUST-0009) puanlari tanimli.
              </p>
            </div>

            {loyaltyLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                Puanlar yukleniyor...
              </div>
            )}

            {!loyaltyLoading && loyalty && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Mevcut Puan</span>
                    </div>
                    <p className="text-3xl font-extrabold text-amber-700">{loyalty.balance}</p>
                    <p className="text-xs text-slate-500 mt-1">= €{loyalty.redeemableEuro} kullanilabilir</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-violet-200 p-5">
                    <div className="flex items-center gap-2 text-violet-700 mb-2">
                      <Crown className="w-5 h-5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Tier</span>
                    </div>
                    <p className="text-2xl font-extrabold text-violet-700">{loyalty.tier.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Otomatik %{loyalty.tier.discount} indirim
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-rose-200 p-5">
                    <div className="flex items-center gap-2 text-rose-700 mb-2">
                      <Gift className="w-5 h-5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Referans Bonus</span>
                    </div>
                    <p className="text-3xl font-extrabold text-rose-700">{loyalty.referral.totalBonus}</p>
                    <p className="text-xs text-slate-500 mt-1">{loyalty.referral.confirmed} davet onayli</p>
                  </div>
                </div>

                {loyalty.nextTier && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-700 font-semibold">
                        {loyalty.tier.name} → {loyalty.nextTier.name}
                      </span>
                      <span className="text-slate-500">
                        {loyalty.nextTier.min - loyalty.balance} puan kaldi
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                        style={{ width: `${tierProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Bir sonraki tier'da otomatik %{loyalty.nextTier.discount} indirim devreye girer.
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-900 mb-3">Son Hareketler</h3>
                  {loyalty.transactions.length === 0 ? (
                    <p className="text-sm text-slate-500">Henuz puan hareketi yok.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {loyalty.transactions.slice(0, 10).map((tx) => (
                        <li key={tx.id} className="flex items-center justify-between py-2.5 text-sm">
                          <div>
                            <p className="font-medium text-slate-800">{tx.description}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(tx.createdAt).toLocaleDateString("tr-TR")}
                              {tx.bookingId ? ` · ${tx.bookingId}` : ""}
                              {" · "}{tx.type}
                            </p>
                          </div>
                          <span
                            className={
                              tx.points > 0
                                ? "font-bold text-emerald-600"
                                : "font-bold text-rose-600"
                            }
                          >
                            {tx.points > 0 ? "+" : ""}
                            {tx.points}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                  <p className="font-semibold mb-1">Puanlarinizi nasil kullanirsiniz?</p>
                  <p>
                    Bir sonraki rezervasyonda Step 4 (Ozet) ekraninda puanlariniz otomatik onerilir.
                    {loyalty.config && (
                      <>
                        {" "}Sistem her €{loyalty.config.earnRate} harcamada {loyalty.config.earnRate} puan
                        ekler, {loyalty.config.redemptionRate} puan = €1 indirim.
                      </>
                    )}
                  </p>
                </div>
              </>
            )}

            {!loyaltyLoading && !loyalty && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                Once e-posta sorgulayin.
              </div>
            )}
          </section>
        )}

        {tab === "referans" && (
          <section className="space-y-5">
            {!loyalty && !loyaltyLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  E-posta
                </label>
                <div className="flex gap-2">
                  <input
                    value={loyaltyEmail}
                    onChange={(e) => setLoyaltyEmail(e.target.value)}
                    type="email"
                    placeholder="ornek@email.com"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 outline-none text-slate-900"
                  />
                  <button
                    onClick={() => fetchLoyalty(loyaltyEmail)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm"
                  >
                    Kodu Goster
                  </button>
                </div>
              </div>
            )}

            {loyalty && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 text-center">
                  <p className="text-xs uppercase font-semibold text-amber-700 tracking-wider mb-2">
                    Referans Kodunuz
                  </p>
                  <p className="text-4xl font-extrabold text-amber-700 font-mono tracking-wider mb-3">
                    {loyalty.referral.code}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    Bu kodu paylasin — her arkadasiniz +{loyalty.config?.referralBonus ?? 150} puan, siz de
                    +{loyalty.config?.referralBonus ?? 150} puan kazanin.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={copyReferral}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? "Kopyalandi!" : "Linki Kopyala"}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Trip and Tick'te %5 indirim ve 150 puan kazanmak icin davet kodum: ${typeof window !== "undefined" ? window.location.origin : ""}/davet/${loyalty.referral.code}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold"
                    >
                      <Share2 className="w-4 h-4" /> WhatsApp ile Paylas
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent("Trip and Tick davetim — 150 puan + %5 indirim")}&body=${encodeURIComponent(
                        `Selam! Kapadokya balon turu ararken Trip and Tick'i kullanmaya basladim. Sana da bedavadan 150 puan + %5 indirim cikiyor:\n\n${typeof window !== "undefined" ? window.location.origin : ""}/davet/${loyalty.referral.code}`
                      )}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold"
                    >
                      <Mail className="w-4 h-4" /> E-posta
                    </a>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-center">
                    <p className="text-xs uppercase text-slate-500">Toplam Davet</p>
                    <p className="text-2xl font-extrabold text-slate-900">{loyalty.referral.invited}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-4 text-center">
                    <p className="text-xs uppercase text-emerald-600">Onaylandi</p>
                    <p className="text-2xl font-extrabold text-emerald-700">{loyalty.referral.confirmed}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-4 text-center">
                    <p className="text-xs uppercase text-amber-600">Bekliyor</p>
                    <p className="text-2xl font-extrabold text-amber-700">{loyalty.referral.pending}</p>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {cancelDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => !cancelLoading && setCancelDialog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Iptal Talebi
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-mono font-bold">{cancelDialog.bookingId}</span> rezervasyonunuzu iptal etmek istediginizden emin misiniz?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-xs text-slate-600 space-y-1">
              <div><strong>72 saat once:</strong> %100 iade (3-5 is gunu)</div>
              <div><strong>24-72 saat:</strong> %50 iade</div>
              <div><strong>24 saatten az:</strong> iade yok (operator hava iptalinde tam iade)</div>
            </div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Sebep (opsiyonel)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Iptal sebebinizi bizimle paylasin..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm text-slate-900"
            />

            {cancelResult && (
              <div
                className={`mt-3 flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
                  cancelResult.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {cancelResult.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                <span>{cancelResult.msg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setCancelDialog(null)}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium disabled:opacity-50"
              >
                {cancelResult?.ok ? "Kapat" : "Vazgec"}
              </button>
              {!cancelResult?.ok && (
                <button
                  type="button"
                  onClick={submitCancel}
                  disabled={cancelLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {cancelLoading ? "Gonderiliyor..." : "Iptal Talebini Gonder"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
