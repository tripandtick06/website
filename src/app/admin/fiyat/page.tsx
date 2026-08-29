"use client";

// /admin/fiyat — admin gunluk fiyat + iptal/rotar yonetimi.
// Auth: localStorage AUTH_KEY + x-admin-token header NEXT_PUBLIC_ADMIN_TOKEN.

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";

const AUTH_KEY = "tripandtick:admin:auth";
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "demo-admin-token-rotate-me";

type Status = "active" | "cancelled" | "delayed" | "sold_out";

interface Override {
  serviceSlug: string;
  date: string;
  priceOverride: number | null;
  currency: string;
  status: Status;
  cancellationReason: string | null;
  delayMinutes: number | null;
  note: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

interface CatalogChoice {
  slug: string;
  name: string;
  category: string;
  catalogPrice: number;
  currency: string;
}

function allServices(): CatalogChoice[] {
  const balloons: CatalogChoice[] = BALLOON_PACKAGES.map((p) => ({
    slug: p.slug, name: p.name, category: "Balon", catalogPrice: p.adultPrice, currency: p.currency,
  }));
  const acts: CatalogChoice[] = ACTIVITIES.map((s) => ({ slug: s.slug, name: s.name, category: "Aktivite", catalogPrice: s.adultPrice, currency: s.currency }));
  const tours: CatalogChoice[] = TOURS.map((s) => ({ slug: s.slug, name: s.name, category: "Tur", catalogPrice: s.adultPrice, currency: s.currency }));
  const hotels: CatalogChoice[] = HOTELS.map((s) => ({ slug: s.slug, name: s.name, category: "Otel", catalogPrice: s.adultPrice, currency: s.currency }));
  const pkgs: CatalogChoice[] = PACKAGES.map((s) => ({ slug: s.slug, name: s.name, category: "Paket", catalogPrice: s.adultPrice, currency: s.currency }));
  const trs: CatalogChoice[] = TRANSFERS.map((s) => ({ slug: s.slug, name: s.name, category: "Transfer", catalogPrice: s.adultPrice, currency: s.currency }));
  return [...balloons, ...acts, ...tours, ...hotels, ...pkgs, ...trs];
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function plus30DaysIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function AdminFiyatPage() {
  const router = useRouter();
  const services = useMemo(() => allServices(), []);

  const [slug, setSlug] = useState<string>(services[0]?.slug ?? "");
  const [date, setDate] = useState<string>(tomorrowIso());
  const [priceOverride, setPriceOverride] = useState<string>("");
  const [status, setStatus] = useState<Status>("active");
  const [reason, setReason] = useState<string>("");
  const [delayMin, setDelayMin] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(false);

  const [bulkSlugs, setBulkSlugs] = useState<string[]>([]);
  const [bulkDate, setBulkDate] = useState<string>(tomorrowIso());
  const [bulkReason, setBulkReason] = useState<string>("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  interface ImpactedRow {
    bookingId: string;
    customerName: string;
    customerEmail: string;
    serviceName: string;
    pax: number;
    total: number;
    currency: string;
    alternativeDates: string[];
  }
  interface PreviewState {
    count: number;
    totalPax: number;
    totalRefund: number;
    currency: string;
    bookings: ImpactedRow[];
  }
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  // Manuel iade state
  const [refundBookingId, setRefundBookingId] = useState("");
  const [refundReason, setRefundReason] = useState<"requested_by_customer" | "duplicate" | "fraudulent">("requested_by_customer");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundNotify, setRefundNotify] = useState(true);
  const [refundNote, setRefundNote] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundResult, setRefundResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tok = window.localStorage.getItem(AUTH_KEY);
    if (!tok) router.replace("/admin/login");
  }, [router]);

  const currentService = useMemo(() => services.find((s) => s.slug === slug), [services, slug]);

  async function loadOverrides() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/service-override?slug=${encodeURIComponent(slug)}&startDate=${tomorrowIso()}&endDate=${plus30DaysIso()}`,
        { headers: { "x-admin-token": ADMIN_TOKEN } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOverrides(data.overrides ?? []);
    } catch (err) {
      console.error("loadOverrides", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) void loadOverrides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleSave() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const body: Record<string, unknown> = { slug, date, status };
      if (priceOverride.trim() !== "") body.priceOverride = Number(priceOverride);
      else body.priceOverride = null;
      if (reason.trim()) body.cancellationReason = reason.trim();
      if (delayMin.trim()) body.delayMinutes = Number(delayMin);
      if (note.trim()) body.note = note.trim();
      body.updatedBy = "admin@tripandtick.com";

      const res = await fetch("/api/admin/service-override", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFeedback({ kind: "ok", msg: "Kayit basarili." });
      await loadOverrides();
    } catch (err) {
      setFeedback({ kind: "err", msg: err instanceof Error ? err.message : "Hata" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(slugX: string, dateX: string) {
    if (!confirm(`${slugX} / ${dateX} override sil?`)) return;
    try {
      const res = await fetch(
        `/api/admin/service-override?slug=${encodeURIComponent(slugX)}&date=${encodeURIComponent(dateX)}`,
        { method: "DELETE", headers: { "x-admin-token": ADMIN_TOKEN } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadOverrides();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Silme hatasi");
    }
  }

  async function handleBulkCancel() {
    if (bulkSlugs.length === 0 || !bulkDate || bulkReason.trim().length < 2) {
      alert("Slug seç, tarih ve sebep gerekli.");
      return;
    }
    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/admin/service-override", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({
          mode: "bulk-cancel",
          slugs: bulkSlugs,
          date: bulkDate,
          reason: bulkReason.trim(),
          updatedBy: "admin@tripandtick.com",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      alert(`${data.count} hizmet iptal edildi.`);
      await loadOverrides();
      await loadImpactedPreview();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Toplu iptal hatasi");
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function loadImpactedPreview() {
    if (bulkSlugs.length === 0 || !bulkDate) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    setNotifyResult(null);
    try {
      const res = await fetch("/api/admin/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ mode: "preview", slugs: bulkSlugs, date: bulkDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setPreview({
        count: data.count ?? 0,
        totalPax: data.totalPax ?? 0,
        totalRefund: data.totalRefund ?? 0,
        currency: data.currency ?? "EUR",
        bookings: data.bookings ?? [],
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Preview hatasi");
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleNotifyCustomers() {
    if (!preview || preview.count === 0) return;
    if (!confirm(`${preview.count} müşteriye iptal + alternatif/iade e-postası gönderilecek. Devam?`)) return;
    setNotifySending(true);
    setNotifyResult(null);
    try {
      const res = await fetch("/api/admin/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({
          mode: "send",
          slugs: bulkSlugs,
          date: bulkDate,
          cancellationReason: bulkReason.trim() || undefined,
          locale: "tr",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setNotifyResult(
        `OK — Toplam: ${data.total}, Gönderildi: ${data.sent}, Demo-log: ${data.demoLogged}, Atlandı (no email): ${data.skippedNoEmail}`
      );
    } catch (err) {
      setNotifyResult(`HATA: ${err instanceof Error ? err.message : "Bilinmeyen"}`);
    } finally {
      setNotifySending(false);
    }
  }

  async function handleManualRefund() {
    const id = refundBookingId.trim().toUpperCase();
    if (!/^TT-[A-Z0-9]{8}$/.test(id)) {
      setRefundResult({ ok: false, msg: "Booking ID formati hatali (TT-XXXXXXXX bekleniyor)" });
      return;
    }
    if (!confirm(`${id} icin Stripe iade tetiklenecek (canli para hareketi). Devam?`)) return;
    setRefundSubmitting(true);
    setRefundResult(null);
    try {
      const body: Record<string, unknown> = {
        bookingId: id,
        reason: refundReason,
        notifyCustomer: refundNotify,
      };
      const amt = parseFloat(refundAmount);
      if (refundAmount.trim() && Number.isFinite(amt) && amt > 0) {
        body.amountMinor = Math.round(amt * 100);
      }
      if (refundNote.trim()) body.note = refundNote.trim();
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const r = data.refund ?? {};
      setRefundResult({
        ok: true,
        msg: r.id
          ? `OK — Stripe Refund ${r.id} (${r.status ?? "?"}) ${((r.amountMinor ?? 0) / 100).toFixed(2)} ${(r.currency ?? "").toUpperCase()}`
          : "OK — demo-log (Stripe canli key yok)",
      });
      setRefundBookingId("");
      setRefundAmount("");
      setRefundNote("");
    } catch (err) {
      setRefundResult({ ok: false, msg: err instanceof Error ? err.message : "Bilinmeyen hata" });
    } finally {
      setRefundSubmitting(false);
    }
  }

  const balloonSlugs = useMemo(() => BALLOON_PACKAGES.map((b) => b.slug), []);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fiyat & İptal Yönetimi</h1>
            <p className="text-sm text-slate-600">Günlük fiyat override + hava iptal/rotar — tüm hizmetler.</p>
          </div>
          <Link href="/admin" className="text-sm text-amber-600 hover:underline">← Admin Panel</Link>
        </header>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm mb-6">
          <p className="text-sky-900">
            Bu sayfa <strong>tarihe-ozel</strong> fiyat/iptal/rotar icindir. Taban fiyatlar (tum
            tarihlerde gecerli varsayilan) icin{" "}
            <Link href="/admin?tab=fiyatlar" className="font-semibold underline">
              ana panel → Fiyatlar sekmesi
            </Link>
            .
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Tek Tarih Düzenle</h2>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">Hizmet</span>
                <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>[{s.category}] {s.name} — {s.catalogPrice} {s.currency}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">Tarih</span>
                <input type="date" value={date} min={tomorrowIso()} onChange={(e) => setDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Fiyat Override ({currentService?.currency ?? "EUR"}) — bos: katalog fiyati
                </span>
                <input type="number" step="0.01" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} placeholder={`Katalog: ${currentService?.catalogPrice ?? "-"}`} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">Durum</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                  <option value="active">Aktif (rezerve edilebilir)</option>
                  <option value="cancelled">İptal (hava/diger)</option>
                  <option value="delayed">Rotar (gecikme)</option>
                  <option value="sold_out">Dolu</option>
                </select>
              </label>

              {(status === "cancelled" || status === "sold_out") && (
                <label className="block">
                  <span className="block text-xs font-medium text-slate-700 mb-1">İptal sebebi</span>
                  <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ornek: Ruzgar 35 km/s ustu" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </label>
              )}

              {status === "delayed" && (
                <label className="block">
                  <span className="block text-xs font-medium text-slate-700 mb-1">Rotar (dakika)</span>
                  <input type="number" min="0" max="720" value={delayMin} onChange={(e) => setDelayMin(e.target.value)} placeholder="60" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </label>
              )}

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">Not (musteriye gosterilir)</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </label>

              <button onClick={handleSave} disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
                {submitting ? "Kaydediliyor..." : "Kaydet (Upsert)"}
              </button>

              {feedback && (
                <div className={`text-xs rounded p-2 ${feedback.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {feedback.msg}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Toplu Hava İptal</h2>
            <p className="text-xs text-slate-500 mb-4">Belirli tarihte secili hizmetleri toplu iptal et.</p>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">Tarih</span>
                <input type="date" value={bulkDate} min={tomorrowIso()} onChange={(e) => setBulkDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </label>

              <div>
                <span className="block text-xs font-medium text-slate-700 mb-1">Hizmetler (multi-select)</span>
                <div className="border border-slate-300 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                  <button type="button" onClick={() => setBulkSlugs(balloonSlugs)} className="text-[11px] text-amber-600 hover:underline mb-1">+ Tum balonlari sec</button>
                  {services.map((s) => (
                    <label key={s.slug} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={bulkSlugs.includes(s.slug)} onChange={(e) => {
                        if (e.target.checked) setBulkSlugs((p) => [...p, s.slug]);
                        else setBulkSlugs((p) => p.filter((x) => x !== s.slug));
                      }} />
                      <span>[{s.category}] {s.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{bulkSlugs.length} seçildi</p>
              </div>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">İptal sebebi</span>
                <input type="text" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} placeholder="Hava sartlari (ruzgar/sis/yagmur)" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </label>

              <button onClick={handleBulkCancel} disabled={bulkSubmitting || bulkSlugs.length === 0} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
                {bulkSubmitting ? "Iptal ediliyor..." : `${bulkSlugs.length} hizmeti iptal et`}
              </button>

              <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
                <button
                  onClick={loadImpactedPreview}
                  disabled={previewLoading || bulkSlugs.length === 0 || !bulkDate}
                  className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {previewLoading ? "Yukleniyor..." : "Etkilenen rezervasyonlari onizle"}
                </button>

                {preview && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs space-y-2">
                    <div className="font-semibold text-amber-900">
                      {preview.count} rezervasyon · {preview.totalPax} kisi · iade toplami: {preview.totalRefund} {preview.currency}
                    </div>
                    {preview.bookings.length > 0 && (
                      <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-amber-800">
                        {preview.bookings.map((b) => (
                          <div key={b.bookingId} className="flex justify-between border-b border-amber-200 pb-1 last:border-0">
                            <span className="font-mono">{b.bookingId}</span>
                            <span>{b.customerName} ({b.pax}p)</span>
                            <span>{b.total} {b.currency}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleNotifyCustomers}
                      disabled={notifySending || preview.count === 0}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded font-semibold disabled:opacity-50"
                    >
                      {notifySending ? "Gonderiliyor..." : `${preview.count} musteriye e-posta gonder`}
                    </button>
                    {notifyResult && (
                      <div className={`text-[11px] rounded p-2 ${notifyResult.startsWith("HATA") ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {notifyResult}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{currentService?.name ?? slug} — sonraki 30 gun override listesi</h2>
            <button onClick={loadOverrides} className="text-xs text-amber-600 hover:underline">Yenile</button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Yukleniyor...</p>
          ) : overrides.length === 0 ? (
            <p className="text-sm text-slate-500">Override yok (katalog fiyati gecerli).</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-left text-slate-500 border-b">
                <tr>
                  <th className="py-2">Tarih</th>
                  <th>Fiyat</th>
                  <th>Durum</th>
                  <th>Sebep / Rotar</th>
                  <th>Not</th>
                  <th>Guncelleme</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((o) => (
                  <tr key={o.date} className="border-b last:border-b-0">
                    <td className="py-2 font-mono">{o.date}</td>
                    <td>{o.priceOverride !== null ? `${o.priceOverride} ${o.currency}` : "katalog"}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        o.status === "active" ? "bg-emerald-100 text-emerald-700"
                        : o.status === "cancelled" ? "bg-rose-100 text-rose-700"
                        : o.status === "delayed" ? "bg-amber-100 text-amber-700"
                        : "bg-slate-200 text-slate-700"
                      }`}>{o.status}</span>
                    </td>
                    <td>{o.cancellationReason ?? (o.delayMinutes != null ? `${o.delayMinutes} dk` : "—")}</td>
                    <td className="max-w-xs truncate">{o.note ?? "—"}</td>
                    <td className="text-slate-500">{o.updatedAt.slice(0, 16).replace("T", " ")}</td>
                    <td>
                      <button onClick={() => handleDelete(o.serviceSlug, o.date)} className="text-rose-600 hover:underline">Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mt-8 border-l-4 border-rose-400">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Manuel İade (Stripe Refunds API)</h2>
          <p className="text-sm text-slate-600 mb-4">
            Tek rezervasyon icin Stripe iadesi tetikler. Otomatik mail + DB status update.
            Kismi iade icin tutar gir, bos birakirsan tam iade.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Booking ID (TT-XXXXXXXX)</label>
              <input
                type="text"
                value={refundBookingId}
                onChange={(e) => setRefundBookingId(e.target.value)}
                placeholder="TT-A1B2C3D4"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Iade sebebi</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value as typeof refundReason)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="requested_by_customer">Musteri talebi</option>
                <option value="duplicate">Cift kayit</option>
                <option value="fraudulent">Sahtekarlik</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tutar (bos = tam iade)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="60.00"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={refundNotify}
                  onChange={(e) => setRefundNotify(e.target.checked)}
                  className="w-4 h-4"
                />
                Musteriye onay maili gonder
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Not (opsiyonel)</label>
              <input
                type="text"
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder="Ic-log icin not"
                maxLength={500}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleManualRefund}
              disabled={refundSubmitting || !refundBookingId.trim()}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-semibold py-2 px-5 rounded-md text-sm transition"
            >
              {refundSubmitting ? "Iade isleniyor…" : "Iade tetikle"}
            </button>
            {refundResult && (
              <span className={`text-sm ${refundResult.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {refundResult.msg}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
