import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

function pipelineRes(entries: Array<{ result?: number | string | null; error?: string }>): Response {
  return new Response(JSON.stringify(entries), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function captureFetch(responses: Response[]): { calls: FetchCall[]; restore: () => void } {
  const calls: FetchCall[] = [];
  let idx = 0;
  const original = globalThis.fetch;
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    const r = responses[idx];
    idx += 1;
    if (!r) throw new Error(`unexpected fetch #${idx} to ${url} (no stub)`);
    return r;
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

describe("checkRateLimit (in-memory, no Upstash env)", () => {
  beforeAll(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.resetModules();
  });

  beforeEach(async () => {
    const { _resetMemoryBuckets } = await import("@/lib/rate-limit");
    _resetMemoryBuckets();
  });

  it("upstashEnabled() returns false when env missing", async () => {
    const { upstashEnabled } = await import("@/lib/rate-limit");
    expect(upstashEnabled()).toBe(false);
  });

  it("allows first call and decrements remaining", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const r = await checkRateLimit("test:1", 3, 60_000);
    expect(r.ok).toBe(true);
    expect(r.remaining).toBe(2);
    expect(r.backend).toBe("memory");
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });

  it("blocks after exceeding max within window", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const r1 = await checkRateLimit("test:2", 2, 60_000);
    const r2 = await checkRateLimit("test:2", 2, 60_000);
    const r3 = await checkRateLimit("test:2", 2, 60_000);
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(1);
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(0);
    expect(r3.ok).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets bucket after window expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T12:00:00Z"));
    try {
      const { checkRateLimit, _resetMemoryBuckets } = await import("@/lib/rate-limit");
      _resetMemoryBuckets();
      const r1 = await checkRateLimit("test:3", 1, 1_000);
      expect(r1.ok).toBe(true);
      const r2 = await checkRateLimit("test:3", 1, 1_000);
      expect(r2.ok).toBe(false);
      vi.setSystemTime(new Date("2026-05-18T12:00:02Z"));
      const r3 = await checkRateLimit("test:3", 1, 1_000);
      expect(r3.ok).toBe(true);
      expect(r3.remaining).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("isolates buckets per key", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const a1 = await checkRateLimit("key:a", 1, 60_000);
    const a2 = await checkRateLimit("key:a", 1, 60_000);
    const b1 = await checkRateLimit("key:b", 1, 60_000);
    expect(a1.ok).toBe(true);
    expect(a2.ok).toBe(false);
    expect(b1.ok).toBe(true);
  });
});

describe("checkRateLimit (Upstash REST)", () => {
  const UPSTASH = "https://test-upstash.upstash.io";

  beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_URL = UPSTASH;
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token-upstash";
    vi.resetModules();
  });

  beforeEach(async () => {
    const { _resetMemoryBuckets } = await import("@/lib/rate-limit");
    _resetMemoryBuckets();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("upstashEnabled() returns true when env set", async () => {
    const { upstashEnabled } = await import("@/lib/rate-limit");
    expect(upstashEnabled()).toBe(true);
  });

  it("sends INCR/PEXPIRE NX/PTTL pipeline and returns ok with remaining from count", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const stub = captureFetch([
      pipelineRes([{ result: 1 }, { result: 1 }, { result: 60_000 }]),
    ]);
    try {
      const r = await checkRateLimit("ip:1:/api/x", 5, 60_000);
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(4);
      expect(r.backend).toBe("upstash");
      expect(stub.calls).toHaveLength(1);
      expect(stub.calls[0].url).toBe(`${UPSTASH}/pipeline`);
      expect(stub.calls[0].init?.method).toBe("POST");
      const auth = (stub.calls[0].init?.headers as Record<string, string>).Authorization;
      expect(auth).toBe("Bearer test-token-upstash");
      const body = JSON.parse(stub.calls[0].init?.body as string);
      expect(body).toEqual([
        ["INCR", "ip:1:/api/x"],
        ["PEXPIRE", "ip:1:/api/x", 60_000, "NX"],
        ["PTTL", "ip:1:/api/x"],
      ]);
    } finally {
      stub.restore();
    }
  });

  it("blocks when count exceeds max (count=6, max=5)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const stub = captureFetch([
      pipelineRes([{ result: 6 }, { result: 0 }, { result: 42_000 }]),
    ]);
    try {
      const r = await checkRateLimit("ip:2:/api/y", 5, 60_000);
      expect(r.ok).toBe(false);
      expect(r.remaining).toBe(0);
      expect(r.backend).toBe("upstash");
      expect(r.resetAt - Date.now()).toBeGreaterThanOrEqual(41_000);
      expect(r.resetAt - Date.now()).toBeLessThanOrEqual(42_000);
    } finally {
      stub.restore();
    }
  });

  it("falls back to memory backend on Upstash HTTP 5xx", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const stub = captureFetch([new Response("ise", { status: 500 })]);
    try {
      const r = await checkRateLimit("ip:3:/api/z", 5, 60_000);
      expect(r.ok).toBe(true);
      expect(r.backend).toBe("memory");
    } finally {
      stub.restore();
    }
  });

  it("falls back to memory backend on Upstash network error", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const original = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    }) as typeof fetch;
    try {
      const r = await checkRateLimit("ip:4:/api/w", 5, 60_000);
      expect(r.ok).toBe(true);
      expect(r.backend).toBe("memory");
    } finally {
      globalThis.fetch = original;
    }
  });

  it("uses windowMs fallback when PTTL returns -1 (key without TTL)", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const stub = captureFetch([
      pipelineRes([{ result: 2 }, { result: 0 }, { result: -1 }]),
    ]);
    try {
      const r = await checkRateLimit("ip:5:/api/v", 5, 30_000);
      expect(r.ok).toBe(true);
      expect(r.resetAt - Date.now()).toBeGreaterThanOrEqual(29_000);
      expect(r.resetAt - Date.now()).toBeLessThanOrEqual(30_000);
    } finally {
      stub.restore();
    }
  });
});
