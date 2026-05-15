"use client";

// B2B basvuru formu — /b2b sayfasi icin.
//
// Importers: src/app/b2b/page.tsx (line ~12 import, ~130 render)
// Affected: B2B aday acente basvuru kanali UI.
// POST: /api/b2b/apply  body: {name, email, phone, company, license, country}
//       30s AbortController timeout (page-stuck koruma).
// User verbatim: "Basvur form (email + sirket adi + telefon + ulke + acente
// lisans no)."

import { useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

const COUNTRIES = [
  "Türkiye",
  "Almanya",
  "Avusturya",
  "İsviçre",
  "İngiltere",
  "Fransa",
  "İspanya",
  "İtalya",
  "Hollanda",
  "Belçika",
  "Polonya",
  "Çekya",
  "Romanya",
  "Yunanistan",
  "Bulgaristan",
  "Ürdün",
  "Lübnan",
  "Mısır",
  "BAE",
  "Suudi Arabistan",
  "ABD",
  "Kanada",
  "Brezilya",
  "Japonya",
  "Çin",
  "Hindistan",
  "Diğer",
];

export function B2BApplyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      license: String(fd.get("license") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim(),
      _hp: String(fd.get("_hp") ?? ""),
    };

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);

    try {
      const res = await fetch("/api/b2b/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Başvuru gönderilemedi. Lütfen tekrar deneyin.");
      } else {
        setSuccess(
          data.applicationId
            ? `Başvurunuz alındı. Referans: ${data.applicationId}. 24 saat içinde dönüş yapılacak.`
            : "Başvurunuz alındı. 24 saat içinde dönüş yapılacak."
        );
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      clearTimeout(timer);
      if ((err as Error).name === "AbortError") {
        setError("Sunucu yanıt vermedi. Lütfen tekrar deneyin.");
      } else {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-7 space-y-4"
      aria-label="B2B acente başvuru formu"
    >
      {/* Honeypot */}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="b2b-name" className="block text-sm font-medium text-slate-700 mb-1">
            Yetkili Ad Soyad <span className="text-rose-500">*</span>
          </label>
          <input
            id="b2b-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="b2b-company" className="block text-sm font-medium text-slate-700 mb-1">
            Şirket Adı <span className="text-rose-500">*</span>
          </label>
          <input
            id="b2b-company"
            name="company"
            type="text"
            required
            minLength={2}
            maxLength={200}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="b2b-email" className="block text-sm font-medium text-slate-700 mb-1">
            Kurumsal E-posta <span className="text-rose-500">*</span>
          </label>
          <input
            id="b2b-email"
            name="email"
            type="email"
            required
            maxLength={200}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="b2b-phone" className="block text-sm font-medium text-slate-700 mb-1">
            Telefon <span className="text-rose-500">*</span>
          </label>
          <input
            id="b2b-phone"
            name="phone"
            type="tel"
            required
            maxLength={40}
            placeholder="+90 ..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="b2b-country" className="block text-sm font-medium text-slate-700 mb-1">
            Ülke <span className="text-rose-500">*</span>
          </label>
          <select
            id="b2b-country"
            name="country"
            required
            defaultValue=""
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white"
          >
            <option value="" disabled>
              Seçin...
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="b2b-license" className="block text-sm font-medium text-slate-700 mb-1">
            Acente Lisans No <span className="text-rose-500">*</span>
          </label>
          <input
            id="b2b-license"
            name="license"
            type="text"
            required
            minLength={2}
            maxLength={80}
            placeholder="TÜRSAB A-XXXX veya yerel lisans"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-sm text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-light disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        <Send className="w-4 h-4" />
        {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
      </button>
      <p className="text-xs text-slate-500 text-center">
        Başvurunuzla{" "}
        <a href="/kullanim-sartlari" className="underline hover:text-slate-700">
          kullanım şartlarını
        </a>{" "}
        kabul etmiş sayılırsınız.
      </p>
    </form>
  );
}
