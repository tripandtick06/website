import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().min(2, "Ad zorunlu").max(100),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().max(40).optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
  _hp: z.string().optional(),
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "hello@tripandtick.com";
const BREVO_TO_EMAIL = process.env.BREVO_TO_EMAIL ?? "hello@tripandtick.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz form verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data._hp && parsed.data._hp.trim().length > 0) {
      console.warn("[api/contact] Honeypot tetiklendi — bot trafigi reddedildi");
      return NextResponse.json({ success: true });
    }

    const { name, email, phone, subject, message } = parsed.data;

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
            sender: { email: BREVO_FROM_EMAIL, name: "Trip and Tick Iletisim Form" },
            to: [{ email: BREVO_TO_EMAIL, name: "Trip and Tick" }],
            replyTo: { email, name },
            subject: `[Iletisim] ${subject}`,
            htmlContent: `
              <h2>Yeni iletisim formu</h2>
              <p><b>Ad:</b> ${escapeHtml(name)}</p>
              <p><b>E-posta:</b> ${escapeHtml(email)}</p>
              <p><b>Telefon:</b> ${escapeHtml(phone ?? "—")}</p>
              <p><b>Konu:</b> ${escapeHtml(subject)}</p>
              <hr>
              <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
            `,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("[api/contact] Brevo gonderim hatasi", res.status, errText);
        }
      } catch (err) {
        console.error("[api/contact] Brevo fetch error", err);
      }
    } else {
      console.info("[api/contact] BREVO_API_KEY yok — sadece log", JSON.stringify({ name, email, phone, subject, message }));
    }

    return NextResponse.json({ success: true, message: "Mesajınız alındı. 24 saat içinde geri dönüş yapılacak." });
  } catch (err) {
    console.error("[api/contact] error", err);
    return NextResponse.json(
      { error: "Mesaj gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
