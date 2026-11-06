// Guard (2026-11-06 security audit): admin money/ops routes must never accept the
// old public fallback token "demo-admin-token-rotate-me" when ADMIN_API_TOKEN is unset.
import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

const FALLBACK = "demo-admin-token-rotate-me";

async function call(modPath: string, method: string, token?: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production"); // demo- kisayolu yalniz non-prod
  const mod = await import(modPath);
  const req = new NextRequest("https://tripandtick.com/api/admin/x", {
    method,
    headers: token ? { "x-admin-token": token, "content-type": "application/json" } : { "content-type": "application/json" },
    body: method === "GET" || method === "DELETE" ? undefined : "{}",
  });
  return mod[method](req);
}

describe("admin routes fail closed", () => {
  const prev = process.env.ADMIN_API_TOKEN;
  afterEach(() => {
    vi.unstubAllEnvs();
    if (prev === undefined) delete process.env.ADMIN_API_TOKEN;
    else process.env.ADMIN_API_TOKEN = prev;
  });

  for (const [path, method] of [
    ["@/app/api/admin/refund/route", "POST"],
    ["@/app/api/admin/reschedule/route", "POST"],
    ["@/app/api/admin/service-override/route", "POST"],
  ] as const) {
    it(`${path} rejects the fallback token when ADMIN_API_TOKEN is unset`, async () => {
      delete process.env.ADMIN_API_TOKEN;
      const res = await call(path, method, FALLBACK);
      expect(res.status).toBe(401);
    });
    it(`${path} rejects a wrong token when ADMIN_API_TOKEN is set`, async () => {
      process.env.ADMIN_API_TOKEN = "a-real-secret-value-123";
      const res = await call(path, method, FALLBACK);
      expect(res.status).toBe(401);
    });
  }
});
