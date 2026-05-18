import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.GDPR_SECRET = "test-secret-min-32-chars-aaaaaaaaaa";
});

import {
  signGdprToken,
  verifyGdprToken,
  buildGdprLinkUrl,
} from "@/lib/gdpr-token";

describe("signGdprToken / verifyGdprToken", () => {
  it("signs and verifies an export token round-trip", async () => {
    const token = await signGdprToken({ email: "alice@example.com", action: "export" });
    const result = await verifyGdprToken(token);
    expect(result.valid).toBe(true);
    expect(result.payload?.email).toBe("alice@example.com");
    expect(result.payload?.action).toBe("export");
    expect(result.payload?.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("lowercases + trims emails before signing", async () => {
    const token = await signGdprToken({ email: "  Bob@EX.com  ", action: "delete" });
    const r = await verifyGdprToken(token);
    expect(r.payload?.email).toBe("bob@ex.com");
  });

  it("rejects tampered payload (signature mismatch)", async () => {
    const token = await signGdprToken({ email: "x@y.com", action: "export" });
    const [p, s] = token.split(".");
    const tampered = `${p.slice(0, -2)}AA.${s}`;
    const r = await verifyGdprToken(tampered);
    expect(r.valid).toBe(false);
    expect(r.error).toBe("signature");
  });

  it("rejects malformed tokens", async () => {
    expect((await verifyGdprToken("")).error).toBe("format");
    expect((await verifyGdprToken("nopayloadnodot")).error).toBe("format");
    expect((await verifyGdprToken(".onlydot")).error).toBe("format");
  });

  it("rejects expired tokens", async () => {
    const token = await signGdprToken({
      email: "exp@x.com",
      action: "export",
      ttlHours: -1,
    });
    const r = await verifyGdprToken(token);
    expect(r.valid).toBe(false);
    expect(r.error).toBe("expired");
  });

  it("sets default 24h TTL when ttlHours omitted", async () => {
    const before = Date.now();
    const token = await signGdprToken({ email: "ttl@x.com", action: "export" });
    const r = await verifyGdprToken(token);
    expect(r.valid).toBe(true);
    const expMs = new Date(r.payload!.exp).getTime();
    const elapsedH = (expMs - before) / 3600000;
    expect(elapsedH).toBeGreaterThan(23.9);
    expect(elapsedH).toBeLessThan(24.1);
  });
});

describe("buildGdprLinkUrl", () => {
  it("builds export URL with encoded token", () => {
    const link = buildGdprLinkUrl("https://www.tripandtick.com/", "export", "abc.def");
    expect(link).toBe("https://www.tripandtick.com/api/gdpr/export?token=abc.def");
  });

  it("strips trailing slashes from siteUrl", () => {
    const link = buildGdprLinkUrl("https://x.com///", "delete", "t");
    expect(link).toBe("https://x.com/api/gdpr/delete?token=t");
  });

  it("URL-encodes tokens containing special chars", () => {
    const link = buildGdprLinkUrl("https://x.com", "export", "a/b+c=d");
    expect(link).toContain("token=a%2Fb%2Bc%3Dd");
  });
});
