// Brevo (Sendinblue) shared sender — edge-runtime safe via fetch.
//
// Importers (callers):
//   - src/app/api/admin/reschedule/route.ts (Q3 Balon borsasi — bulk send)
//   - src/app/api/rezervasyon/yeniden-tarih/route.ts (customer confirm)
//   - src/app/api/hotel-inquiry/route.ts (opsiyonel refactor — su an inline)
// Env: BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME, BREVO_TO_EMAIL.
// Demo fallback: API key yoksa stdout log + result.demoLogged=true.

export interface BrevoAddress {
  email: string;
  name?: string;
}

export interface BrevoSendInput {
  to: BrevoAddress;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: BrevoAddress;
  bcc?: BrevoAddress[];
  tags?: string[];
  // RFC 8058 one-click List-Unsubscribe. Marketing/bulk send icin gerekli
  // (Gmail/Yahoo Feb 2024 sender requirements). Transactional muaf.
  unsubscribe?: { url: string };
}

export interface BrevoSendResult {
  ok: boolean;
  messageId?: string;
  status?: number;
  error?: string;
  demoLogged?: boolean;
}

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "hello@tripandtick.com";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "Trip and Tick";
const BREVO_ADMIN_EMAIL = process.env.BREVO_TO_EMAIL ?? "hello@tripandtick.com";

export function brevoEnabled(): boolean {
  return Boolean(BREVO_API_KEY);
}

export function brevoAdminAddress(): BrevoAddress {
  return { email: BREVO_ADMIN_EMAIL, name: BREVO_FROM_NAME };
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 250;

function isRetryable(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

function parseRetryAfter(h: string | null): number | null {
  if (!h) return null;
  const s = parseInt(h, 10);
  if (Number.isFinite(s) && s >= 0) return s * 1000;
  const dt = new Date(h).getTime();
  if (Number.isFinite(dt)) return Math.max(0, dt - Date.now());
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function postToDeadLetter(input: BrevoSendInput, lastError: string, status?: number): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;
  try {
    await fetch(`${url}/rest/v1/email_dead_letter`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        to_email: input.to.email,
        subject: input.subject,
        tags: input.tags ?? [],
        last_status: status ?? null,
        last_error: lastError.slice(0, 2000),
        payload: {
          to: input.to,
          subject: input.subject,
          tags: input.tags,
          unsubscribe: input.unsubscribe,
        },
      }),
    });
  } catch (err) {
    console.error("[lib/brevo] DLQ insert failed (non-fatal)", err);
  }
}

export async function sendBrevoEmail(input: BrevoSendInput): Promise<BrevoSendResult> {
  if (!BREVO_API_KEY) {
    console.info("[lib/brevo] BREVO_API_KEY yok — demo log", {
      to: input.to.email,
      subject: input.subject,
      tags: input.tags,
    });
    return { ok: false, demoLogged: true };
  }

  const payload: Record<string, unknown> = {
    sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
    to: [input.to],
    subject: input.subject,
    htmlContent: input.htmlContent,
  };
  if (input.textContent) payload.textContent = input.textContent;
  if (input.replyTo) payload.replyTo = input.replyTo;
  if (input.bcc && input.bcc.length > 0) payload.bcc = input.bcc;
  if (input.tags && input.tags.length > 0) payload.tags = input.tags;
  if (input.unsubscribe?.url) {
    payload.headers = {
      "List-Unsubscribe": `<${input.unsubscribe.url}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }
  const body = JSON.stringify(payload);

  let lastStatus: number | undefined;
  let lastError = "Bilinmeyen hata";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { messageId?: string };
        return { ok: true, status: res.status, messageId: data.messageId };
      }
      lastStatus = res.status;
      lastError = await res.text().catch(() => `HTTP ${res.status}`);
      console.error("[lib/brevo] gonderim hata", res.status, lastError.slice(0, 200));
      if (!isRetryable(res.status) || attempt === MAX_ATTEMPTS) break;
      const retryAfter = parseRetryAfter(res.headers.get("Retry-After"));
      await sleep(retryAfter ?? BASE_DELAY_MS * 2 ** (attempt - 1));
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Bilinmeyen hata";
      console.error("[lib/brevo] fetch error", lastError);
      if (attempt === MAX_ATTEMPTS) break;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  await postToDeadLetter(input, lastError, lastStatus);
  return { ok: false, status: lastStatus, error: lastError };
}

export async function sendBrevoBatch(inputs: BrevoSendInput[]): Promise<{
  total: number;
  sent: number;
  failed: number;
  demoLogged: number;
  results: BrevoSendResult[];
}> {
  const results: BrevoSendResult[] = [];
  for (const inp of inputs) {
    const r = await sendBrevoEmail(inp);
    results.push(r);
  }
  return {
    total: inputs.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok && !r.demoLogged).length,
    demoLogged: results.filter((r) => r.demoLogged).length,
    results,
  };
}
