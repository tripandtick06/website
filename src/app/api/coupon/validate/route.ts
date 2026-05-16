// Kupon validate API — public POST endpoint, rezervasyon Step 4 promosyon kutusu.
//
// Importers (client fetch):
//   - src/app/rezervasyon/[slug]/BookingClient.tsx (applyPromo wiring)
// Affected: rezervasyon kupon indirimi runtime.
// Data: POST body { code: string (1..40), total: number (0..100000), slug?: string (.max 80) }.
//        Response: { valid, discount, newTotal, message }.
// User verbatim: "POST {code, total, slug} → coupon validate.
// Response: {valid: true, discount, newTotal, message} veya {valid: false, message}"

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateAndApply } from "@/data/coupons";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().min(1).max(40),
  total: z.number().nonnegative().max(100000),
  slug: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { valid: false, message: "Geçersiz JSON", discount: 0, newTotal: 0 },
      { status: 400 }
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        valid: false,
        message: "Geçersiz parametreler",
        discount: 0,
        newTotal: 0,
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }
  const { code, total, slug } = parsed.data;
  const result = validateAndApply(code, total, slug);
  return NextResponse.json(result);
}
