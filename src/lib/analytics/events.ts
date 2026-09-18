// Davranış ölçümü — sunucu tarafı ortak katman (şema, bot eleme, cihaz, ziyaretçi hash'i,
// analytics DB'ye token'lı RPC yazımı/okuması). Cookie/PII YOK.
//
// Importers:
//   - src/app/api/event/route.ts          (beacon → validate → enrich → analytics_ingest)
//   - src/app/api/admin/analytics/route.ts (analytics_summary_auth / analytics_prune_auth)
//   - tests/api/event.test.ts, tests/lib/analytics-tracker.test.ts
//
// DB: AYRI analytics projesi (ozmetzxcdhsqskprmbhu) — işlem DB'si (ngygbm…) DEĞİL.
// Env: ANALYTICS_SUPABASE_URL, ANALYTICS_SUPABASE_ANON_KEY, ANALYTICS_TOKEN (CF Pages).
// Anon key yalnız security-definer RPC'leri çağırabilir; her çağrı ANALYTICS_TOKEN ister
// (supabase/migrations/0006_events.sql). Env yoksa no-op (false/null) — leads.ts ile aynı
// "sessiz kayıp = log, throw yok" ilkesi.

import { z } from "zod";

export const EVENT_NAMES = ["page_view", "page_exit", "click", "booking_step", "search", "form_submit", "error"] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export const MAX_BATCH = 25;

const propsSchema = z.record(z.string(), z.union([z.string().max(300), z.number(), z.boolean(), z.null()])).default({});

export const clientEventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  path: z.string().min(1).max(400),
  sid: z.string().regex(/^[a-z0-9]{8,32}$/),
  seq: z.number().int().min(1).max(10000),
  locale: z.string().max(10).optional(),
  ref_host: z.string().max(200).optional().nullable(),
  product: z.string().max(80).optional().nullable(),
  props: propsSchema,
});
export type ClientEvent = z.infer<typeof clientEventSchema>;

export const batchSchema = z.object({
  events: z.array(clientEventSchema).min(1).max(MAX_BATCH),
  _hp: z.string().optional(),
});

// whatsapp-click ile aynı liste + AI/SEO tarayıcıları. SG/CN datacenter trafiği
// (CF Web Analytics'te görülen) çoğunlukla bu UA'larla gelir.
export const BOT_UA_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|fetch|curl|wget|python-requests|httpclient|scrapy|phantom|selenium|puppeteer|playwright|gptbot|claudebot|anthropic|bingpreview|facebookexternalhit|semrush|ahrefs|mj12|dataforseo|petalbot|yandex/i;

export function isBotUA(ua: string): boolean {
  return !ua || BOT_UA_RE.test(ua);
}

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

// Sadece site-içi path (query/hash yok, tek "/" ile başlar). whatsapp.ts sanitizeSitePath
// ile aynı kural — burada tekrar edilir ki bu modül edge'de tek başına yaşayabilsin.
export function cleanPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  const p = path.split(/[?#]/)[0];
  if (!/^\/[A-Za-z0-9\-._~/%]*$/.test(p)) return "/";
  return p.length > 400 ? p.slice(0, 400) : p;
}

// Günlük dönen ziyaretçi hash'i: IP+UA+gün+tuz → sha256 ilk 16 hex. IP saklanmaz;
// ertesi gün aynı kişi farklı hash → uzun süreli izleme yok, gün içi "aynı ziyaretçi" var.
export async function visitorHash(ip: string, ua: string, salt: string, now = new Date()): Promise<string> {
  const day = now.toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${salt}|${ip}|${ua}|${day}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface EventRow {
  sid: string;
  seq: number;
  vhash: string | null;
  name: EventName;
  path: string;
  locale: string | null;
  ref_host: string | null;
  country: string | null;
  device: string;
  product: string | null;
  props: Record<string, unknown>;
}

export interface AnalyticsEnv {
  url?: string;
  anonKey?: string;
  token?: string;
}

function envOf(env?: AnalyticsEnv): { url: string; key: string; token: string } | null {
  const url = (env?.url ?? process.env.ANALYTICS_SUPABASE_URL)?.trim();
  const key = (env?.anonKey ?? process.env.ANALYTICS_SUPABASE_ANON_KEY)?.trim();
  const token = (env?.token ?? process.env.ANALYTICS_TOKEN)?.trim();
  if (!url || !key || !token || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url.replace(/\/$/, ""))) return null;
  return { url: url.replace(/\/$/, ""), key, token };
}

async function rpc(cfg: { url: string; key: string }, fn: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/** Toplu yazım → analytics_ingest(p_token, p_rows). Yapılandırma yoksa/hata → false. */
export async function insertEvents(rows: EventRow[], env?: AnalyticsEnv): Promise<boolean> {
  const cfg = envOf(env);
  if (!cfg || rows.length === 0) return false;
  try {
    const res = await rpc(cfg, "analytics_ingest", { p_token: cfg.token, p_rows: rows });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[analytics] ingest hata", res.status, txt.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[analytics] ingest fetch error (non-fatal)", err);
    return false;
  }
}

/** Özet → analytics_summary_auth(p_token, p_days). Yapılandırma yoksa null; hata throw. */
export async function analyticsSummary(days: number, env?: AnalyticsEnv): Promise<unknown | null> {
  const cfg = envOf(env);
  if (!cfg) return null;
  const res = await rpc(cfg, "analytics_summary_auth", { p_token: cfg.token, p_days: days });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`analytics_summary ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

export async function analyticsPrune(env?: AnalyticsEnv): Promise<void> {
  const cfg = envOf(env);
  if (!cfg) return;
  await rpc(cfg, "analytics_prune_auth", { p_token: cfg.token, p_keep_days: 90 }).catch(() => {});
}
