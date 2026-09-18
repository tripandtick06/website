"use client";

// /admin/analiz — davranış paneli: giriş/çıkış sayfaları, funnel, sayfa süreleri,
// ürünler, kaynaklar. Veri: GET /api/admin/analytics?days=N (httpOnly admin cookie).
// Sade + beyaz: ana sorun üstte (funnel), ayrıntı tablolar altta.

import { useEffect, useState } from "react";
import { WaLeads } from "./WaLeads";

type Row = Record<string, string | number | null>;
interface Summary {
  days: number;
  generated: string;
  totals: Record<string, number | null>;
  daily: Row[];
  entry_pages: Row[];
  exit_pages: Row[];
  pages: Row[];
  products: Row[];
  dims: { locale: Row[]; country: Row[]; device: Row[]; referrer: Row[] };
  searches: Row[];
}

const RANGES = [7, 30, 90] as const;

function n(v: unknown): string {
  if (v === null || v === undefined) return "–";
  return typeof v === "number" ? v.toLocaleString("tr-TR") : String(v);
}
function pct(a: number | null | undefined, b: number | null | undefined): string {
  if (!a || !b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function Table({ title, rows, cols, note }: { title: string; rows: Row[]; cols: [string, string][]; note?: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-4 py-3">
        <h2 className="font-bold text-slate-900">{title}</h2>
        {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      </header>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">Henüz veri yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                {cols.map(([k, label]) => (
                  <th key={k} className="px-4 py-2 font-semibold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {cols.map(([k]) => (
                    <td key={k} className={`px-4 py-2 ${typeof r[k] === "number" ? "tabular-nums" : "max-w-[420px] truncate"}`}>{n(r[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AnalizPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?days=${days}`, { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        const j = (await r.json()) as { ok?: boolean; summary?: Summary; error?: string };
        if (!r.ok || !j.summary) throw new Error(j.error ?? `HTTP ${r.status}`);
        if (!cancelled) setData(j.summary);
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Hata"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [days]);

  const t = data?.totals ?? {};
  const sessions = t.sessions ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Ziyaretçi davranışı</h1>
          <p className="text-sm text-slate-500">Cookie'siz birinci-taraf ölçüm — botlar elenir, kişisel veri yok.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${days === r ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {r} gün
            </button>
          ))}
        </div>
      </div>

      {/* Atıf döngüsü en üstte: tıklama değil, satış ölçülür */}
      <WaLeads days={days} />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading && !data && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {data && (
        <>
          {/* Funnel — ana soru: giren kaç kişi ürün gördü, kaçı WhatsApp/rezervasyona geçti */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <Stat label="Oturum" value={n(sessions)} hint={`${n(t.pageviews)} sayfa · ort. ${n(t.avg_pageviews)} sayfa/oturum`} />
            <Stat label="Hemen çıkma" value={`${n(t.bounce_rate)}%`} hint="tek sayfa görüp giden" />
            <Stat label="Ort. oturum" value={`${n(t.avg_session_seconds)} sn`} />
            <Stat label="WhatsApp'a geçen" value={n(t.whatsapp_sessions)} hint={pct(t.whatsapp_sessions, sessions) + " oturum"} />
            <Stat label="Rezervasyona tıklayan" value={n(t.reserve_sessions)} hint={`${pct(t.reserve_sessions, sessions)} · rezervasyon sayfası ${n(t.booking_page_sessions)}`} />
            <Stat label="Rezervasyon 3+ adım" value={n(t.booking_deep_sessions)} hint={`tamamlanan ${n(t.booking_done_sessions)} · form ${n(t.form_sessions)}`} />
          </div>

          <Table
            title="Günlük"
            rows={data.daily}
            cols={[["date", "Gün"], ["sessions", "Oturum"], ["pageviews", "Sayfa"], ["whatsapp", "WhatsApp"]]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Table
              title="Giriş sayfaları"
              note="Ziyaretçi siteye nereden girdi; hemen çıkma % o sayfanın ilk izlenimi."
              rows={data.entry_pages}
              cols={[["path", "Sayfa"], ["sessions", "Oturum"], ["bounce_rate", "Çıkma %"], ["whatsapp", "WA"], ["reserve", "Rez."]]}
            />
            <Table
              title="Çıkış sayfaları"
              note="Oturumun son sayfası — burada kaybediyoruz."
              rows={data.exit_pages}
              cols={[["path", "Sayfa"], ["exits", "Çıkış"], ["share", "% pay"]]}
            />
          </div>

          <Table
            title="Sayfalar"
            note="Süre ve kaydırma derinliği sayfa kapanışında ölçülür; WA/Rez. o sayfadaki tıklamalar."
            rows={data.pages}
            cols={[["path", "Sayfa"], ["pageviews", "Görüntüleme"], ["avg_seconds", "Ort. sn"], ["avg_scroll", "Kaydırma %"], ["whatsapp", "WA"], ["reserve", "Rez."]]}
          />

          <Table
            title="Ürünler"
            note="Detay sayfası görülen ürün → WhatsApp / rezervasyon tıklaması / 3+ adım ilerleyen oturum."
            rows={data.products}
            cols={[["product", "Ürün"], ["views", "Görüntüleme"], ["whatsapp", "WA oturum"], ["reserve", "Rez. oturum"], ["booking_deep", "3+ adım"]]}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Table title="Dil" rows={data.dims.locale} cols={[["key", "Dil"], ["sessions", "Oturum"], ["whatsapp", "WA"]]} />
            <Table title="Ülke" rows={data.dims.country} cols={[["key", "Ülke"], ["sessions", "Oturum"], ["whatsapp", "WA"]]} />
            <Table title="Cihaz" rows={data.dims.device} cols={[["key", "Cihaz"], ["sessions", "Oturum"], ["whatsapp", "WA"]]} />
            <Table title="Kaynak" rows={data.dims.referrer} cols={[["key", "Referrer"], ["sessions", "Oturum"], ["whatsapp", "WA"]]} />
          </div>

          <Table title="Site içi aramalar" rows={data.searches} cols={[["q", "Arama"], ["n", "Adet"]]} />

          <p className="text-xs text-slate-400">Oluşturma: {new Date(data.generated).toLocaleString("tr-TR")} · veri 90 gün tutulur.</p>
        </>
      )}
    </div>
  );
}
