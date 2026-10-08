// <title> length guard. Final title = page title + layout title.template
// (brand suffix, 16 chars). Search engines truncate near 60 chars, so dynamic
// titles (blog/service/hotel/operator names) are clamped to the remaining
// budget at a word boundary with an ellipsis.
// Suffix kept as a LENGTH, not a string: seo-guards flags any second
// hardcoded copy of the layout suffix as a doubled-title risk.
export const TITLE_BRAND_SUFFIX_LEN = 16;
export const TITLE_MAX = 60;

export function clampTitle(title: string): string {
  const budget = TITLE_MAX - TITLE_BRAND_SUFFIX_LEN;
  if (title.length <= budget) return title;
  const head = title.slice(0, budget - 1);
  const lastSpace = head.lastIndexOf(" ");
  const cut = lastSpace >= budget * 0.6 ? head.slice(0, lastSpace) : head;
  return cut.replace(/[\s,;:|\-–—(&]+$/u, "") + "…";
}
