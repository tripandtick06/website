// /api/admin/telegram-test — Telegram lead kanalini canlida dogrulama.
//
// Callers: manuel curl (x-admin-token ADMIN_API_TOKEN).
//   curl -X POST https://tripandtick.com/api/admin/telegram-test -H "x-admin-token: $ADMIN_API_TOKEN"
// GET: yapilandirma durumu (token var mi, kac chat id, getMe). Mesaj gondermez.
// POST: her chat id'ye test mesaji gonderir; sonuc {sent, failed, errors}.
// Auth: refund/reschedule ile ayni x-admin-token deseni.

import { NextResponse, type NextRequest } from "next/server";
import { notifyLead, telegramChatIds, telegramEnabled, telegramPing } from "@/lib/telegram";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected) return false;
  const tok = req.headers.get("x-admin-token")?.trim();
  return Boolean(tok) && tok === expected;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const ping = await telegramPing();
  return NextResponse.json({
    enabled: telegramEnabled(),
    chatIds: telegramChatIds().length,
    botPing: ping,
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!telegramEnabled()) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_IDS eksik", chatIds: telegramChatIds().length },
      { status: 503 }
    );
  }
  const result = await notifyLead({
    source: "test",
    title: "Telegram test — tripandtick.com lead kanalı",
    fields: [
      ["Durum", "Bu mesajı görüyorsan kanal çalışıyor"],
      ["Chat sayısı", telegramChatIds().length],
    ],
    note: "Gerçek lead'ler: iletişim formu, rezervasyon, otel talebi, B2B başvurusu.",
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
