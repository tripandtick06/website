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

  const integrations = {
    stripe: stripeMode(),
    stripeWebhook: has("STRIPE_WEBHOOK_SECRET"),
    brevo: has("BREVO_API_KEY"),
    brevoPing,
    supabase: has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseAdmin: has("SUPABASE_SERVICE_ROLE_KEY"),
    supabasePing,
    adminToken: has("ADMIN_API_TOKEN"),
    adminPassword: has("ADMIN_PASSWORD"),
    rescheduleSecret: has("RESCHEDULE_SECRET") || has("ADMIN_API_TOKEN"),
    b2bSessionSecret: has("B2B_SESSION_SECRET") || has("ADMIN_API_TOKEN"),
  };

  const isProd = (process.env.NODE_ENV ?? "development") === "production";
  // Prod'da kritik env eksikse degraded raporla.
  const criticalMissing: string[] = [];
  if (isProd) {
    if (integrations.stripe !== "live") criticalMissing.push("STRIPE_SECRET_KEY (live)");
    if (!integrations.stripeWebhook) criticalMissing.push("STRIPE_WEBHOOK_SECRET");
    if (!integrations.adminToken) criticalMissing.push("ADMIN_API_TOKEN");
    if (!integrations.adminPassword) criticalMissing.push("ADMIN_PASSWORD");
    if (!integrations.supabase) criticalMissing.push("SUPABASE_URL/ANON_KEY");
    if (!integrations.supabaseAdmin) criticalMissing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!integrations.brevo) criticalMissing.push("BREVO_API_KEY");
  }

  return NextResponse.json({
    status: criticalMissing.length > 0 ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    env: process.env.NODE_ENV ?? "development",
    integrations,
    criticalMissing: criticalMissing.length > 0 ? criticalMissing : undefined,
  });
}
