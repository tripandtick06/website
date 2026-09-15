// Custom next/image loader for Cloudflare Pages (no server-side optimizer).
//
// Maps local raster images under /images/** to the pre-generated WebP
// variants produced by scripts/gen-image-variants.mjs (640 / 1080 / 1920 px),
// picking the smallest variant that is >= the width next/image asks for.
// Anything else (remote URLs, SVG, already-webp) is returned untouched.
//
// Wired via next.config.js images.loader = "custom" / loaderFile. Kept as a
// pure function so tests/lib/image-variants.test.ts can pin the mapping.

const VARIANT_WIDTHS = [640, 1080, 1920] as const;

export function pickVariantWidth(width: number): number {
  return VARIANT_WIDTHS.find((w) => w >= width) ?? VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
}

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("/images/") && /\.(jpe?g|png)$/i.test(src)) {
    return src.replace(/\.(jpe?g|png)$/i, `-${pickVariantWidth(width)}.webp`);
  }
  return src;
}
