# CLAUDE.md — Trip and Tick (tripandtick.com)

Kapadokya OTA: balon turu + otel + aktivite + gunluk tur + paket. Next.js 14
App Router, server-first RSC, TR primary (next-intl EN ikinci).

## Klasor mimari (kisa)

- `src/app/` — Next.js route'lari (App Router). `api/` server routes + RSC pages.
- `src/components/` — `booking/` (form/cookie), `layout/` (Header/Footer/JsonLd),
  `sections/` (Hero/Stats/Categories/...), `ui/` (Radix primitives).
- `src/data/` — static product/service data (balonlar, hotels, packages).
- `src/lib/` — utils, Stripe + Anthropic clients.
- `src/styles/` — globals.css (Tailwind layer + custom util classes).
- `src/types/` — shared TS types.
- `public/` — assets + `llms.txt` + `llms-full.txt`.
- `scripts/` — `seo-agent.ts`, `psi-audit.cjs`.

## Code style

- TypeScript **strict**. `any` yasak — gerekiyorsa `unknown` + narrow.
- Tailwind utility-first. Custom utility: `container-main`, `btn-accent`,
  `shadow-card`, `shadow-glow`. Renkler: `primary` (#1A2B6B), `accent` (#FF6B35).
- App Router: **server-first** — `"use client"` sadece state/event/browser API
  gerektiginde. RSC default.
- File naming: components `PascalCase.tsx`, routes `page.tsx`/`layout.tsx`.
- Import alias: `@/*` -> `src/*`.
- Tailwind opacity: `bg-primary/[0.08]` syntax (slash + bracket), `bg-primary/8` YASAK.
- Lucide: `UserPen` mevcut degil -> `PenLine` kullan.
- `tsconfig.json` target: `ES2020` (dokunma).

## Test komutu

```bash
npx next build           # production build = test gate
npm run lint             # ESLint
node scripts/psi-audit.cjs https://tripandtick.com  # Lighthouse PSI
```

Build yesil olmadan commit yapma. Hata cikarsa once fix.

## Onemli notlar

- **Admin demo**: `/admin` route, demo creds env'den (`ADMIN_DEMO_USER` /
  `ADMIN_DEMO_PASS`). Production'da gercek auth gerekli (NextAuth/Clerk).
- **Stripe test mode**: `pk_test_*` / `sk_test_*` keys. Live'a gecmeden once
  webhook secret rotate + reconciliation logic test.
- **Hooks**: GateGuard PreToolUse aktif — Write/Edit oncesi facts gerekli
  (callers, glob, data, user-verbatim). Bypass etme.
- **Master push pre-authorized** (user standing instruction). Direct push OK.
- **Cookie banner**: `tripandtick:consent` localStorage key. KVKK + GDPR
  compliant, /cerez-politikasi link zorunlu.
- **Multi-agent isolation**: Paralel agent'lar farkli dosyalara yazar; ayni
  dosyaya yazma cakismasini onlemek icin Task list owner kontrolu.
- **Build cache**: `.next/` ignored; lokal `next-env.d.ts` auto-gen.
