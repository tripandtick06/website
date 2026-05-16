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

export async function sendBrevoEmail(input: BrevoSendInput): Promise<BrevoSendResult> {
  if (!BREVO_API_KEY) {
    console.info("[lib/brevo] BREVO_API_KEY yok — demo log", {
      to: input.to.email,
      subject: input.subject,
      tags: input.tags,
    });
    return { ok: false, demoLogged: true };
  }
  try {
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

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("[lib/brevo] gonderim hata", res.status, txt);
      return { ok: false, status: res.status, error: txt };
    }
    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { ok: true, status: res.status, messageId: data.messageId };
  } catch (err) {
    console.error("[lib/brevo] fetch error", err);
    return { ok: false, error: err instanceof Error ? err.message : "Bilinmeyen hata" };
  }
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
