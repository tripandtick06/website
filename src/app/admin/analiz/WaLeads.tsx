"use client";

// WhatsApp lead atıf döngüsü — /admin/analiz üst bölümü. Her WhatsApp tıklaması (Telegram'daki
// WA-XXXX ref'iyle) listelenir; Murat sonucu + müşterinin söylediği kaynağı işaretler.
// Böylece "hangi sayfa/kaynak → satış" gerçek parayla ölçülür, tıklamayla değil.
// Veri: GET/POST /api/admin/wa-leads (admin cookie).

import { useCallback, useEffect, useState } from "react";

type Outcome = "sold" | "not_sold" | "no_reply" | "spam";
interface Lead {
  ref: string; ts: string; path: string | null; locale: string | null; country: string | null; device: string | null;
  product: string | null; ref_host: string | null; outcome: Outcome | null; source: string | null; amount_eur: number | null; note: string | null;
}
interface Data {
  leads: Lead[];
  by_outcome: Record<string, number>;
  by_source: { source: string; leads: number; sold: number; revenue: number }[];
  by_product: { product: string; leads: number; sold: number }[];
}

const OUTCOME_LABEL: Record<Outcome, string> = { sold: "Satıldı", not_sold: "Satılmadı", no_reply: "Cevap yok", spam: "Spam" };
const SOURCES = ["Google", "ChatGPT / AI", "Instagram", "TikTok", "Tavsiye", "Otel / acente", "Diğer"];

function Row({ lead, onSave }: { lead: Lead; onSave: (ref: string, body: Record<string, unknown>) => Promise<void> }) {
  const [outcome, setOutcome] = useState<Outcome | "">(lead.outcome ?? "");
  const [source, setSource] = useState(lead.source ?? "");
  const [amount, setAmount] = useState(lead.amount_eur?.toString() ?? "");
  const [note, setNote] = useState(lead.note ?? "");
  const [busy, setBusy] = useState(false);
  const dirty = outcome !== (lead.outcome ?? "") || source !== (lead.source ?? "") || amount !== (lead.amount_eur?.toString() ?? "") || note !== (lead.note ?? "");
  const when = new Date(lead.ts).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <tr className={`border-t border-slate-100 ${lead.outcome === "sold" ? "bg-emerald-50/40" : ""}`}>
      <td className="px-3 py-2 font-mono text-xs">{lead.ref}<div className="text-[10px] text-slate-400">{when}</div></td>
      <td className="px-3 py-2 text-xs max-w-[260px] truncate" title={lead.path ?? ""}>{lead.product ?? lead.path ?? "–"}<div className="text-[10px] text-slate-400">{[lead.locale, lead.country, lead.device].filter(Boolean).join(" · ")}{lead.ref_host ? ` · ${lead.ref_host}` : ""}</div></td>
      <td className="px-3 py-2">
        <select value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome | "")} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
          <option value="">— seç —</option>
          {(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => <option key={o} value={o}>{OUTCOME_LABEL[o]}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input list="wa-sources" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Nereden buldu?" className="w-36 rounded-md border border-slate-300 px-2 py-1 text-sm" />
      </td>
      <td className="px-3 py-2"><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="€" inputMode="decimal" className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm" /></td>
      <td className="px-3 py-2"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="not" className="w-40 rounded-md border border-slate-300 px-2 py-1 text-sm" /></td>
      <td className="px-3 py-2">
        <button
          disabled={!dirty || !outcome || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(lead.ref, { outcome, source: source || null, amountEur: amount ? Number(amount.replace(",", ".")) : null, note: note || null });
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-md bg-primary px-3 py-1 text-sm font-semibold text-white disabled:opacity-40"
        >
          {busy ? "…" : "Kaydet"}
        </button>
      </td>
    </tr>
  );
}

export function WaLeads({ days }: { days: number }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await fetch(`/api/admin/wa-leads?days=${Math.max(days, 30)}`, { credentials: "same-origin", cache: "no-store" });
      const j = (await r.json()) as { data?: Data; error?: string };
      if (!r.ok || !j.data) throw new Error(j.error ?? `HTTP ${r.status}`);
      setData(j.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata");
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (ref: string, body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/wa-leads", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, ...body }),
    });
    if (!r.ok) {
      setError(`Kaydedilemedi (${r.status})`);
      return;
    }
    await load();
  };

  const bo = data?.by_outcome ?? {};
  const total = data?.leads.length ?? 0;
  const sold = bo.sold ?? 0;
  const open = bo.open ?? 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="font-bold text-slate-900">WhatsApp lead'leri → satış</h2>
          <p className="mt-0.5 text-xs text-slate-500">Her WhatsApp tıklaması (Telegram'daki WA-ref). Murat: sonucu ve müşterinin söylediği kaynağı işaretle — atıf buradan çıkar.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="rounded-lg bg-slate-100 px-3 py-1">{total} lead</span>
          <span className="rounded-lg bg-emerald-100 px-3 py-1 text-emerald-800">{sold} satış</span>
          <span className="rounded-lg bg-amber-100 px-3 py-1 text-amber-800">{open} işaretsiz</span>
        </div>
      </header>
      {error && <p className="px-4 py-2 text-sm text-red-700">{error}</p>}
      {data && data.by_source.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3 text-xs">
          {data.by_source.map((s) => (
            <span key={s.source} className="rounded-full border border-slate-200 px-2.5 py-1">
              <strong>{s.source}</strong>: {s.leads} lead · {s.sold} satış{s.revenue ? ` · €${Math.round(s.revenue)}` : ""}
            </span>
          ))}
        </div>
      )}
      <datalist id="wa-sources">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
      {!data || data.leads.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">Henüz WhatsApp lead'i yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Ref</th><th className="px-3 py-2">Ürün / sayfa</th><th className="px-3 py-2">Sonuç</th><th className="px-3 py-2">Kaynak</th><th className="px-3 py-2">Tutar</th><th className="px-3 py-2">Not</th><th className="px-3 py-2" /></tr>
            </thead>
            <tbody>{data.leads.map((l) => <Row key={l.ref} lead={l} onSave={save} />)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
