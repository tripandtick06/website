import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://tripandtick.com";
});

import sitemap from "@/app/sitemap";
import { PAGE_UPDATED } from "@/lib/page-dates";
import { sitemapArticles, blogArticleUrl } from "@/lib/blog-alternates";
import { allPublicPaths, toAbsolute } from "@/lib/public-paths";

const SITE = "https://tripandtick.com";
const day = (d: string | Date | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");

// 2026-11-11: sitemap lastmod was frozen at June dates while content changed in
// Sep-Nov, so crawlers had no freshness signal after the GEO waves. These guards
// pin lastmod to the same sources the pages themselves show.
describe("sitemap lastmod freshness", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((e) => [e.url, e]));

  it("static page lastmod = PAGE_UPDATED (visible date / JSON-LD dateModified)", () => {
    for (const [path, date] of Object.entries(PAGE_UPDATED)) {
      const e = byUrl.get(`${SITE}${path === "/" ? "" : path}`);
      if (!e) continue; // page not in sitemap (e.g. noindex)
      expect(day(e.lastModified), path).toBe(date);
    }
  });

  it("blog lastmod = updatedAt (falls back to publishedAt)", () => {
    for (const a of sitemapArticles()) {
      const e = byUrl.get(blogArticleUrl(a));
      if (!e) continue; // deduped against a pillar URL
      expect(day(e.lastModified), a.slug).toBe(day(a.updatedAt || a.publishedAt));
    }
  });

  it("data-file constants are not older than the file's last git commit", () => {
    let shallow = "true";
    try {
      shallow = execSync("git rev-parse --is-shallow-repository", { encoding: "utf8" }).trim();
    } catch {
      return; // no git (tarball build) — nothing to compare against
    }
    if (shallow === "true") return; // CI shallow checkout: history unavailable
    const src = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    const files: Record<string, string> = {
      BALLOONS_UPDATED_AT: "src/data/services/balloons.ts",
      CATALOG_UPDATED_AT: "src/data/services/catalog.ts",
      OPERATORS_UPDATED_AT: "src/data/services/operators.ts",
    };
    for (const [name, file] of Object.entries(files)) {
      const m = src.match(new RegExp(`${name} = new Date\\("([0-9-]+)"\\)`));
      expect(m, name).not.toBeNull();
      const committed = execSync(`git log -1 --format=%cs -- ${file}`, { encoding: "utf8" }).trim();
      if (!committed) continue;
      expect(m![1] >= committed, `${name} (${m![1]}) older than last commit of ${file} (${committed}) — bump it`).toBe(true);
    }
  });
});

describe("IndexNow path list (allPublicPaths)", () => {
  it("every blog URL it emits is also a sitemap URL (no 404 shapes)", () => {
    const sitemapUrls = new Set(sitemap().map((e) => e.url));
    const blog = allPublicPaths()
      .filter((p) => /\/blog\//.test(p))
      .map((p) => toAbsolute(p, SITE));
    expect(blog.length).toBeGreaterThan(0);
    for (const u of blog) expect(sitemapUrls.has(u), u).toBe(true);
  });
});
