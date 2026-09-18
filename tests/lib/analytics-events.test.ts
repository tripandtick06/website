import { describe, it, expect, vi, afterEach } from "vitest";
import { analyticsSummary, insertEvents, type EventRow } from "@/lib/analytics/events";

// Analytics DB katmanı: env yoksa no-op; varsa anon key + token ile RPC. Gerçek Supabase
// çağrısı YOK — fetch mock'lanır. Env (ANALYTICS_*) yanlışlıkla işlem DB'sine
// (NEXT_PUBLIC_SUPABASE_URL) düşmesin diye ayrı anahtarlar test edilir.

const row: EventRow = {
  sid: "abcdef0123456789", seq: 1, vhash: "0123456789abcdef", name: "page_view", path: "/", locale: "tr",
  ref_host: null, country: "TR", device: "desktop", product: null, props: {},
};
const env = { url: "https://ozmetzxcdhsqskprmbhu.supabase.co", anonKey: "anon-key", token: "t".repeat(48) };

afterEach(() => vi.restoreAllMocks());

describe("analytics events db layer", () => {
  it("is a no-op without ANALYTICS_* env (never falls back to the transactional DB)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://prod.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    vi.stubEnv("ANALYTICS_SUPABASE_URL", "");
    expect(await insertEvents([row])).toBe(false);
    expect(await analyticsSummary(7)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("calls analytics_ingest with the token and the rows", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("3", { status: 200 }));
    expect(await insertEvents([row], env)).toBe(true);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ozmetzxcdhsqskprmbhu.supabase.co/rest/v1/rpc/analytics_ingest");
    const headers = init.headers as Record<string, string>;
    expect(headers.apikey).toBe("anon-key");
    const body = JSON.parse(String(init.body));
    expect(body.p_token).toBe(env.token);
    expect(body.p_rows).toHaveLength(1);
    expect(body.p_rows[0].sid).toBe(row.sid);
  });

  it("reports failures without throwing (ingest) and throws for the admin summary", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("unauthorized", { status: 403 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await insertEvents([row], env)).toBe(false);
    await expect(analyticsSummary(7, env)).rejects.toThrow(/403/);
  });

  it("rejects a non-supabase URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await insertEvents([row], { ...env, url: "https://evil.example.com" })).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
