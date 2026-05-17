// /api/b2b/auth/logout — B2B cookie clear.

import { NextResponse } from "next/server";
import { B2B_COOKIE_NAME } from "@/lib/b2b-session";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(B2B_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
