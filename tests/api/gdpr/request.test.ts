import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.GDPR_SECRET = "test-secret-min-32-chars-aaaaaaaaaa";
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.tripandtick.com";
});

const sendBrevoEmailMock = vi.fn();

vi.mock("@/lib/brevo", () => ({
  sendBrevoEmail: (...args: unknown[]) => sendBrevoEmailMock(...args),
}));

beforeEach(() => {
  sendBrevoEmailMock.mockReset();
  sendBrevoEmailMock.mockResolvedValue({ ok: true, status: 201, messageId: "msg-1" });
});

function buildReq(body: unknown, ip = "10.0.0.1"): NextRequest {
  return new NextRequest("https://www.tripandtick.com/api/gdpr/request", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/gdpr/request", () => {
  it("sends magic-link email + returns generic 200 on valid export", async () => {
    const { POST } = await import("@/app/api/gdpr/request/route");
    const res = await POST(buildReq({ email: "alice@example.com", action: "export" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.emailSent).toBe(true);
    expect(sendBrevoEmailMock).toHaveBeenCalledTimes(1);
    const arg = sendBrevoEmailMock.mock.calls[0][0];
    expect(arg.to.email).toBe("alice@example.com");
    expect(arg.subject).toContain("Veri Disa Aktarma");
    expect(arg.htmlContent).toContain("/api/gdpr/export?token=");
    expect(arg.tags).toEqual(["gdpr", "gdpr-export", "transactional"]);
  });

  it("includes delete-warning banner in delete email", async () => {
    const { POST } = await import("@/app/api/gdpr/request/route");
    const res = await POST(buildReq({ email: "bob@example.com", action: "delete" }, "10.0.0.2"));
    expect(res.status).toBe(200);
    const arg = sendBrevoEmailMock.mock.calls[0][0];
    expect(arg.subject).toContain("Veri Silme");
    expect(arg.htmlContent).toContain("kalici olarak silinecektir");
    expect(arg.htmlContent).toContain("/api/gdpr/delete?token=");
  });

  it("rejects invalid email with 400", async () => {
    const { POST } = await import("@/app/api/gdpr/request/route");
    const res = await POST(buildReq({ email: "not-an-email", action: "export" }, "10.0.0.3"));
    expect(res.status).toBe(400);
    expect(sendBrevoEmailMock).not.toHaveBeenCalled();
  });

  it("rejects invalid action with 400", async () => {
    const { POST } = await import("@/app/api/gdpr/request/route");
    const res = await POST(
      buildReq({ email: "x@y.com", action: "purge" }, "10.0.0.4")
    );
    expect(res.status).toBe(400);
    expect(sendBrevoEmailMock).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON with 400", async () => {
    const { POST } = await import("@/app/api/gdpr/request/route");
    const res = await POST(buildReq("{not-json", "10.0.0.5"));
    expect(res.status).toBe(400);
    expect(sendBrevoEmailMock).not.toHaveBeenCalled();
  });

  it("rate-limits at 5 requests per IP+email hour", async () => {
    const { POST } = await import("@/app/api/gdpr/request/route");
    const email = "rl@example.com";
    const ip = "10.0.0.99";
    for (let i = 0; i < 5; i++) {
      const ok = await POST(buildReq({ email, action: "export" }, ip));
      expect(ok.status).toBe(200);
    }
    const sixth = await POST(buildReq({ email, action: "export" }, ip));
    expect(sixth.status).toBe(429);
    const body = await sixth.json();
    expect(body.error).toContain("Cok fazla istek");
  });

  it("falls through to demo-log when Brevo returns demoLogged", async () => {
    sendBrevoEmailMock.mockResolvedValueOnce({ ok: false, demoLogged: true });
    const { POST } = await import("@/app/api/gdpr/request/route");
    const res = await POST(buildReq({ email: "demo@example.com", action: "export" }, "10.0.0.6"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.emailSent).toBe(false);
    expect(json.demoLogged).toBe(true);
  });
});
