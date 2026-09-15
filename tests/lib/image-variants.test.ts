import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import imageLoader, { pickVariantWidth } from "@/lib/image-loader";

// Cloudflare Pages serves no image optimizer; next/image goes through
// src/lib/image-loader.ts onto WebP variants generated in `prebuild`
// (scripts/gen-image-variants.mjs). These pin the mapping and the wiring.
describe("image loader (Cloudflare Pages, pre-generated WebP)", () => {
  it("maps local raster images to the smallest variant >= requested width", () => {
    expect(imageLoader({ src: "/images/hero/homepage.jpg", width: 640 })).toBe("/images/hero/homepage-640.webp");
    expect(imageLoader({ src: "/images/hero/homepage.jpg", width: 750 })).toBe("/images/hero/homepage-1080.webp");
    expect(imageLoader({ src: "/images/hero/homepage.jpg", width: 1200 })).toBe("/images/hero/homepage-1920.webp");
    expect(imageLoader({ src: "/images/hero/homepage.jpg", width: 3840 })).toBe("/images/hero/homepage-1920.webp");
    expect(imageLoader({ src: "/images/x/y.PNG", width: 100 })).toBe("/images/x/y-640.webp");
    expect(pickVariantWidth(1)).toBe(640);
  });

  it("leaves remote URLs, SVGs and non-/images paths untouched", () => {
    expect(imageLoader({ src: "https://images.unsplash.com/a.jpg", width: 640 })).toBe("https://images.unsplash.com/a.jpg");
    expect(imageLoader({ src: "/images/balloons/deluxe.svg", width: 640 })).toBe("/images/balloons/deluxe.svg");
    expect(imageLoader({ src: "/og/x.jpg", width: 640 })).toBe("/og/x.jpg");
  });

  it("prebuild generates the variants and next.config uses the custom loader", () => {
    const root = path.resolve(__dirname, "../..");
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(pkg.scripts.prebuild).toContain("gen-image-variants.mjs");
    const cfg = fs.readFileSync(path.join(root, "next.config.js"), "utf8");
    expect(cfg).toMatch(/loader:\s*"custom"/);
    expect(cfg).toMatch(/loaderFile:\s*"\.\/src\/lib\/image-loader\.ts"/);
    const gi = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
    expect(gi).toContain("*-1920.webp");
  });
});
