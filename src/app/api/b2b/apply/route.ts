// B2B acente basvuru endpoint — public POST, Brevo mail tetigi.
//
// Importers (client fetch):
//   - src/components/b2b/B2BApplyForm.tsx (POST line ~63)
// Auto-route /api/b2b/apply.
// Affected: B2B aday acente lead capture.
// Data: POST body {name, email, phone, company, license, country, _hp?}.
//        Response: {data: {applicationId, status: "pending"}, error: null}.
//        applicationId format: B2B-APP-{base36 ms}.
//        Brevo admin mail aynen /api/contact pattern ile.
// User verbatim: "POST {name, email, phone, company, license, country};
// Brevo admin mail tetigi; Response: {applicationId, status: 'pending'}."

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const applySchema = z.object({
  name: z.string().min(2, "Ad zorunlu").max(100),
  email: z.string().email("Gecerli e-posta girin"),
  phone: z.string().min(5, "Telefon zorunlu").max(40),
  company: z.string().min(2, "Sirket adi zorunlu").max(200),
  license: z.string().min(2, "Lisans no zorunlu").max(80),
  country: z.string().min(2, "Ulke zorunlu").max(60),
  _hp: z.string().optional(),
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "hello@tripandtick.com";
const BREVO_TO_EMAIL = process.env.BREVO_TO_EMAIL ?? "hello@tripandtick.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Gecersiz JSON" },
      { status: 400 }
    );
  }

  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Gecersiz form verisi", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot
  if (parsed.data._hp && parsed.data._hp.trim().length > 0) {
    console.warn("[api/b2b/apply] Honeypot tetiklendi — bot reddedildi");
    // Sessizce success don, bot'a sinyal verme
    const applicationId = `B2B-APP-${Date.now().toString(36).toUpperCase()}`;
    return NextResponse.json({
      data: { applicationId, status: "pending" },
      error: null,
    });
  }

  const { name, email, phone, company, license, country } = parsed.data;
  const applicationId = `B2B-APP-${Date.now().toString(36).toUpperCase()}`;

  if (BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: BREVO_FROM_EMAIL, name: "Trip and Tick B2B Basvuru" },
          to: [{ email: BREVO_TO_EMAIL, name: "Trip and Tick" }],
          replyTo: { email, name },
          subject: `[B2B Basvuru] ${company} — ${country}`,
          htmlContent: `
            <h2>Yeni B2B acente basvurusu</h2>
            <p><b>Referans:</b> ${escapeHtml(applicationId)}</p>
            <hr>
            <p><b>Sirket:</b> ${escapeHtml(company)}</p>
            <p><b>Yetkili:</b> ${escapeHtml(name)}</p>
            <p><b>E-posta:</b> ${escapeHtml(email)}</p>
            <p><b>Telefon:</b> ${escapeHtml(phone)}</p>
            <p><b>Ulke:</b> ${escapeHtml(country)}</p>
            <p><b>Lisans No:</b> ${escapeHtml(license)}</p>
            <hr>
            <p style="font-size:12px;color:#64748b">24 saat icinde geri donus yapilmalidir.</p>
          `,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("[api/b2b/apply] Brevo gonderim hatasi", res.status, errText);
      }
    } catch (err) {
      console.error("[api/b2b/apply] Brevo fetch error", err);
    }
  } else {
    console.info(
      "[api/b2b/apply] BREVO_API_KEY yok — sadece log",
      JSON.stringify({ applicationId, name, email, phone, company, license, country })
    );
  }

  return NextResponse.json({
    data: { applicationId, status: "pending" },
    error: null,
  });
}
