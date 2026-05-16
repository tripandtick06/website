"use client";

// YenidenTarihClient — alt-tarih veya %100 iade secim UI.
// Caller: page.tsx (server component) — token + booking props.
// POST /api/rezervasyon/yeniden-tarih { token, action, newDate? }.

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CalendarDays, RefreshCcw } from "lucide-react";

interface Props {
  token: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  originalDate: string;
  alternativeDates: string[];
  refundAmount: number;
  currency: string;
}

function formatDateTr(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00.000Z`);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "TRY" ? "₺" : currency + " ";
  return `${symbol}${amount.toLocaleString("tr-TR")}`;
}

export function YenidenTarihClient(props: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(props.alternativeDates[0] ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    | { kind: "reschedule"; newDate: string }
    | { kind: "refund"; amount: number; currency: string }
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "reschedule" | "refund") {
    if (action === "reschedule" && !selectedDate) {
      setError("Lütfen alternatif tarih seçin.");
      return;
    }
    if (action === "refund" && !confirm("Tam iade istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rezervasyon/yeniden-tarih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: props.token,
          action,
          newDate: action === "reschedule" ? selectedDate : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (action === "reschedule") {
        setResult({ kind: "reschedule", newDate: selectedDate });
      } else {
        setResult({
          kind: "refund",
          amount: data.refundAmount ?? props.refundAmount,
          currency: data.currency ?? props.currency,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          {result.kind === "reschedule" ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Yeni Tarihiniz Onaylandı</h1>
              <p className="text-slate-600 mb-4">
                <strong>{props.serviceName}</strong> rezervasyonunuz{" "}
                <strong>{formatDateTr(result.newDate)}</strong> tarihine taşındı.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">İade Talebiniz Alındı</h1>
              <p className="text-slate-600 mb-4">
                <strong>{formatCurrency(result.amount, result.currency)}</strong> iadesi 5 iş günü
                içinde kartınıza yansıyacaktır.
              </p>
            </>
          )}
          <p className="text-xs text-slate-500">Onay e-postası kayıtlı adresinize gönderildi.</p>
          <p className="text-xs text-slate-500 mt-1">Rezervasyon: <code className="font-mono">{props.bookingId}</code></p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-lg p-4 mb-6 flex gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="font-bold text-rose-900 text-lg">Rezervasyonunuz iptal edildi</h1>
            <p className="text-sm text-rose-700 mt-1">
              Merhaba <strong>{props.customerName}</strong>, <strong>{formatDateTr(props.originalDate)}</strong>{" "}
              tarihindeki <strong>{props.serviceName}</strong> hizmetiniz iptal edilmek zorunda kalındı.
              Aşağıdan tercih ettiğiniz çözümü seçin.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-slate-900">Seçenek 1 — Alternatif Tarih</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">
              Önerilen
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Aynı hizmet için sonraki uygun tarihler:
          </p>
          {props.alternativeDates.length === 0 ? (
            <div className="text-sm text-amber-700 bg-amber-50 rounded p-3">
              Yakın tarihlerde uygun slot bulunamadı. Lütfen WhatsApp ile iletişime geçin.
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {props.alternativeDates.map((d) => (
                <label
                  key={d}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                    selectedDate === d
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="altDate"
                    value={d}
                    checked={selectedDate === d}
                    onChange={() => setSelectedDate(d)}
                    className="accent-amber-500"
                  />
                  <span className="font-semibold text-slate-900">{formatDateTr(d)}</span>
                </label>
              ))}
            </div>
          )}
          <button
            onClick={() => submit("reschedule")}
            disabled={busy || props.alternativeDates.length === 0 || !selectedDate}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm"
          >
            {busy ? "Onaylanıyor..." : "Seçili tarihe taşı"}
          </button>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCcw className="w-5 h-5 text-slate-600" />
            <h2 className="font-bold text-slate-900">Seçenek 2 — Tam İade</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            <strong>{formatCurrency(props.refundAmount, props.currency)}</strong> tutarın tamamı
            kartınıza 5 iş günü içinde iade edilir.
          </p>
          <button
            onClick={() => submit("refund")}
            disabled={busy}
            className="w-full bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm"
          >
            {busy ? "İşleniyor..." : "Tam iade iste"}
          </button>
        </section>

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-300 text-rose-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-500 text-center mt-6">
          Rezervasyon: <code className="font-mono">{props.bookingId}</code> · Yardım için{" "}
          <a href="https://wa.me/905374647861" className="text-amber-600 hover:underline">
            WhatsApp +90 537 464 78 61
          </a>
        </p>
      </div>
    </main>
  );
}
