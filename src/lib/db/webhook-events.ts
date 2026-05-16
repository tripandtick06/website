// Webhook event idempotency helper.
//
// Callers:
//   - src/app/api/stripe/webhook/route.ts (Stripe redeliver/retry dedup)
//   - src/app/api/iyzico/callback/route.ts (iyzico retry dedup — onay sonrasi)
// Supabase yoksa in-memory Set fallback (process restart sonra sifirlanir).
// Stripe redeliver TTL 30 gun — in-memory yetersiz, prod-Supabase ŞART.

import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";

const MEMORY_SEEN = new Set<string>();
const MEMORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat
const MEMORY_TIMESTAMPS = new Map<string, number>();

function memorySeen(key: string): boolean {
  const now = Date.now();
  // GC eski kayitlar
  for (const [k, ts] of MEMORY_TIMESTAMPS) {
    if (now - ts > MEMORY_TTL_MS) {
      MEMORY_TIMESTAMPS.delete(k);
      MEMORY_SEEN.delete(k);
    }
  }
  if (MEMORY_SEEN.has(key)) return true;
  MEMORY_SEEN.add(key);
  MEMORY_TIMESTAMPS.set(key, now);
  return false;
}

/**
 * Event'i "claim" et. Returns true ilk-kez (process et), false duplicate (skip).
 * Supabase varsa INSERT race-safe (PK conflict = duplicate).
 */
export async function tryClaimEvent(
  provider: "stripe" | "iyzico",
  eventId: string,
  type: string
): Promise<boolean> {
  const key = `${provider}:${eventId}`;
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    const seen = memorySeen(key);
    return !seen;
  }
  const { error } = await client
    .from("webhook_events")
    .insert({ event_id: eventId, provider, type });
  if (error) {
    // 23505 unique_violation = duplicate event
    if ((error as { code?: string }).code === "23505" || error.message?.includes("duplicate")) {
      return false;
    }
    console.error("[db/webhook-events] insert failed", error.message);
    // Hata durumunda safe-default: process (at-least-once).
    return true;
  }
  return true;
}
