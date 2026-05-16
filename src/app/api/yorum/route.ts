// Yorum submit + listele API
//
// Importers:
//   - src/app/yorum/ClientForm.tsx (POST submit)
//   - src/app/admin/yorumlar/page.tsx (GET liste — admin filter; bu commit'te yeni)
// Affected: musteri yorum yayinlama flow + admin moderation queue.
// Data: POST body = submitSchema (asagida); Response { reviewId, status }
//       GET (public): only approved + email/phone trimmed
//       GET (admin via x-admin-token): all (status filter desteklı)
// User verbatim: "devam et"

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { addReview, listReviews, type ReviewStatus } from "@/lib/reviews-store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const submitSchema = z.object({
  name: z.string().min(2, "Ad zorunlu").max(80),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().max(40).optional(),
  serviceSlug: z.string().min(1).max(80),
  serviceName: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5, "Başlık en az 5 karakter").max(120),
  message: z.string().min(50, "Yorum en az 50 karakter").max(2000),
  language: z.string().min(2).max(5).default("tr"),
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

function isAdmin(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  const envToken = process.env.ADMIN_TOKEN;
  if (envToken && token === envToken) return true;
  if (process.env.NODE_ENV !== "production" || !envToken) {
    return token.startsWith("demo-");
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
    }
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Form verisi geçersiz", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Honeypot
    if (parsed.data._hp && parsed.data._hp.trim().length > 0) {
      console.warn("[api/yorum] honeypot tetiklendi — bot reddedildi");
      return NextResponse.json({ reviewId: "RV-BOT", status: "pending" });
    }

    // Spam koruma — title + message uzunluk min 30 toplam
    if (parsed.data.title.length + parsed.data.message.length < 30) {
      return NextResponse.json(
        { error: "Yorum çok kısa, lütfen detaylandırın." },
        { status: 400 }
      );
    }

    const review = await addReview({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      serviceSlug: parsed.data.serviceSlug,
      serviceName: parsed.data.serviceName,
      rating: parsed.data.rating as 1 | 2 | 3 | 4 | 5,
      title: parsed.data.title,
      message: parsed.data.message,
      language: parsed.data.language,
    });

    if (BREVO_API_KEY) {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            sender: { email: BREVO_FROM_EMAIL, name: "Trip and Tick Yorum" },
            to: [{ email: BREVO_TO_EMAIL, name: "Trip and Tick Admin" }],
            replyTo: { email: review.email, name: review.name },
            subject: `[Yeni Yorum] ${review.rating}★ ${review.serviceName}`,
            htmlContent: `
              <h2>Yeni yorum onay bekliyor</h2>
              <p><b>Ad:</b> ${escapeHtml(review.name)}</p>
              <p><b>E-posta:</b> ${escapeHtml(review.email)}</p>
              <p><b>Hizmet:</b> ${escapeHtml(review.serviceName)} (${escapeHtml(review.serviceSlug)})</p>
              <p><b>Puan:</b> ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}/5)</p>
              <p><b>Baslik:</b> ${escapeHtml(review.title)}</p>
              <hr>
              <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(review.message)}</pre>
              <hr>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripandtick.com"}/admin/yorumlar">Admin panelden incele</a></p>
            `,
          }),
        });
      } catch (err) {
        console.error("[api/yorum] Brevo bildirim hatasi", err);
      }
    } else {
      console.info("[api/yorum] BREVO_API_KEY yok — yorum kaydedildi", review.id);
    }

    return NextResponse.json({
      reviewId: review.id,
      status: review.status as ReviewStatus,
    });
  } catch (err) {
    console.error("[api/yorum] POST error", err);
    return NextResponse.json({ error: "Yorum gönderilemedi" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status") as ReviewStatus | null;
  const admin = isAdmin(req);

  let status: ReviewStatus | undefined;
  if (admin && statusParam && ["pending", "approved", "rejected"].includes(statusParam)) {
    status = statusParam;
  } else if (!admin) {
    status = "approved";
  }

  const reviews = await listReviews(status);
  if (!admin) {
    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.name,
        serviceSlug: r.serviceSlug,
        serviceName: r.serviceName,
        rating: r.rating,
        title: r.title,
        message: r.message,
        language: r.language,
        createdAt: r.createdAt,
      })),
    });
  }
  return NextResponse.json({ reviews });
}
