import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

interface FetchCall {
  url: string;
  body: Record<string, unknown>;
}

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function captureFetch(responses: Response[]): { calls: FetchCall[]; restore: () => void } {
  const calls: FetchCall[] = [];
  let idx = 0;
  const original = globalThis.fetch;
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    calls.push({ url, body });
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

const ENV_KEYS = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_IDS"] as const;
const saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.restoreAllMocks();
});

describe("telegramChatIds", () => {
  it("parses comma/space separated numeric ids incl. negative group ids", async () => {
    process.env.TELEGRAM_CHAT_IDS = " 123, -1001234567890 ;abc, 42 ";
    const { telegramChatIds, telegramEnabled } = await import("@/lib/telegram");
    expect(telegramChatIds()).toEqual(["123", "-1001234567890", "42"]);
    expect(telegramEnabled()).toBe(false); // token yok
  });
});

describe("formatLeadMessage", () => {
  it("escapes HTML and skips blank fields", async () => {
    const { formatLeadMessage } = await import("@/lib/telegram");
    const text = formatLeadMessage({
      source: "contact",
      title: "A <b>& B",
      fields: [
        ["Ad", "Ali <script>"],
        ["Telefon", ""],
        ["Bos", null],
        ["Undef", undefined],
        ["Sayi", 3],
      ],
      note: "x & y",
    });
    expect(text).toContain("<b>A &lt;b&gt;&amp; B</b>");
    expect(text).toContain("<b>Ad:</b> Ali &lt;script&gt;");
    expect(text).toContain("<b>Sayi:</b> 3");
    expect(text).not.toContain("Telefon");
    expect(text).not.toContain("Bos");
    expect(text).not.toContain("Undef");
    expect(text).toContain("<i>x &amp; y</i>");
    expect(text).toContain("tripandtick.com");
  });

  it("truncates to 4096 chars", async () => {
    const { formatLeadMessage } = await import("@/lib/telegram");
    const text = formatLeadMessage({
      source: "hotel",
      title: "t",
      fields: [["Mesaj", "x".repeat(10_000)]],
    });
    expect(text.length).toBeLessThanOrEqual(4096);
    expect(text.endsWith("...")).toBe(true);
  });
});

describe("notifyLead", () => {
  it("demo mode when env missing: no fetch, demoLogged=true", async () => {
    const { notifyLead } = await import("@/lib/telegram");
    const stub = captureFetch([]);
    try {
      const r = await notifyLead({ source: "test", title: "t", fields: [] });
      expect(r).toEqual({ ok: false, sent: 0, failed: 0, demoLogged: true });
      expect(stub.calls).toHaveLength(0);
    } finally {
      stub.restore();
    }
  });

  it("sends one sendMessage per chat id with HTML parse mode", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.TELEGRAM_CHAT_IDS = "111,-222";
    const { notifyLead } = await import("@/lib/telegram");
    const stub = captureFetch([jsonRes({ ok: true }), jsonRes({ ok: true })]);
    try {
      const r = await notifyLead({ source: "booking", title: "Rez", fields: [["Ad", "Ali"]] });
      expect(r.ok).toBe(true);
      expect(r.sent).toBe(2);
      expect(r.failed).toBe(0);
      expect(stub.calls).toHaveLength(2);
      const chatIds = stub.calls.map((c) => c.body.chat_id).sort();
      expect(chatIds).toEqual(["-222", "111"]);
      for (const c of stub.calls) {
        expect(c.url).toBe("https://api.telegram.org/bot123:ABC/sendMessage");
        expect(c.body.parse_mode).toBe("HTML");
        expect(String(c.body.text)).toContain("<b>Ad:</b> Ali");
      }
    } finally {
      stub.restore();
    }
  });

  it("partial failure: ok=true when at least one chat delivered, errors listed", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.TELEGRAM_CHAT_IDS = "111,222";
    const { notifyLead } = await import("@/lib/telegram");
    // 111 -> ok ; 222 -> 400 (chat not found, non-retryable)
    const stub = captureFetch([
      jsonRes({ ok: true }),
      jsonRes({ ok: false, description: "Bad Request: chat not found" }, 400),
    ]);
    try {
      const r = await notifyLead({ source: "contact", title: "t", fields: [] });
      expect(r.ok).toBe(true);
      expect(r.sent).toBe(1);
      expect(r.failed).toBe(1);
      expect(r.errors?.[0]).toContain("chat not found");
      expect(stub.calls).toHaveLength(2);
    } finally {
      stub.restore();
    }
  });

  it("retries on 429 using retry_after then succeeds", async () => {
    vi.useFakeTimers();
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.TELEGRAM_CHAT_IDS = "111";
    const { notifyLead } = await import("@/lib/telegram");
    const stub = captureFetch([
      jsonRes({ ok: false, description: "Too Many Requests", parameters: { retry_after: 1 } }, 429),
      jsonRes({ ok: true }),
    ]);
    try {
      const p = notifyLead({ source: "contact", title: "t", fields: [] });
      await vi.advanceTimersByTimeAsync(1_500);
      const r = await p;
      expect(r.ok).toBe(true);
      expect(stub.calls).toHaveLength(2);
    } finally {
      stub.restore();
      vi.useRealTimers();
    }
  });

  it("never throws even if fetch throws every time", async () => {
    vi.useFakeTimers();
    process.env.TELEGRAM_BOT_TOKEN = "123:ABC";
    process.env.TELEGRAM_CHAT_IDS = "111";
    const { notifyLead } = await import("@/lib/telegram");
    const original = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => {
      throw new Error("network down");
    }) as typeof fetch;
    try {
      const p = notifyLead({ source: "contact", title: "t", fields: [] });
      await vi.advanceTimersByTimeAsync(5_000);
      const r = await p;
      expect(r.ok).toBe(false);
      expect(r.failed).toBe(1);
      expect(r.errors?.[0]).toBe("network down");
    } finally {
      globalThis.fetch = original;
      vi.useRealTimers();
    }
  });
});

describe("persistLead", () => {
  it("no-op without Supabase env", async () => {
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { persistLead } = await import("@/lib/leads");
    const stub = captureFetch([]);
    try {
      const ok = await persistLead({
        source: "contact",
        ref: "CT-1",
        name: "A",
        email: "a@b.c",
        payload: {},
        telegramOk: true,
        emailOk: false,
      });
      expect(ok).toBe(false);
      expect(stub.calls).toHaveLength(0);
    } finally {
      stub.restore();
      if (savedUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
      if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
    }
  });

  it("posts to /rest/v1/leads with service-role headers", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supa.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "srv";
    const { persistLead } = await import("@/lib/leads");
    const stub = captureFetch([new Response(null, { status: 201 })]);
    try {
      const ok = await persistLead({
        source: "hotel",
        ref: "HI-1",
        name: "A",
        email: "a@b.c",
        phone: "+90",
        payload: { hotel: "x" },
        telegramOk: true,
        emailOk: false,
      });
      expect(ok).toBe(true);
      expect(stub.calls[0].url).toBe("https://supa.test/rest/v1/leads");
      expect(stub.calls[0].body).toMatchObject({ source: "hotel", ref: "HI-1", telegram_ok: true, email_ok: false });
    } finally {
      stub.restore();
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    }
  });
});
