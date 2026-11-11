import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { wantsMarkdown, markdownHomeResponse, HOME_MARKDOWN } from "@/lib/markdown-home";

describe("homepage markdown negotiation", () => {
  it("wantsMarkdown only when text/markdown is requested", () => {
    expect(wantsMarkdown("text/markdown")).toBe(true);
    expect(wantsMarkdown("text/markdown, text/html;q=0.5")).toBe(true);
    expect(wantsMarkdown("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(false);
    expect(wantsMarkdown("*/*")).toBe(false);
    expect(wantsMarkdown(null)).toBe(false);
  });

  it("response is 200 text/markdown, Vary: Accept, no-store", async () => {
    const res = markdownHomeResponse();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/markdown/);
    expect(res.headers.get("vary")).toBe("Accept");
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.text();
    expect(body).toBe(HOME_MARKDOWN);
    expect(body).toMatch(/^# Trip and Tick/);
    expect(body).not.toMatch(/\+90|KvK/i);
  });

  it("middleware routes only '/' + text/markdown to the handler", () => {
    const src = fs.readFileSync(path.join(__dirname, "../../src/middleware.ts"), "utf8");
    expect(src).toMatch(/pathname === "\/" && wantsMarkdown\(req\.headers\.get\("accept"\)\)/);
  });
});

describe("public/ai/summary.json", () => {
  it("is a valid object with name >=3 and description >=20 chars", () => {
    const raw = fs.readFileSync(path.join(__dirname, "../../public/ai/summary.json"), "utf8");
    const j = JSON.parse(raw);
    expect(typeof j.name).toBe("string");
    expect(j.name.length).toBeGreaterThanOrEqual(3);
    expect(typeof j.description).toBe("string");
    expect(j.description.length).toBeGreaterThanOrEqual(20);
    expect(raw).not.toMatch(/\+90|KvK|whatsapp/i);
  });
});
