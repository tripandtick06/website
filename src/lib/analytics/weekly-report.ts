// Haftalık davranış raporu — analytics_summary + wa_leads → Telegram metni (HTML).
// Caller: src/app/api/cron/weekly-report/route.ts (GH Actions cron, Pazartesi 08:00 TR).
// Saf fonksiyon: test edilebilir; veri şekli 0006_events.sql analytics_summary / analytics_wa_list.

import { escapeTelegramHtml } from "@/lib/telegram";

type Row = Record<string, string | number | null>;
export interface SummaryLike {
  days: number;
  totals: Record<string, number | null>;
  entry_pages: Row[];
  exit_pages: Row[];
  pages: Row[];
  products: Row[];
  dims: { locale: Row[]; country: Row[]; device: Row[]; referrer: Row[] };
  searches: Row[];
}
export interface WaListLike {
  leads: Row[];
  by_outcome: Record<string, number>;
  by_source: { source: string; leads: number; sold: number; revenue: number }[];
}

const AI_HOSTS = /chatgpt|openai|perplexity|copilot|gemini|claude|anthropic|you\.com|phind|bing\.com\/chat/i;
const SEARCH_HOSTS = /google\.|bing\.|yandex|duckduckgo|yahoo|baidu|naver/i;
const SOCIAL_HOSTS = /instagram|facebook|tiktok|youtube|t\.co|twitter|x\.com|linkedin|pinterest|reddit/i;

function n(v: unknown): number {
  return typeof v === "number" ? v : Number(v ?? 0) || 0;
}
function pct(a: number, b: number): string {
  return b > 0 ? `${Math.round((a / b) * 100)}%` : "0%";
}
function short(path: unknown): string {
  const p = String(path ?? "/");
  return p.length > 42 ? p.slice(0, 40) + "…" : p;
}

export function classifyReferrers(referrer: Row[]): { search: number; ai: number; social: number; direct: number; other: number; aiHosts: string[] } {
  const out = { search: 0, ai: 0, social: 0, direct: 0, other: 0, aiHosts: [] as string[] };
  for (const r of referrer) {
    const key = String(r.key ?? "");
    const s = n(r.sessions);
    if (!key || key === "(direct)") out.direct += s;
    else if (AI_HOSTS.test(key)) {
      out.ai += s;
      out.aiHosts.push(`${key} ${s}`);
    } else if (SEARCH_HOSTS.test(key)) out.search += s;
    else if (SOCIAL_HOSTS.test(key)) out.social += s;
    else out.other += s;
  }
  return out;
}

export function buildWeeklyReport(summary: SummaryLike, wa: WaListLike | null, opts: { siteUrl?: string } = {}): string {
  const t = summary.totals;
  const sessions = n(t.sessions);
  const e = escapeTelegramHtml;
  const L: string[] = [];
  L.push(`📊 <b>tripandtick — haftalık davranış raporu</b> (son ${summary.days} gün)`);
  L.push("");
  L.push(`👥 Oturum <b>${sessions}</b> · sayfa ${n(t.pageviews)} · ort. ${n(t.avg_pageviews)} sayfa · hemen çıkma ${t.bounce_rate ?? "–"}% · ort. ${n(t.avg_session_seconds)} sn`);
  L.push(
    `🔻 Funnel: WhatsApp ${n(t.whatsapp_sessions)} (${pct(n(t.whatsapp_sessions), sessions)}) · rezervasyon tık ${n(t.reserve_sessions)} · 3+ adım ${n(t.booking_deep_sessions)} · tamamlanan ${n(t.booking_done_sessions)} · form ${n(t.form_sessions)}`,
  );

  const src = classifyReferrers(summary.dims.referrer);
  L.push("");
  L.push(`🧭 <b>Kaynak</b>: arama ${src.search} · AI ${src.ai} · sosyal ${src.social} · direct ${src.direct} · diğer ${src.other}`);
  if (src.aiHosts.length) L.push(`   🤖 AI: ${e(src.aiHosts.slice(0, 4).join(", "))}`);

  if (wa) {
    const bo = wa.by_outcome;
    const total = wa.leads.length;
    L.push("");
    L.push(`💬 <b>WhatsApp lead</b>: ${total} · satıldı ${bo.sold ?? 0} · satılmadı ${bo.not_sold ?? 0} · cevap yok ${bo.no_reply ?? 0} · spam ${bo.spam ?? 0} · <b>işaretsiz ${bo.open ?? 0}</b>`);
    if (wa.by_source.length) {
      L.push(`   Müşterinin söylediği kaynak: ${e(wa.by_source.slice(0, 5).map((s) => `${s.source} ${s.leads}/${s.sold}✓${s.revenue ? ` €${Math.round(s.revenue)}` : ""}`).join(" · "))}`);
    }
    if ((bo.open ?? 0) > 0) L.push(`   ⚠️ Murat: ${bo.open} lead işaretlenmedi → /admin/analiz`);
  }

  const entry = summary.entry_pages.slice(0, 5);
  if (entry.length) {
    L.push("");
    L.push("🚪 <b>Giriş sayfaları</b> (oturum · çıkma%)");
    for (const r of entry) L.push(`   ${e(short(r.path))} — ${n(r.sessions)} · ${r.bounce_rate ?? "–"}%`);
  }
  const exit = summary.exit_pages.slice(0, 5);
  if (exit.length) {
    L.push("");
    L.push("🚶 <b>Çıkış sayfaları</b> (çıkış · pay)");
    for (const r of exit) L.push(`   ${e(short(r.path))} — ${n(r.exits)} · ${r.share ?? "–"}%`);
  }
  const prods = summary.products.slice(0, 5);
  if (prods.length) {
    L.push("");
    L.push("🎈 <b>Ürünler</b> (görüntüleme · WA · rez.)");
    for (const r of prods) L.push(`   ${e(String(r.product))} — ${n(r.views)} · ${n(r.whatsapp)} · ${n(r.reserve)}`);
  }
  const weak = summary.pages
    .filter((r) => n(r.pageviews) >= 5 && r.avg_scroll !== null && n(r.avg_scroll) < 40)
    .slice(0, 3);
  if (weak.length) {
    L.push("");
    L.push("🔍 <b>Az kaydırılan sayfalar</b> (ilk ekran sorunu?)");
    for (const r of weak) L.push(`   ${e(short(r.path))} — ${n(r.pageviews)} görüntüleme · kaydırma ${n(r.avg_scroll)}%`);
  }
  if (summary.searches.length) {
    L.push("");
    L.push(`🔎 Site içi arama: ${e(summary.searches.slice(0, 5).map((s) => `${s.q} (${n(s.n)})`).join(", "))}`);
  }
  L.push("");
  L.push(`Panel: ${e((opts.siteUrl ?? "https://tripandtick.com") + "/admin/analiz")}`);
  return L.join("\n");
}
