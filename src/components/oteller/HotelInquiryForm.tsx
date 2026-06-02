"use client";

// HotelInquiryForm — otel info-only flow icin form (booking-tarzi cila).
// Importers: OtelDetayContent.tsx (/oteller/[slug])
// API contract DEGISMEDI: POST /api/hotel-inquiry body =
//   { hotelSlug, hotelName, tier?, region?, name, email, phone,
//     checkIn(YYYY-MM-DD), checkOut(YYYY-MM-DD), adults, children,
//     budget?, preferences?, _hp } ; 30s AbortController ; {message, inquiryId}.
// User: "form doldurarak bize bilgilendirme yapsin (mail ile gondersin)"

import { useState, type FormEvent } from "react";
import { Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

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
  const t = useT();
  const f = t.component.oteller.hotel_inquiry_form;
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
      <div
        className="animate-scale-in rounded-booking border-2 border-emerald-200 bg-emerald-50 p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-600" aria-hidden />
        <h3 className="mb-2 text-lg font-bold text-emerald-900">{f.talebiniz_alindi}</h3>
        <p className="mb-3 text-sm text-emerald-800">{result.msg}</p>
        {result.inquiryId && (
          <p className="text-xs text-emerald-700">
            {f.talep_no} <code className="rounded bg-white px-2 py-0.5 font-mono">{result.inquiryId}</code>
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button asChild variant="whatsapp" size="sm">
            <a href="https://wa.me/905374647861"><MessageSquare className="h-4 w-4" aria-hidden /> WhatsApp</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="tel:+905374647861"><Phone className="h-4 w-4" aria-hidden /> +90 537 464 78 61</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-booking border border-slate-200 bg-white p-6 shadow-booking-card">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{f.otel_bilgi_alin}</h3>
        <p className="mt-1 text-xs text-slate-600">
          {f.formu_doldurun_24_saat_icinde} <b>{f.telefon_posta}</b> {f.arayarak_musaitlik_fiyat}
        </p>
      </div>

      {/* honeypot — anti-spam (gorunmez) */}
      <input type="text" name="_hp" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={f.ad_soyad} htmlFor="hi-name" required className="sm:col-span-2">
          <Input id="hi-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" />
        </Field>
        <Field label={f.telefon_sizi_arayacagiz} htmlFor="hi-phone" required>
          <Input id="hi-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+90 5xx ..." autoComplete="tel" />
        </Field>
        <Field label={f.posta} htmlFor="hi-email" required>
          <Input id="hi-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Field>
        <Field label={f.giris_tarihi} htmlFor="hi-checkin" required>
          <Input id="hi-checkin" type="date" value={checkIn} min={tomorrowIso()} onChange={(e) => setCheckIn(e.target.value)} required />
        </Field>
        <Field label={f.cikis_tarihi} htmlFor="hi-checkout" required>
          <Input id="hi-checkout" type="date" value={checkOut} min={checkIn || tomorrowIso()} onChange={(e) => setCheckOut(e.target.value)} required />
        </Field>
        <Field label={f.yetiskin}>
          <div className="pt-1"><Stepper value={adults} onChange={setAdults} min={1} max={20} label={f.yetiskin} /></div>
        </Field>
        <Field label={f.cocuk}>
          <div className="pt-1"><Stepper value={children} onChange={setChildren} min={0} max={10} label={f.cocuk} /></div>
        </Field>
        <Field label={f.butce_opsiyonel} htmlFor="hi-budget" className="sm:col-span-2">
          <Input id="hi-budget" type="text" value={budget} onChange={(e) => setBudget(e.target.value)} maxLength={100} placeholder={f.input_placeholder_orn_100} />
        </Field>
        <Field label={f.tercihler_not_opsiyonel} htmlFor="hi-prefs" className="sm:col-span-2">
          <Textarea id="hi-prefs" value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={3} maxLength={2000} placeholder={f.textarea_placeholder_orn_balon} />
        </Field>
      </div>

      {result?.kind === "err" && (
        <Banner variant="warning" role="alert">{result.msg}</Banner>
      )}

      <Button type="submit" variant="accent" size="lg" loading={submitting} className="w-full">
        {submitting ? "Gönderiliyor..." : "Bilgi & Fiyat Teklifi İste"}
      </Button>

      <div className="border-t border-slate-100 pt-2 text-center text-xs text-slate-500">
        {f.hemen_iletisim}{" "}
        <a href="tel:+905374647861" className="font-semibold text-booking-600 hover:underline">+90 537 464 78 61</a>
        {" · "}
        <a href="https://wa.me/905374647861" className="font-semibold text-emerald-600 hover:underline">WhatsApp</a>
      </div>
    </form>
  );
}
