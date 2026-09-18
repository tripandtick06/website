import { describe, it, expect, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isAdminRequest, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

// 2026-09-19: dört API route'undaki `isAdmin()` kopyası prod'da `ADMIN_TOKEN` env
// tanımsız olduğu için `demo-*` header'ı olan herkesi admin sayıyordu. Tek kapı +
// bu test; kopya geri gelirse "no route defines its own isAdmin" düşer.

const ROOT = path.resolve(__dirname, "../..");
const req = (headers: Record<string, string> = {}, cookie?: string) => ({
  headers: { get: (n: string) => headers[n.toLowerCase()] ?? null },
  cookies: { get: (n: string) => (cookie && n === ADMIN_COOKIE_NAME ? { value: cookie } : undefined) },
});

afterEach(() => vi.unstubAllEnvs());

describe("isAdminRequest", () => {
  it("accepts the httpOnly admin cookie or the ADMIN_API_TOKEN header", () => {
    vi.stubEnv("ADMIN_API_TOKEN", "s3cret-token-value");
    vi.stubEnv("NODE_ENV", "production");
    expect(isAdminRequest(req({}, "s3cret-token-value"))).toBe(true);
    expect(isAdminRequest(req({ "x-admin-token": "s3cret-token-value" }))).toBe(true);
    expect(isAdminRequest(req({ "x-admin-token": "s3cret-token-valuX" }))).toBe(false);
    expect(isAdminRequest(req({}, "wrong"))).toBe(false);
    expect(isAdminRequest(req())).toBe(false);
  });

  it("never accepts a demo- token in production, even when ADMIN_TOKEN is unset", () => {
    vi.stubEnv("ADMIN_API_TOKEN", "s3cret-token-value");
    vi.stubEnv("ADMIN_TOKEN", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(isAdminRequest(req({ "x-admin-token": "demo-admin-token-rotate-me" }))).toBe(false);
  });

  it("accepts demo- only outside production", () => {
    vi.stubEnv("ADMIN_API_TOKEN", "s3cret-token-value");
    vi.stubEnv("NODE_ENV", "development");
    expect(isAdminRequest(req({ "x-admin-token": "demo-local" }))).toBe(true);
  });

  it("no API route defines its own isAdmin/demo shortcut any more", () => {
    const dir = path.join(ROOT, "src/app/api");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name === "route.ts") files.push(p);
      }
    };
    walk(dir);
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8");
      expect(src, f).not.toMatch(/function isAdmin\(/);
      expect(src, f).not.toContain('startsWith("demo-")');
    }
  });
});
