import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";

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

async function pingSupabase(): Promise<"ok" | "fail" | "disabled"> {
  if (!supabaseEnabled) return "disabled";
  const client = supabaseAdmin();
  if (!client) return "disabled";
  try {
    const { error } = await client.from("service_overrides").select("service_slug").limit(1);
    return error ? "fail" : "ok";
  } catch {
    return "fail";
  }
}

async function pingBrevo(): Promise<"ok" | "fail" | "disabled"> {
  const k = process.env.BREVO_API_KEY;
  if (!k) return "disabled";
  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: { "api-key": k, Accept: "application/json" },
    });
    return res.ok ? "ok" : "fail";
  } catch {
    return "fail";
  }
}

export async function GET() {
  const [supabasePing, brevoPing] = await Promise.all([pingSupabase(), pingBrevo()]);
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
      brevoPing,
      supabase: has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      supabaseAdmin: has("SUPABASE_SERVICE_ROLE_KEY"),
      supabasePing,
      adminToken: has("ADMIN_API_TOKEN"),
      rescheduleSecret: has("RESCHEDULE_SECRET") || has("ADMIN_API_TOKEN"),
    },
  });
}
