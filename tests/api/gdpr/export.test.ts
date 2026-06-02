import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.GDPR_SECRET = "test-secret-min-32-chars-aaaaaaaaaa";
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

const getCustomerByEmailMock = vi.fn();
const listBookingsByCustomerMock = vi.fn();

vi.mock("@/lib/db/customers", () => ({
  getCustomerByEmail: (...a: unknown[]) => getCustomerByEmailMock(...a),
}));
vi.mock("@/lib/db/bookings", () => ({
  listBookingsByCustomer: (...a: unknown[]) => listBookingsByCustomerMock(...a),
}));

const CUSTOMER = {
  id: "cust-1",
  email: "alice@example.com",
  fullName: "Alice",
  phone: null,
  nationality: "TR",
  language: "tr",
  segment: "returning" as const,
  loyaltyPoints: 12,
  referralCode: null,
  referredBy: null,
  totalBookings: 2,
  totalSpent: 320,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
};

const BOOKINGS = [
  { id: "TT-AAA11111", date: "2026-06-01", serviceSlug: "balon" },
  { id: "TT-BBB22222", date: "2026-06-15", serviceSlug: "atv" },
];

beforeEach(() => {
  getCustomerByEmailMock.mockReset();
  listBookingsByCustomerMock.mockReset();
  getCustomerByEmailMock.mockResolvedValue(CUSTOMER);
  listBookingsByCustomerMock.mockResolvedValue(BOOKINGS);
});

async function buildToken(action: "export" | "delete", email = "alice@example.com"): Promise<string> {
  const { signGdprToken } = await import("@/lib/gdpr-token");
  return signGdprToken({ email, action });
}

function reqWith(token?: string): NextRequest {
  const url = token
    ? `https://tripandtick.com/api/gdpr/export?token=${encodeURIComponent(token)}`
    : "https://tripandtick.com/api/gdpr/export";
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/gdpr/export", () => {
  it("returns 400 HTML when token missing", async () => {
    const { GET } = await import("@/app/api/gdpr/export/route");
    const res = await GET(reqWith());
    expect(res.status).toBe(400);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("Bag eksik");
  });

  it("returns 403 HTML when token is malformed", async () => {
    const { GET } = await import("@/app/api/gdpr/export/route");
    const res = await GET(reqWith("not-a-token"));
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("Gecersiz");
  });

  it("returns 403 when token action mismatches (delete used)", async () => {
    const token = await buildToken("delete");
    const { GET } = await import("@/app/api/gdpr/export/route");
    const res = await GET(reqWith(token));
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("silme");
  });

  it("returns JSON bundle with attachment headers on valid export token", async () => {
    const token = await buildToken("export");
    const { GET } = await import("@/app/api/gdpr/export/route");
    const res = await GET(reqWith(token));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Content-Disposition")).toMatch(
      /attachment; filename="tripandtick-gdpr-export-alice@example.com-\d+\.json"/
    );
    expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    const bundle = await res.json();
    expect(bundle.subject.email).toBe("alice@example.com");
    expect(bundle.customer).toEqual(CUSTOMER);
    expect(bundle.bookings).toEqual(BOOKINGS);
    expect(bundle.gdprArticle).toContain("Madde 15");
    expect(bundle.dataController.name).toBe("Trip and Tick");
    expect(bundle.notes.paymentRecords).toContain("Stripe");
    expect(bundle.notes.retentionPolicy).toContain("10 yil");
    expect(getCustomerByEmailMock).toHaveBeenCalledWith("alice@example.com");
    expect(listBookingsByCustomerMock).toHaveBeenCalledWith("alice@example.com");
  });

  it("returns bundle with null customer when customer not found", async () => {
    getCustomerByEmailMock.mockResolvedValueOnce(null);
    listBookingsByCustomerMock.mockResolvedValueOnce([]);
    const token = await buildToken("export", "ghost@example.com");
    const { GET } = await import("@/app/api/gdpr/export/route");
    const res = await GET(reqWith(token));
    expect(res.status).toBe(200);
    const bundle = await res.json();
    expect(bundle.customer).toBeNull();
    expect(bundle.bookings).toEqual([]);
  });
});
