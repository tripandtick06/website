import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function has(k: string): boolean {
  const v = process.env[k]?.trim();
  return !!v && !v.startsWith("REPLACE") && !v.startsWith("sandbox-dummy");
}

function stripeMode(): "live" | "test" | "missing" {
  const k = process.env.STRIPE_SECRET_KEY?.trim();
  if (!k) return "missing";
  if (k.startsWith("sk_live_") || k.startsWith("rk_live_")) return "live";
  return "test";
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    env: process.env.NODE_ENV ?? "development",
    integrations: {
      stripe: stripeMode(),
      stripeWebhook: has("STRIPE_WEBHOOK_SECRET"),
      iyzicoEnabled: process.env.NEXT_PUBLIC_IYZICO_ENABLED === "true",
      iyzicoConfigured: has("IYZICO_API_KEY") && has("IYZICO_SECRET"),
      brevo: has("BREVO_API_KEY"),
      supabase: has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      supabaseAdmin: has("SUPABASE_SERVICE_ROLE_KEY"),
      adminToken: has("ADMIN_API_TOKEN"),
      rescheduleSecret: has("RESCHEDULE_SECRET") || has("ADMIN_API_TOKEN"),
    },
  });
}
