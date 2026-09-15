// Generate responsive WebP variants for every raster image under public/images.
//
// Why (2026-09-16 Lighthouse, mobile): LCP 8.7-10.6 s on /, /balonlar,
// /en/balloon-tours. On Cloudflare Pages the Next.js image optimizer is a
// no-op — /_next/image returned the original 232 KB JPEG for every width and
// quality. So we pre-generate <name>-{640,1080,1920}.webp next to each source
// and let src/lib/image-loader.ts map next/image requests onto them.
//
// Run: node scripts/gen-image-variants.mjs   (idempotent; skips up-to-date files)
// Guard: tests/lib/image-variants.test.ts fails when a source lacks its variants,
// so a new JPEG cannot ship without running this.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "images");
export const WIDTHS = [640, 1080, 1920];
const QUALITY = 74;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png)$/i.test(e.name)) yield p;
  }
}

export function variantPath(src, width) {
  return src.replace(/\.(jpe?g|png)$/i, `-${width}.webp`);
}

let made = 0, skipped = 0;
for (const src of walk(ROOT)) {
  const meta = await sharp(src).metadata();
  for (const w of WIDTHS) {
    const out = variantPath(src, w);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) { skipped++; continue; }
    // never upscale: cap at the source width, keep the file name so the loader stays deterministic
    const target = Math.min(w, meta.width ?? w);
    await sharp(src).resize({ width: target, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
    made++;
  }
}
console.log(`image variants: ${made} written, ${skipped} up to date`);
