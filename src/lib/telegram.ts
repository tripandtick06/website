// Telegram lead bildirimi — edge-runtime safe (fetch only).
//
// Importers (callers):
//   - src/app/api/contact/route.ts        (iletisim formu)
//   - src/app/api/booking/route.ts        (yeni rezervasyon — admin tarafi)
//   - src/app/api/hotel-inquiry/route.ts  (otel bilgi talebi)
//   - src/app/api/b2b/apply/route.ts      (B2B acente basvurusu)
//   - src/app/api/admin/telegram-test/route.ts (manuel dogrulama)
//   - src/app/api/health/route.ts         (getMe ping)
// Env: TELEGRAM_BOT_TOKEN (BotFather), TELEGRAM_CHAT_IDS (virgulle ayrilmis chat id listesi;
//      ornek "123456789,-1001234567890" — Murat + owner + istege bagli grup).
// Demo fallback: env yoksa stdout log + result.demoLogged=true. Hicbir zaman throw ETMEZ —
// lead akisi Telegram kapali/bozuk olsa da 200 doner.

export type LeadSource = "contact" | "booking" | "hotel" | "b2b" | "test";

export type LeadField = [label: string, value: string | number | null | undefined];

export interface LeadNotification {
  source: LeadSource;
  title: string;
  fields: LeadField[];
  note?: string;
}

export interface TelegramSendResult {
  ok: boolean;
  sent: number;
  failed: number;
  demoLogged?: boolean;
  errors?: string[];
}

const TELEGRAM_MAX_LEN = 4096;
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;
const REQUEST_TIMEOUT_MS = 8000;

const SOURCE_EMOJI: Record<LeadSource, string> = {
  contact: "✉️",
  booking: "🎈",
  hotel: "🏨",
  b2b: "🤝",
  test: "🧪",
};

function botToken(): string | undefined {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return t ? t : undefined;
}

export function telegramChatIds(): string[] {
  const raw = process.env.TELEGRAM_CHAT_IDS ?? "";
  return raw
    .split(/[,\s;]+/)
    .map((s) => s.trim())
    .filter((s) => /^-?\d+$/.test(s));
}

export function telegramEnabled(): boolean {
  return Boolean(botToken()) && telegramChatIds().length > 0;
}

export function escapeTelegramHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isBlank(v: LeadField[1]): boolean {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

export function formatLeadMessage(n: LeadNotification): string {
  const lines: string[] = [];
  lines.push(`${SOURCE_EMOJI[n.source]} <b>${escapeTelegramHtml(n.title)}</b>`);
  lines.push("");
  for (const [label, value] of n.fields) {
    if (isBlank(value)) continue;
    lines.push(`<b>${escapeTelegramHtml(label)}:</b> ${escapeTelegramHtml(String(value))}`);
  }
  if (n.note && n.note.trim()) {
    lines.push("");
    lines.push(`<i>${escapeTelegramHtml(n.note.trim())}</i>`);
  }
  lines.push("");
  lines.push(`<code>tripandtick.com · ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC</code>`);
  const text = lines.join("\n");
  if (text.length <= TELEGRAM_MAX_LEN) return text;
  return text.slice(0, TELEGRAM_MAX_LEN - 3) + "...";
}

function isRetryable(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function timeoutSignal(): AbortSignal | undefined {
  const ac = typeof AbortSignal !== "undefined" ? AbortSignal : undefined;
  if (ac && typeof ac.timeout === "function") return ac.timeout(REQUEST_TIMEOUT_MS);
  return undefined;
}

async function sendToChat(token: string, chatId: string, text: string): Promise<string | null> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  let lastError = "Bilinmeyen hata";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: timeoutSignal(),
      });
      if (res.ok) return null;
      const payload = (await res.json().catch(() => ({}))) as {
        description?: string;
        parameters?: { retry_after?: number };
      };
      lastError = `HTTP ${res.status} ${payload.description ?? ""}`.trim();
      console.error("[lib/telegram] gonderim hata", chatId, lastError);
      if (!isRetryable(res.status) || attempt === MAX_ATTEMPTS) break;
      const retryAfter = payload.parameters?.retry_after;
      await sleep(retryAfter && retryAfter > 0 ? retryAfter * 1000 : BASE_DELAY_MS * 2 ** (attempt - 1));
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Bilinmeyen hata";
      console.error("[lib/telegram] fetch error", chatId, lastError);
      if (attempt === MAX_ATTEMPTS) break;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }
  return lastError;
}

export async function sendTelegramText(text: string): Promise<TelegramSendResult> {
  const token = botToken();
  const chatIds = telegramChatIds();
  if (!token || chatIds.length === 0) {
    console.info("[lib/telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_IDS yok — demo log", {
      preview: text.slice(0, 120),
    });
    return { ok: false, sent: 0, failed: 0, demoLogged: true };
  }
  const outcomes = await Promise.all(chatIds.map((id) => sendToChat(token, id, text)));
  const errors = outcomes.filter((e): e is string => e !== null);
  const sent = outcomes.length - errors.length;
  return {
    ok: sent > 0,
    sent,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function notifyLead(n: LeadNotification): Promise<TelegramSendResult> {
  try {
    return await sendTelegramText(formatLeadMessage(n));
  } catch (err) {
    // Savunma: hicbir yol throw etmemeli, ama olursa lead akisini bozma.
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[lib/telegram] notifyLead beklenmedik hata", msg);
    return { ok: false, sent: 0, failed: 1, errors: [msg] };
  }
}

// Health ping: bot token gecerli mi (getMe). Chat id dogrulamaz.
export async function telegramPing(): Promise<"ok" | "fail" | "disabled"> {
  const token = botToken();
  if (!token) return "disabled";
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: "GET",
      signal: timeoutSignal(),
    });
    return res.ok ? "ok" : "fail";
  } catch {
    return "fail";
  }
}
