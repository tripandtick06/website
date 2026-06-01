import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const SUPA_URL = "https://supa.test";
const DLQ_URL = `${SUPA_URL}/rest/v1/email_dead_letter`;

function jsonRes(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

function textRes(body: string, init: ResponseInit = {}): Response {
  return new Response(body, {
    status: init.status ?? 500,
    headers: init.headers,
  });
}

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
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

describe("sendBrevoEmail (demo mode, no API key)", () => {
  beforeAll(() => {
    delete process.env.BREVO_API_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.resetModules();
  });

  it("returns demoLogged=true and does not call fetch when key missing", async () => {
    const { sendBrevoEmail } = await import("@/lib/brevo");
    const stub = captureFetch([]);
    try {
      const r = await sendBrevoEmail({
        to: { email: "demo@x.com" },
        subject: "demo",
        htmlContent: "<p>demo</p>",
      });
      expect(r.ok).toBe(false);
      expect(r.demoLogged).toBe(true);
      expect(stub.calls).toHaveLength(0);
    } finally {
      stub.restore();
    }
  });
});

describe("sendBrevoEmail (with key + retry + DLQ)", () => {
  beforeAll(() => {
    process.env.BREVO_API_KEY = "test-brevo-key";
    process.env.BREVO_FROM_EMAIL = "from@tripandtick.com";
    process.env.BREVO_FROM_NAME = "TripAndTick Test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPA_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
    vi.resetModules();
  });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 5 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries on 429 and succeeds on attempt 2 (no DLQ insert)", async () => {
    const { sendBrevoEmail } = await import("@/lib/brevo");
    const stub = captureFetch([
      textRes("rate limited", { status: 429, headers: { "Retry-After": "0" } }),
      jsonRes({ messageId: "msg-ok-123" }, { status: 201 }),
    ]);
    try {
      const r = await sendBrevoEmail({
        to: { email: "retry@x.com" },
        subject: "ok",
        htmlContent: "<p>ok</p>",
        tags: ["test"],
      });
      expect(r.ok).toBe(true);
      expect(r.status).toBe(201);
      expect(r.messageId).toBe("msg-ok-123");
      expect(stub.calls).toHaveLength(2);
      expect(stub.calls[0].url).toBe(BREVO_URL);
      expect(stub.calls[1].url).toBe(BREVO_URL);
    } finally {
      stub.restore();
    }
  });

  it("exhausts 3 retries on persistent 5xx and posts to DLQ", async () => {
    const { sendBrevoEmail } = await import("@/lib/brevo");
    const stub = captureFetch([
      textRes("err1", { status: 500 }),
      textRes("err2", { status: 502 }),
      textRes("err3-final", { status: 503 }),
      jsonRes({}, { status: 201 }),
    ]);
    try {
      const r = await sendBrevoEmail({
        to: { email: "dlq@x.com" },
        subject: "dlq",
        htmlContent: "<p>dlq</p>",
      });
      expect(r.ok).toBe(false);
      expect(r.status).toBe(503);
      expect(r.error).toContain("err3-final");
      expect(stub.calls).toHaveLength(4);
      expect(stub.calls[0].url).toBe(BREVO_URL);
      expect(stub.calls[1].url).toBe(BREVO_URL);
      expect(stub.calls[2].url).toBe(BREVO_URL);
      expect(stub.calls[3].url).toBe(DLQ_URL);
      const dlqBody = JSON.parse(stub.calls[3].init?.body as string);
      expect(dlqBody.to_email).toBe("dlq@x.com");
      expect(dlqBody.last_status).toBe(503);
      expect(dlqBody.last_error).toContain("err3-final");
    } finally {
      stub.restore();
    }
  });

  it("does not retry on non-retryable 400 and posts to DLQ immediately", async () => {
    const { sendBrevoEmail } = await import("@/lib/brevo");
    const stub = captureFetch([
      textRes("bad request", { status: 400 }),
      jsonRes({}, { status: 201 }),
    ]);
    try {
      const r = await sendBrevoEmail({
        to: { email: "bad@x.com" },
        subject: "bad",
        htmlContent: "<p>bad</p>",
      });
      expect(r.ok).toBe(false);
      expect(r.status).toBe(400);
      expect(stub.calls).toHaveLength(2);
      expect(stub.calls[0].url).toBe(BREVO_URL);
      expect(stub.calls[1].url).toBe(DLQ_URL);
    } finally {
      stub.restore();
    }
  });

  it("succeeds first try and emits RFC 8058 List-Unsubscribe header when unsubscribe.url provided", async () => {
    const { sendBrevoEmail } = await import("@/lib/brevo");
    const stub = captureFetch([jsonRes({ messageId: "msg-first" }, { status: 201 })]);
    try {
      const r = await sendBrevoEmail({
        to: { email: "first@x.com" },
        subject: "first",
        htmlContent: "<p>first</p>",
        unsubscribe: { url: "https://tripandtick.com/unsub?t=abc" },
      });
      expect(r.ok).toBe(true);
      expect(r.messageId).toBe("msg-first");
      expect(stub.calls).toHaveLength(1);
      const body = JSON.parse(stub.calls[0].init?.body as string);
      expect(body.headers["List-Unsubscribe"]).toBe("<https://tripandtick.com/unsub?t=abc>");
      expect(body.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    } finally {
      stub.restore();
    }
  });

  it("retries on fetch network error and posts to DLQ after exhaustion (last_status null)", async () => {
    const { sendBrevoEmail } = await import("@/lib/brevo");
    const calls: FetchCall[] = [];
    const original = globalThis.fetch;
    let attempt = 0;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      calls.push({ url, init });
      attempt += 1;
      if (url === BREVO_URL) throw new Error(`network down attempt ${attempt}`);
      return jsonRes({}, { status: 201 });
    }) as typeof fetch;
    try {
      const r = await sendBrevoEmail({
        to: { email: "net@x.com" },
        subject: "net",
        htmlContent: "<p>net</p>",
      });
      expect(r.ok).toBe(false);
      expect(r.status).toBeUndefined();
      expect(r.error).toContain("network down");
      expect(calls).toHaveLength(4);
      expect(calls[3].url).toBe(DLQ_URL);
      const dlqBody = JSON.parse(calls[3].init?.body as string);
      expect(dlqBody.last_status).toBeNull();
    } finally {
      globalThis.fetch = original;
    }
  });
});
