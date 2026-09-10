// Lead kalicilik — form gonderimleri Supabase `leads` tablosuna yazilir.
// Telegram/Brevo dussede kayit kaybolmasin diye (sessiz kayip = en pahali hata).
//
// Importers (callers):
//   - src/app/api/contact/route.ts
//   - src/app/api/hotel-inquiry/route.ts
//   - src/app/api/b2b/apply/route.ts
// (booking zaten `bookings` tablosuna yaziyor — burada tekrar yazilmaz.)
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Yoksa no-op (false doner).
// Tablo: supabase/migrations/0005_leads.sql. Tablo yoksa PostgREST 404 -> log, throw yok.

import type { LeadSource } from "./telegram";

export interface LeadRecord {
  source: Exclude<LeadSource, "test">;
  ref: string;
  name: string;
  email: string;
  phone?: string | null;
  payload: Record<string, unknown>;
  telegramOk: boolean;
  emailOk: boolean;
}

export async function persistLead(lead: LeadRecord): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return false;
  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        source: lead.source,
        ref: lead.ref,
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        payload: lead.payload,
        telegram_ok: lead.telegramOk,
        email_ok: lead.emailOk,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[lib/leads] insert hata", res.status, txt.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lib/leads] insert fetch error (non-fatal)", err);
    return false;
  }
}
