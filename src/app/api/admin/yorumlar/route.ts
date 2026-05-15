// Admin yorum moderasyon API (PATCH approve/reject/delete)
//
// Importers: src/app/admin/yorumlar/page.tsx (PATCH fetch)
// Affected: admin onayla/reddet/sil aksiyonlari
// Data: PATCH body { id, action: "approve"|"reject"|"delete" }
//       Auth: x-admin-token header (env ADMIN_TOKEN; dev demo-)
//       Persist: reviews-store -> .next/cache/reviews.json
// User verbatim: "devam et"

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { deleteReview, setReviewStatus } from "@/lib/reviews-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const patchSchema = z.object({
  id: z.string().min(2).max(60),
  action: z.enum(["approve", "reject", "delete"]),
});

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { error: "Yetkisiz — admin token gerekli" },
      { status: 401 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, action } = parsed.data;
  if (action === "delete") {
    const ok = await deleteReview(id);
    return NextResponse.json({ ok });
  }
  const newStatus = action === "approve" ? "approved" : "rejected";
  const updated = await setReviewStatus(id, newStatus);
  if (!updated) {
    return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, review: updated });
}
