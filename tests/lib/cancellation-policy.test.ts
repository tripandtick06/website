import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { refundTier } from "@/lib/cancellation-policy";
import { serverDict } from "@/lib/i18n/serverDict";
import type { Locale } from "@/lib/i18n/dictionaries";

const root = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("single cancellation policy: 48h free / 24-48h 50% / <24h none", () => {
  it("refundTier boundaries", () => {
    expect(refundTier(72).pct).toBe(100);
    expect(refundTier(48).pct).toBe(100);
    expect(refundTier(47.9).pct).toBe(50);
    expect(refundTier(24).pct).toBe(50);
    expect(refundTier(23.9).pct).toBe(0);
    expect(refundTier(0).pct).toBe(0);
  });

  it.each(["tr", "en", "de", "fr", "pt-BR", "ja", "ko"] as const)("policy page rows use 48h in %s", (loc) => {
    const d = (serverDict(loc as Locale) as any).page.iptal_iade_politikasi;
    expect(d.policy_row_time_72plus).toMatch(/48/);
    expect(d.policy_row_time_24_72).toMatch(/24\D+48/);
    expect(d.policy_row_time_72plus + d.policy_row_time_24_72 + d.meta_desc).not.toMatch(/72/);
  });

  it("no source file still states the old 72h / 4h thresholds", () => {
    for (const f of ["src/data/faq.ts", "src/data/i18n/pageFaqs.ts", "src/data/i18n/data.en.json", "src/data/i18n/_source.tr.json"]) {
      const s = read(f);
      expect(s, f).not.toMatch(/72\+|24-72|24–72|4\+ (saat|hours?)|from 4\+/);
    }
  });
});
