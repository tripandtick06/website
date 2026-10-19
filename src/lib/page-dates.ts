// Single source for the visible "last updated" date + JSON-LD dateModified of
// the three money pages. Bump the date when the page content really changes.
// Guard: tests/lib/geo-wave-1019.test.ts
export const PAGE_UPDATED = {
  "/": "2026-10-19",
  "/turlar": "2026-10-19",
  "/balonlar": "2026-10-19",
} as const;
