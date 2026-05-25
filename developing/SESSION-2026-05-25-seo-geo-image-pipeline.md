# SESSION 2026-05-25 — SEO/GEO Uplift + Image Pipeline

**Master**: `8850026` = origin (5 commit pushed)
**Build**: 1018 SSG, tsc clean
**Scope**: SEO/GEO + 30 Imagen-4 photo + next/image integration

## Commits

| SHA | Title |
|---|---|
| `1fd63a6` | feat(seo): GEO+SEO uplift — schema, blog, llms refresh |
| `bcec989` | feat(images): Wave 1 — pipeline + og/hero/3 balloon |
| `7663761` | feat(images): Wave 2 — 7 hotel + 5 tour photos |
| `c6250ae` | feat(images): Wave 3+4 — activities + packages + blog heroes |
| `8850026` | feat(images): next/image integration + blog coverImage |

## Research Phase (6 parallel agents)

User instructed: "kac tane gerekiyorsa o kadar agent" (use as many agents as needed). Single message dispatched 6 agents:

| Agent | Type | Output |
|---|---|---|
| A | seo-specialist | Tech-SEO + GEO audit; 30+ Cappadocia stats draft for llms-full.txt |
| B | general-purpose | 3 full blog articles (EN/DE/TR) + 7 outlines |
| C | general-purpose | `docs/backlink-pr-outreach-kit.md` (~4700 words) |
| D | general-purpose | `scripts/gen-sitemap-image.cjs`; image audit (found site image-less) |
| E | general-purpose | GMB profile + 50 Q&A + 25-directory citation + Yandex Business |
| F | caveman:cavecrew-builder | iyzico cleanup (premise wrong — already removed) |

## SEO/GEO Fixes Detail

### Schema (P0)
- **Blog slug schema**: `src/app/[locale]/blog/[slug]/page.tsx` switched from inline JSON-LD to `articleSchema()` + `breadcrumbSchema()` helpers. Author now Person (FOUNDER.name) with authorUrl. Keywords from article tags.
- **`articleSchema()` extended**: added `authorType: "Person"|"Organization"`, `authorUrl`, `keywords` (additive, backwards-compat).
- **Sitemap canonical**: blog URL was `/${a.locale}/blog/${a.slug}` (locale-prefix-per-article); now `/tr/blog/${slug}` matching other dynamic pages. hreflang alternates cover EN/DE/etc.

### Schema (P1)
- **ItemList + FAQPage** on 4 listing pages: `/turlar`, `/aktiviteler`, `/paketler`, `/transferler` — 5 FAQ Q&A per page. Used existing `itemListSchema()` + `faqPageSchema()` helpers.
- **`/yorum` indexable**: removed `robots: noindex` (review pages = E-E-A-T trust signal).

### NAP + llms
- **`ImpressumContent.tsx`**: 3 hard-coded strings (`+90 537 464 78 61`, `info@tripandtick.com`) → `COMPANY.phone` / `COMPANY.email` refs.
- **`public/llms.txt`**: URLs now have `/tr/*` locale-prefix (matches sitemap canonical). Phone fixed to real number.
- **`public/llms-full.txt`**: phone fix + sections 15-17 (40+ cite-friendly Cappadocia stats — 3.7M tourists, 12 operators, 1200+ hotels, customer profile data).

### Blog content (7 → 10 articles)
- `en-cappadocia-winter-2026-guide.json` (~1850 words)
- `de-heissluftballon-kappadokien-preise.json` (~1750 words)
- `tr-kapadokya-dugun-fotografciligi.json` (~1900 words)
- `index.ts` updated with imports + ARTICLES array

## Image Pipeline Detail

### Script: `scripts/gen-tt-images.py`
- Adapted from `aanloop/scripts/gen-ai-image.py`
- Backends: Imagen-4 (best, ~$0.03/img) or Gemini 2.5 Flash Image (~$0.01/img)
- API key load: env → `.env.local` → `../aanloop/.env.local` fallback
- Cache-aware (skip if output exists)
- CLI: `--all` / `--wave <N>` / `--category <cat>` / `--scene <id>` / `--manifest`

### Scene Inventory (30 total)
- Wave 1 (5): og-default, homepage, 3 balloons — **essentials**
- Wave 2 (12): 7 hotels, 5 tours — **listing thumbnails**
- Wave 3 (10): 6 activities, 4 packages — **listing thumbnails**
- Wave 4 (3): blog heroes — **content visuals**

### Output (~6.7MB total)
```
public/images/
├── og/og-default.jpg                  (1200x630)
├── hero/homepage.jpg                  (1920x1080)
├── balloons/{standart,deluxe,romantik}-balon-ucusu.jpg
├── hotels/<7 slugs>.jpg
├── tours/<5 slugs>.jpg
├── activities/<6 slugs>.jpg
├── packages/<4 slugs>.jpg
└── blog/<3 slugs>.jpg
```

### Data Refs Updated
- `src/data/services/balloons.ts`: 3 packages `images: [...]` real paths
- `src/data/services/catalog.ts`: 17 ServiceItem entries gain `photoUrl`
- `src/lib/schema.ts`: 4× `og-default.jpg` → `/images/og/og-default.jpg`
- `src/data/blog/index.ts`: `BlogArticle.coverImage?: string` interface field
- 3 Wave-4 JSONs: `coverImage` value populated

## next/image Integration (8850026)

### `src/components/layout/ServiceCard.tsx`
Conditional render: `item.photoUrl` → `<NextImage fill sizes="..." className="object-cover" />`, else gradient + emoji/icon fallback. Badge + rating moved to `z-10`.

### `src/app/[locale]/balonlar/BalonlarContent.tsx`
Balloon package cards: `pkg.images[0]` → `<NextImage priority />` (above-the-fold), Wind icon fallback.

### `next.config.js`
```js
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 64, 96, 128, 256, 384],
  remotePatterns: [/* ... */],
}
```

### Critical TS Workaround
`import Image from "next/image"` collides with TS lib.dom `Image` constructor → TS2607/TS2786. **Must use `import NextImage from "next/image"`**.

### Blog page schema
`articleSchema({ ..., image: article.coverImage })` — passes coverImage to JSON-LD; falls back to og-default if undefined.

## Reference Deliverables (in repo)

- `docs/backlink-pr-outreach-kit.md` (~4700 words) — Tripadvisor listing draft, 20 travel-blog outreach (EN+DE), EN/DE press release, Booking/Expedia pitch, Reddit/YouTube outreach, 20-directory citation list.
- `scripts/gen-tt-images.py` — 30-scene Imagen-4 pipeline.
- `scripts/gen-sitemap-image.cjs` — Generates `public/sitemap-image.xml` (79 pages, 81 image entries). Not yet in postbuild.
- `public/sitemap-image.xml` — generated, ready for Google Image Search.

## Pending User-Action (P0 blockers)

1. **`src/data/founder.ts:77`** — TÜRSAB license `tursab: "A-XXXX"` placeholder → real value. Blocks citation submits + press release.
2. **`src/data/founder.ts:19-21`** — `FOUNDER.name = "Trip and Tick Ekibi"` → real founder name + title + bio. Enables Person schema authority.
3. **GMB profile verify** — Agent E content ready (750-char TR/EN descriptions, 15 services, 20 photo briefs, 50 Q&A).
4. **Tripadvisor + Booking.com + GetYourGuide submit** — Agent C kit ready.
5. **Brevo review-request automation** — T+3 day template drafted.
6. **Real photo shoot** (optional upgrade) — current 30 are AI; pro shoot replaces over time.

## Pending Code (Next Session)

- `BlogArticleContent.tsx` — render visual hero from `article.coverImage` (currently only in schema).
- `package.json` postbuild — add `node scripts/gen-sitemap-image.cjs`.
- PSI re-audit — measure LCP improvement from next/image AVIF/WebP.
- HotelsGrid + ServiceCard lazy loading tune.
- Operator card 10 logo (skip-able for now).
- Hardcoded TR 28 strings (b2b/admin scope-skipped earlier).

## What NOT to Retry

- `import Image from "next/image"` — TS lib.dom collision; **use `NextImage` alias**.
- `og-default.jpg` at root path — migrated to `/images/og/og-default.jpg`.
- Blog inline JSON-LD — use `articleSchema()` helper.
- iyzico cleanup — already removed in sessiyon-5.
- balloons.ts `-1.jpg` `-2.jpg` legacy refs — use single slug-based path.

## Imagen-4 Workflow Reference

```bash
# Inspect 30-scene manifest
python scripts/gen-tt-images.py --manifest

# Generate a wave
python scripts/gen-tt-images.py --wave 1   # 5 essentials
python scripts/gen-tt-images.py --wave 2   # 12 hotels+tours
python scripts/gen-tt-images.py --wave 3   # 10 activities+packages
python scripts/gen-tt-images.py --wave 4   # 3 blog heroes

# Category or single
python scripts/gen-tt-images.py --category hotels
python scripts/gen-tt-images.py --scene og-default

# Cheaper model
python scripts/gen-tt-images.py --model gemini --all
```

Cost: ~$0.03/img Imagen, ~$0.01/img Gemini. Cache-aware — re-runs skip existing.
