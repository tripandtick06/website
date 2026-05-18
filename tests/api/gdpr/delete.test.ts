import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.GDPR_SECRET = "test-secret-min-32-chars-aaaaaaaaaa";
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.tripandtick.com";
  process.env.BREVO_API_KEY = "test-brevo-key";
});

const fromMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabaseEnabled: true,
  supabaseAdmin: () => ({ from: fromMock }),
}));

type AnyObj = Record<string, unknown>;

function thenable<T>(value: T) {
  const obj: AnyObj = Promise.resolve(value) as unknown as AnyObj;
  obj.select = () => obj;
  obj.eq = () => obj;
  obj.is = () => obj;
  obj.update = () => obj;
  obj.delete = () => obj;
  obj.maybeSingle = () => Promise.resolve(value);
  return obj;
}

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  fromMock.mockReset();
  fetchMock.mockReset();
});

async function buildToken(action: "export" | "delete", email = "alice@example.com"): Promise<string> {
  const { signGdprToken } = await import("@/lib/gdpr-token");
  return signGdprToken({ email, action });
}

function reqWith(method: "GET" | "POST", token?: string): NextRequest {
  const url = token
    ? `https://www.tripandtick.com/api/gdpr/delete?token=${encodeURIComponent(token)}`
    : "https://www.tripandtick.com/api/gdpr/delete";
  return new NextRequest(url, { method });
}

describe("GET /api/gdpr/delete", () => {
  it("returns 403 when token missing", async () => {
    const { GET } = await import("@/app/api/gdpr/delete/route");
    const res = await GET(reqWith("GET"));
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("Bag eksik");
  });

  it("returns 403 when token action mismatches (export used)", async () => {
    const token = await buildToken("export");
    const { GET } = await import("@/app/api/gdpr/delete/route");
    const res = await GET(reqWith("GET", token));
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("silme islemi icin degil");
  });

  it("renders confirm HTML form on valid delete token", async () => {
    const token = await buildToken("delete");
    const { GET } = await import("@/app/api/gdpr/delete/route");
    const res = await GET(reqWith("GET", token));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("Veri Silme Onayi");
    expect(html).toContain("alice@example.com");
    expect(html).toContain(`action="/api/gdpr/delete?token=`);
    expect(res.headers.get("X-Robots-Tag")).toContain("noindex");
  });
});

describe("POST /api/gdpr/delete — erasure", () => {
  it("pseudonymizes customer bookings + deletes customer + removes Brevo contact", async () => {
    fromMock
      .mockReturnValueOnce(thenable({ data: { id: "cust-1" } }))
      .mockReturnValueOnce(
        thenable({
          data: [
            {
              id: "b1",
              passengers: [
                { fullName: "Alice", email: "alice@example.com", phone: "+90", nationality: "TR", age: 32 },
              ],
            },
          ],
        })
      )
      .mockReturnValueOnce(thenable({ error: null }))
      .mockReturnValueOnce(thenable({ error: null }))
      .mockReturnValueOnce(thenable({ data: [] }));

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const token = await buildToken("delete");
    const { POST } = await import("@/app/api/gdpr/delete/route");
    const res = await POST(reqWith("POST", token));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Tamamlandi");
    expect(html).toContain("alice@example.com");
    expect(html).toContain("Hesap profili: silindi");
    expect(html).toContain("Rezervasyon anonimlestirme: 1 kayit");
    expect(html).toContain("Newsletter aboneligi: kaldirildi");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [brevoUrl, brevoInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(brevoUrl).toBe("https://api.brevo.com/v3/contacts/alice%40example.com");
    expect(brevoInit.method).toBe("DELETE");
    expect((brevoInit.headers as Record<string, string>)["api-key"]).toBe("test-brevo-key");
  });

  it("handles missing customer (no record) gracefully", async () => {
    fromMock
      .mockReturnValueOnce(thenable({ data: null }))
      .mockReturnValueOnce(thenable({ data: [] }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

    const token = await buildToken("delete", "ghost@example.com");
    const { POST } = await import("@/app/api/gdpr/delete/route");
    const res = await POST(reqWith("POST", token));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Hesap profili: kaydi yoktu");
    expect(html).toContain("Rezervasyon anonimlestirme: 0 kayit");
    expect(html).toContain("Newsletter aboneligi: kaldirildi");
  });

  it("pseudonymizes orphan bookings whose passenger email matches", async () => {
    fromMock
      .mockReturnValueOnce(thenable({ data: null }))
      .mockReturnValueOnce(
        thenable({
          data: [
            {
              id: "b9",
              passengers: [
                { fullName: "X", email: "MATCH@EXAMPLE.com", phone: "+1", nationality: "US", age: 28 },
              ],
            },
            {
              id: "b10",
              passengers: [{ fullName: "Z", email: "other@example.com" }],
            },
          ],
        })
      )
      .mockReturnValueOnce(thenable({ error: null }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

    const token = await buildToken("delete", "match@example.com");
    const { POST } = await import("@/app/api/gdpr/delete/route");
    const res = await POST(reqWith("POST", token));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Rezervasyon anonimlestirme: 1 kayit");
  });

  it("rejects POST with wrong-action token", async () => {
    const token = await buildToken("export");
    const { POST } = await import("@/app/api/gdpr/delete/route");
    const res = await POST(reqWith("POST", token));
    expect(res.status).toBe(403);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
