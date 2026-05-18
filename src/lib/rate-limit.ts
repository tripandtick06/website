// Rate-limit shared module.
//
// Importers:
//   - src/middleware.ts (per-IP API throttling + admin-auth brute-force cap)
//
// Backend selection:
//   - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env present → Upstash Redis
//     (multi-instance safe; required for Vercel/CF Pages prod deploy).
//   - Else → in-memory Map (single-instance only; dev + tests).
//
// Algorithm: fixed-window via INCR + PEXPIRE NX (atomic in Upstash pipeline).
// PTTL returns remaining ms for accurate resetAt.

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  backend: "upstash" | "memory";
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export function upstashEnabled(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

const memBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryCheck(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = memBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    memBuckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt, backend: "memory" };
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt, backend: "memory" };
  }
  return { ok: true, remaining: max - bucket.count, resetAt: bucket.resetAt, backend: "memory" };
}

interface PipelineEntry {
  result?: number | string | null;
  error?: string;
}

async function upstashCheck(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const body = JSON.stringify([
    ["INCR", key],
    ["PEXPIRE", key, windowMs, "NX"],
    ["PTTL", key],
  ]);
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body,
    });
    if (!res.ok) {
      console.error("[lib/rate-limit] Upstash HTTP", res.status, "fallback memory");
      return memoryCheck(key, max, windowMs);
    }
    const data = (await res.json()) as PipelineEntry[];
    const count = typeof data[0]?.result === "number" ? data[0].result : 0;
    const pttl = typeof data[2]?.result === "number" ? data[2].result : -1;
    const resetAt = pttl > 0 ? now + pttl : now + windowMs;
    if (count > max) {
      return { ok: false, remaining: 0, resetAt, backend: "upstash" };
    }
    return { ok: true, remaining: max - count, resetAt, backend: "upstash" };
  } catch (err) {
    console.error("[lib/rate-limit] Upstash fetch error, fallback memory", err);
    return memoryCheck(key, max, windowMs);
  }
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (upstashEnabled()) return upstashCheck(key, max, windowMs);
  return memoryCheck(key, max, windowMs);
}

// Test-only: reset in-memory state between describes.
export function _resetMemoryBuckets(): void {
  memBuckets.clear();
}
