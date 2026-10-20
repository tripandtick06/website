// Single source for the visible "last updated" date + JSON-LD dateModified.
// Bump the date when the page content really changes (money pages: 2026-10-19;
// the other entries are the real last-change dates of each page's source).
// Guard: tests/lib/geo-wave-1019.test.ts, tests/lib/geo-wave-w4.test.ts
export const PAGE_UPDATED = {
  "/": "2026-10-19",
  "/turlar": "2026-10-19",
  "/balonlar": "2026-10-19",
  "/blog": "2026-10-20",
  "/yorum": "2026-10-18",
  "/kvkk": "2026-06-03",
  "/gizlilik-politikasi": "2026-06-03",
  "/cerez-politikasi": "2026-09-19",
  "/gdpr": "2026-06-03",
  "/impressum": "2026-09-15",
  "/iptal-iade-politikasi": "2026-06-03",
  "/kullanim-sartlari": "2026-06-03",
  "/sss": "2026-06-03",
  "/hakkimizda": "2026-09-15",
  "/iletisim": "2026-10-11",
  "/operatorler": "2026-10-08",
} as const;

export type UpdatedPath = keyof typeof PAGE_UPDATED;
