"use client";

// HotelInquiryForm — otel info-only flow icin form.
// Importers: /oteller/[slug]/page.tsx
// User: "form doldurarak bize bilgilendirme yapsim (mail ile gondersin)"

import { useState, type FormEvent } from "react";
import { Phone, Mail, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  hotelSlug: string;
  hotelName: string;
  tier?: "budget" | "mid" | "lux";
  region?: string;
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function plusNDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function HotelInquiryForm({ hotelSlug, hotelName, tier, region }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState(tomorrowIso());
  const [checkOut, setCheckOut] = useState(plusNDays(3));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState("");
  const [hp, setHp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; msg: string; inquiryId?: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch("/api/hotel-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSlug, hotelName, tier, region,
          name, email, phone,
          checkIn, checkOut,
          adults, children,
          budget: budget.trim() || undefined,
          preferences: preferences.trim() || undefined,
          _hp: hp,
        }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult({ kind: "ok", msg: data.message ?? "Talebiniz alındı.", inquiryId: data.inquiryId });
      setName(""); setEmail(""); setPhone(""); setBudget(""); setPreferences("");
    } catch (err) {
      setResult({ kind: "err", msg: err instanceof Error ? err.message : "Hata olustu" });
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  }

  if (result?.kind === "ok") {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-emerald-900 mb-2">Talebiniz Alındı</h3>
        <p className="text-sm text-emerald-800 mb-3">{result.msg}</p>
        {result.inquiryId && (
          <p className="text-xs text-emerald-700">Talep No: <code className="bg-white px-2 py-0.5 rounded font-mono">{result.inquiryId}</code></p>
        )}
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
          <a href="tel:+905374647861" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
            <Phone className="w-4 h-4" /> +90 537 464 78 61
          </a>
          <a href="https://wa.me/905374647861" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Otel için bilgi alın</h3>
        <p className="text-xs text-slate-600 mt-1">
          Formu doldurun — 24 saat içinde sizi <b>telefon veya e-posta</b> ile arayarak müsaitlik ve fiyat teklifi paylaşacağız.
        </p>
      </div>

      <input type="text" name="_hp" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">Ad Soyad *</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">Telefon * (sizi arayacağız)</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+90 5xx ..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs font-medium text-slate-700 mb-1">E-posta *</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">Giriş Tarihi *</span>
          <input type="date" value={checkIn} min={tomorrowIso()} onChange={(e) => setCheckIn(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">Çıkış Tarihi *</span>
          <input type="date" value={checkOut} min={checkIn || tomorrowIso()} onChange={(e) => setCheckOut(e.target.value)} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">Yetişkin *</span>
          <input type="number" min={1} max={20} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">Çocuk</span>
          <input type="number" min={0} max={10} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs font-medium text-slate-700 mb-1">Bütçe (opsiyonel)</span>
          <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Örn: 100-150 EUR / gece" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs font-medium text-slate-700 mb-1">Tercihler / Not (opsiyonel)</span>
          <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={3} maxLength={2000} placeholder="Örn: balon manzaralı oda, jakuzili, balayı dekoru..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </label>
      </div>

      {result?.kind === "err" && (
        <div className="flex items-start gap-2 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs p-3 rounded">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{result.msg}</span>
        </div>
      )}

      <button type="submit" disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" />
        {submitting ? "Gönderiliyor..." : "Bilgi & Fiyat Teklifi İste"}
      </button>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Hemen iletişim için:{" "}
        <a href="tel:+905374647861" className="text-amber-600 hover:underline font-semibold">+90 537 464 78 61</a>
        {" · "}
        <a href="https://wa.me/905374647861" className="text-emerald-600 hover:underline font-semibold">WhatsApp</a>
      </div>
    </form>
  );
}
