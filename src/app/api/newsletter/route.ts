// POST /api/newsletter — Brevo Contacts API integration for newsletter signups.
//
// Importers: src/components/marketing/NewsletterForm.tsx (client fetch).
// Affected: lead capture pipeline for Trip and Tick email marketing (Faz 1).
// Data:
//   Request:  { email, locale, source?, _hp? }
//   Response: { ok: boolean, error?: string }
// Env:
//   - BREVO_API_KEY        Brevo v3 API key
//   - BREVO_LIST_ID        Brevo list id for newsletter subscribers (default 2)
//   - BREVO_FROM_EMAIL     Sender (welcome mail)
//   - BREVO_FROM_NAME      Sender display
//   - BREVO_WELCOME_TEMPLATE_ID  optional Brevo transactional template id
// User verbatim: "Body Zod {email, locale, source?}, Brevo Contacts API
// POST /v3/contacts, Hata 400 (already exists) → success treat, Welcome
// mail tetigi (Brevo transactional template veya ad-hoc), Honeypot _hp,
// Brevo yoksa fallback log."

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/email-templates";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z.string().email().max(200),
  locale: z.string().min(2).max(8).default("tr"),
  source: z.string().max(60).optional(),
  _hp: z.string().max(200).optional(),
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID
  ? parseInt(process.env.BREVO_LIST_ID, 10)
  : 2;
const BREVO_FROM_EMAIL =
  process.env.BREVO_FROM_EMAIL ?? "noreply@tripandtick.com";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "Trip and Tick";
const BREVO_WELCOME_TEMPLATE_ID = process.env.BREVO_WELCOME_TEMPLATE_ID
  ? parseInt(process.env.BREVO_WELCOME_TEMPLATE_ID, 10)
  : undefined;

interface BrevoContactPayload {
  email: string;
  listIds: number[];
  attributes?: Record<string, string>;
  updateEnabled?: boolean;
}

async function brevoCreateContact(payload: BrevoContactPayload): Promise<{
  ok: boolean;
  status: number;
  alreadyExists?: boolean;
  error?: string;
}> {
  if (!BREVO_API_KEY) {
    return { ok: false, status: 0, error: "BREVO_API_KEY missing" };
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 201 || res.status === 204) {
      return { ok: true, status: res.status };
    }
    // Brevo returns 400 with code "duplicate_parameter" when contact exists.
    if (res.status === 400) {
      const text = await res.text().catch(() => "");
      if (/already|exist|duplicate/i.test(text)) {
        return { ok: true, status: res.status, alreadyExists: true };
      }
      return { ok: false, status: res.status, error: text };
    }
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, error: text };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function brevoSendWelcomeEmail(
  email: string,
  locale: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!BREVO_API_KEY) {
    console.info(
      "[api/newsletter] BREVO_API_KEY yok — welcome mail loglandi",
      JSON.stringify({ email, locale })
    );
    return { ok: false, error: "BREVO_API_KEY missing" };
  }
  try {
    // Prefer transactional template if configured.
    const body =
      BREVO_WELCOME_TEMPLATE_ID !== undefined
        ? {
            sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
            to: [{ email }],
            templateId: BREVO_WELCOME_TEMPLATE_ID,
            params: { locale, year: new Date().getFullYear() },
            tags: ["newsletter", "welcome"],
          }
        : {
            sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
            to: [{ email }],
            subject: "Trip and Tick'e Hoş Geldiniz — %5 indirim kodunuz",
            htmlContent: welcomeEmailHtml({ email, locale }),
            textContent: welcomeEmailText({ email, locale }),
            tags: ["newsletter", "welcome"],
          };
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        "[api/newsletter] Brevo welcome mail hatasi",
        res.status,
        text
      );
      return { ok: false, status: res.status, error: text };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error("[api/newsletter] Brevo welcome mail fetch error", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Geçersiz form verisi" },
        { status: 400 }
      );
    }
    const { email, locale, source, _hp } = parsed.data;

    // Honeypot — silently succeed.
    if (_hp && _hp.trim().length > 0) {
      return NextResponse.json({ ok: true, bot: true });
    }

    if (!BREVO_API_KEY) {
      console.info(
        "[api/newsletter] BREVO_API_KEY yok — subscribe loglandi",
        JSON.stringify({ email, locale, source })
      );
      // Fail-soft: pretend success so UX is unbroken in dev / staging.
      return NextResponse.json({ ok: true, brevo: "disabled" });
    }

    const contactRes = await brevoCreateContact({
      email,
      listIds: [BREVO_LIST_ID],
      attributes: {
        LOCALE: locale,
        SOURCE: source ?? "site",
        SIGNUP_AT: new Date().toISOString(),
      },
      updateEnabled: true,
    });

    if (!contactRes.ok) {
      console.error(
        "[api/newsletter] Brevo contact create failed",
        contactRes.status,
        contactRes.error
      );
      return NextResponse.json(
        { ok: false, error: "Kayıt oluşturulamadı, tekrar deneyin." },
        { status: 500 }
      );
    }

    // Only send welcome mail for newly-created contacts.
    if (!contactRes.alreadyExists) {
      // Fire-and-forget — don't block the response on mail send.
      brevoSendWelcomeEmail(email, locale).catch((err) =>
        console.error("[api/newsletter] welcome mail send error", err)
      );
    }

    return NextResponse.json({
      ok: true,
      alreadySubscribed: Boolean(contactRes.alreadyExists),
    });
  } catch (err) {
    console.error("[api/newsletter] unhandled", err);
    return NextResponse.json(
      { ok: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}
