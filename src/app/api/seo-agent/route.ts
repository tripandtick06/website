// SEO Agent API Route — STUB (Cloudflare Pages edge runtime).
//
// fs.writeFile + fs/promises kullanimi Cloudflare Workers ephemeral
// filesystem'inde calismaz. Faz 2: Cloudflare R2 (object storage) veya
// KV ile re-implement edilecek. Su an 501 Not Implemented stub.
//
// Çağrı: Cloudflare Cron Trigger (Settings -> Triggers).

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "SEO agent edge runtime'a port edilmemis durumda",
      detail: "Faz 2: Cloudflare R2/KV storage entegrasyonu gerek.",
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({
    status: "stub",
    runtime: "edge",
    note: "SEO agent Faz 2'de R2/KV port'u sonrasi aktiflesecek.",
  });
}
