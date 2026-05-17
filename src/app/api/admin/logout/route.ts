// /api/admin/logout — admin cookie clear.
//
// POST → Set-Cookie tripandtick_admin=; Max-Age=0 (browser cookie sil).
// Auth gerek yok (sadece existing cookie iptal eder).

import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
