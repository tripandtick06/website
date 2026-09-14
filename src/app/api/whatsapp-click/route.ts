import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { notifyLead } from "@/lib/telegram";
import { sitePageUrl, WHATSAPP_NUMBER_DISPLAY } from "@/lib/whatsapp";

// WhatsApp FAB tiklama bildirimi → Telegram (Murat + owner).
// Konusmanin kendisi Murat'in telefonunda kalir (wa.me); burasi sadece "biri WhatsApp'a
// gecti, su sayfadan, su dilde/ulkeden" sinyalini verir ki lead kacmasin.
// Caller: src/components/booking/WhatsAppFAB.tsx (navigator.sendBeacon, keepalive fetch).
// Rate-limit: src/middleware.ts (/api/whatsapp-click per-IP).

export const runtime = "edge";
export const dynamic = "force-dynamic";

const clickSchema = z.object({
  path: z.string().min(1).max(400),
  locale: z.string().max(10).optional(),
  _hp: z.string().optional(),
});

const BOT_UA_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|fetch|curl|wget|python-requests/i;

function firstAcceptLanguage(header: string | null): string | undefined {
  if (!header) return undefined;
  const first = header.split(",")[0]?.split(";")[0]?.trim();
  return first || undefined;
}

function deviceKind(ua: string): "mobil" | "masaüstü" {
  return /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobil" : "masaüstü";
}

function istanbulTime(d: Date): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  if (parsed.data._hp && parsed.data._hp.trim().length > 0) {
    console.warn("[api/whatsapp-click] Honeypot tetiklendi — bot trafigi reddedildi");
    return NextResponse.json({ ok: true });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_UA_RE.test(ua)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const ref = `WA-${Date.now().toString(36).toUpperCase()}`;
  const pageUrl = sitePageUrl(parsed.data.path);
  const country = req.headers.get("cf-ipcountry") ?? undefined;
  const browserLang = firstAcceptLanguage(req.headers.get("accept-language"));

  const telegram = await notifyLead({
    source: "whatsapp",
    title: "WhatsApp'a tıklandı — müşteri Murat'a yazıyor",
    fields: [
      ["Ref", ref],
      ["Sayfa", pageUrl],
      ["Site dili", parsed.data.locale],
      ["Tarayıcı dili", browserLang],
      ["Ülke", country],
      ["Cihaz", deviceKind(ua)],
      ["Saat (TR)", istanbulTime(new Date())],
    ],
    note:
      `Mesaj WhatsApp ${WHATSAPP_NUMBER_DISPLAY} numarasına düşer, Telegram'da GÖRÜNMEZ. ` +
      "Murat: WhatsApp'ı kontrol et, müşteri sohbet başlattı.",
  });

  if (!telegram.ok) {
    console.info("[api/whatsapp-click] Telegram iletilemedi", ref, JSON.stringify(telegram.errors ?? []));
  }

  return NextResponse.json({ ok: true, ref, notified: { telegram: telegram.ok } });
}
