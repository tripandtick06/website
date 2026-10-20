import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import { siteGraphSchema, webPageSchema, videoObjectSchema } from "@/lib/schema";
import { ACTIVITY_SEO, getActivitySeo } from "@/data/activitySeo";
import { ACTIVITIES } from "@/data/services/catalog";
import { PAGE_UPDATED } from "@/lib/page-dates";
import { fromPriceShort } from "@/lib/price-label";

const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
const words = (s: string) => s.trim().split(/\s+/).length;

describe("geo wave 4 — site-wide", () => {
  it("robots names every citation bot with Allow /", () => {
    const rules = ([] as unknown[]).concat(robots().rules) as { userAgent: string; allow?: string }[];
    for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot", "Applebot"]) {
      const r = rules.find((x) => x.userAgent === bot);
      expect(r, bot).toBeTruthy();
      expect(r?.allow).toBe("/");
    }
  });

  it("site graph = Organization + WebSite with @id", () => {
    const g = siteGraphSchema("tr")["@graph"] as { "@type": string | string[]; "@id": string }[];
    expect(g).toHaveLength(2);
    expect(g.some((n) => n["@type"] === "WebSite")).toBe(true);
    expect(g.some((n) => [n["@type"]].flat().includes("TravelAgency") || [n["@type"]].flat().includes("Organization"))).toBe(true);
    for (const n of g) expect(n["@id"]).toMatch(/#/);
  });

  it("layout emits the graph and the RSS link", () => {
    const l = read("src/app/[locale]/layout.tsx");
    expect(l).toContain("siteGraphSchema(locale)");
    expect(l).toMatch(/type="application\/rss\+xml"/);
    expect(l).toContain('property="og:site_name" content="Trip and Tick"');
  });

  it("webPageSchema carries description + Organization author", () => {
    const w = webPageSchema({ url: "https://x/y", name: "n", locale: "tr", dateModified: "2026-01-01", description: "d", withAuthor: true });
    expect(w.description).toBe("d");
    expect((w as { author: { "@type": string } }).author["@type"]).toBe("Organization");
  });

  it("videoObject has required fields", () => {
    const v = videoObjectSchema({ name: "n", description: "d", src: "/videos/a.mp4", poster: "/p.jpg", uploadDate: "2026-09-16", pageUrl: "https://x" });
    expect(v["@type"]).toBe("VideoObject");
    expect(v.contentUrl).toMatch(/^https:\/\/.*\/videos\/a\.mp4$/);
  });

  it("PAGE_UPDATED dates are ISO", () => {
    for (const d of Object.values(PAGE_UPDATED)) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("geo wave 4 — activity query copy", () => {
  it("covers every activity slug", () => {
    for (const a of ACTIVITIES) expect(ACTIVITY_SEO[a.slug], a.slug).toBeTruthy();
  });

  it("limits (title<=44, desc<=155, answer 40-62 words, 2-5 FAQ) + no net prices", () => {
    const bad: string[] = [];
    for (const a of ACTIVITIES) {
      for (const loc of ["tr", "en"] as const) {
        const s = getActivitySeo(a.slug, loc)!;
        const from = fromPriceShort(loc, a.adultPrice, a.currency);
        const f = (t: string) => t.replace(/\{from\}/g, from);
        const k = `${a.slug} ${loc}`;
        const t = f(s.title).length;
        const d = f(s.description).length;
        const n = words(f(s.answer));
        if (t > 44) bad.push(`${k} title ${t}: ${f(s.title)}`);
        if (d > 155) bad.push(`${k} desc ${d}`);
        if (n < 40 || n > 62) bad.push(`${k} answer words ${n}`);
        if (s.faqs.length < 2 || s.faqs.length > 5) bad.push(`${k} faqs ${s.faqs.length}`);
        const all = [s.title, s.description, s.answer, ...s.faqs.flatMap((q) => [q.q, q.a])].join(" ");
        if (/(165|215|295)/.test(all)) bad.push(`${k} legacy price`);
        if (/€\s?\d|\d\s?€|EUR\s?\d/.test(all)) bad.push(`${k} net price`);
        if (/\|\s*Trip and Tick/.test(s.title)) bad.push(`${k} hardcoded brand`);
      }
    }
    expect(bad).toEqual([]);
  });
});
