import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { SECURITY_HEADERS, withSecurityHeaders } from "@/lib/security-headers";

// next-on-pages ignores next.config.js headers() on edge routes (live
// tripandtick.com had 0/5 on 2026-11-06), so the middleware must set them.
describe("security headers", () => {
  it("sets every header without overwriting existing ones", () => {
    const res = { headers: new Headers({ "X-Frame-Options": "DENY" }) };
    withSecurityHeaders(res);
    for (const [k] of SECURITY_HEADERS) expect(res.headers.has(k)).toBe(true);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Strict-Transport-Security")).toContain("max-age=");
  });

  it("middleware wraps every response with withSecurityHeaders", () => {
    const src = readFileSync("src/middleware.ts", "utf8");
    expect(src).toMatch(/return withSecurityHeaders\(await route\(req\)\)/);
  });
});
