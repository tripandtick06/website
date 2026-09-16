import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { HERO_VIDEO, VIDEO_KEYS, getServiceVideo, videoForKey } from "@/data/services/videos";

// Cloudflare Pages tek dosya siniri 25 MiB — asilirsa deploy dosyayi SESSIZCE dusurur.
// 20 MiB'lik kilit bunun oncesinde patlar.
const MAX_BYTES = 20 * 1024 * 1024;
const PUBLIC = path.join(process.cwd(), "public");
const stat = (p: string) => fs.statSync(path.join(PUBLIC, p));

describe("service videos", () => {
  it("every non-hotel service slug resolves to a video", () => {
    const slugs = [...ACTIVITIES, ...TOURS, ...PACKAGES, ...TRANSFERS, ...BALLOON_PACKAGES].map((s) => s.slug);
    const missing = slugs.filter((s) => getServiceVideo(s) === null);
    expect(missing).toEqual([]);
  });

  it("hotels deliberately have no video (AI video of a real hotel would mislead)", () => {
    for (const h of HOTELS) expect(getServiceVideo(h.slug)).toBeNull();
  });

  it("every referenced mp4 + poster exists and stays under 20 MiB", () => {
    for (const key of VIDEO_KEYS) {
      const v = videoForKey(key);
      expect(stat(v.src).size, v.src).toBeGreaterThan(100_000);
      expect(stat(v.src).size, v.src).toBeLessThan(MAX_BYTES);
      expect(stat(v.poster).size, v.poster).toBeGreaterThan(10_000);
    }
  });

  it("hero videos (landscape + portrait) and poster exist under 20 MiB", () => {
    for (const p of [HERO_VIDEO.landscape, HERO_VIDEO.portrait]) {
      expect(stat(p).size, p).toBeGreaterThan(100_000);
      expect(stat(p).size, p).toBeLessThan(MAX_BYTES);
    }
    expect(stat(HERO_VIDEO.poster).size).toBeGreaterThan(10_000);
  });

  it("mp4 files are faststart (moov atom right after ftyp) so playback starts before full download", () => {
    for (const key of VIDEO_KEYS) {
      const buf = fs.readFileSync(path.join(PUBLIC, videoForKey(key).src)).subarray(0, 64);
      expect(buf.toString("latin1")).toContain("moov");
    }
  });
});
