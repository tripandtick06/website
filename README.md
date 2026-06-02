# Trip and Tick — tripandtick.com

Kapadokya odakli online seyahat acentasi (OTA). Sicak hava balonu turu, otel
rezervasyonu, ATV/at/jeep aktiviteleri ve gunluk turlar tek catida. Multi-dil,
multi-operator, anlik fiyatlandirma, Stripe odeme.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, RSC server-first) |
| Language | TypeScript 5 strict |
| Styling | Tailwind CSS + custom design tokens |
| UI prim. | Radix UI (Dialog/Select/Popover/Tabs/Accordion) |
| Icons | lucide-react |
| Animations | framer-motion |
| Forms / val. | zod |
| i18n | next-intl (TR + EN, locales/) |
| Payments | Stripe + @stripe/stripe-js (test mode) |
| AI agent | @anthropic-ai/sdk (SEO agent + content gen) |
| Hosting | Cloudflare Pages (production) — `@cloudflare/next-on-pages` adapter |

## Klasor mimari

```
src/
  app/                  # Next.js App Router routes
    api/                # /api/health, /api/og, IndexNow, iCal, Stripe webhook
    admin/              # /admin demo panel
    balonlar/           # balon listeleme + [slug]
    oteller/            # otel listeleme
    aktiviteler/        # ATV / at / jeep
    turlar/             # gunluk turlar
    paketler/           # combo paketler
    rezervasyon/        # 6-adim booking flow
    odeme/              # Stripe Checkout return
    blog/               # icerik pillar
    sss/                # SSS pillar
    hakkimizda/, iletisim/
    cerez-politikasi/   # KVKK/GDPR
  components/
    booking/            # SearchWidget, CookieConsent, CookieConsentMount
    layout/             # Header, Footer, Breadcrumb, PageHero, JsonLd
    sections/           # HeroSection, CategoriesSection, StatsBar, ...
    ui/                 # shadcn-style primitives
  data/                 # static data: balonlar.ts, hotels.ts, packages.ts
  lib/                  # utils, stripe-client, anthropic-client
  styles/               # globals.css
  types/                # shared TS types
public/                 # static assets, icons/, images/, llms.txt, llms-full.txt
scripts/                # seo-agent.ts, psi-audit.cjs
locales/                # next-intl TR/EN messages
```

## Setup

```bash
git clone <repo-url> tripandtick
cd tripandtick
npm install --legacy-peer-deps
cp .env.local.template .env.local
# .env.local dosyasini gercek key'lerle doldur
npm run dev
# http://localhost:3000
```

`--legacy-peer-deps` zorunlu: Radix UI + next-intl peer-dep matrix Next 14 ile
strict mode'da catismaktadir.

## Env variables

Tum keyler `.env.local` icinde, `.env.local.template` referans. Ozet:

| Key | Aciklama | Zorunlu |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production canonical, orn https://tripandtick.com | Evet |
| `ANTHROPIC_API_KEY` | SEO agent + content gen, `tripandtick-seo-*` scoped key | Evet (agent icin) |
| `STRIPE_SECRET_KEY` | Stripe server (test: `sk_test_...`) | Evet (odeme) |
| `STRIPE_PUBLISHABLE_KEY` | Client (test: `pk_test_...`) | Evet (odeme) |
| `STRIPE_WEBHOOK_SECRET` | `/api/stripe/webhook` imza dogrulamasi | Evet (prod) |
| `GOOGLE_PSI_KEY` | PageSpeed Insights audit, `scripts/psi-audit.cjs` | Opsiyonel |
| `INDEXNOW_KEY` | Bing/Yandex anlik index ping | Opsiyonel |
| `BREVO_API_KEY` | Email capture / transactional | Opsiyonel |
| `ADMIN_DEMO_USER` / `ADMIN_DEMO_PASS` | /admin paneli demo creds | Opsiyonel |

## Supabase setup (Faz 2)

TripAndTick canli DB icin Supabase + Postgres. Env yoksa kod mock-fallback
(mock-bookings.ts + availability-store.ts) ile calismaya devam eder; production
icin asagidaki adimlari yap:

1. **Project create**: <https://supabase.com/dashboard> -> "New project". Region
   `eu-central` (Frankfurt). Database password olustur, kaybetme.
2. **Migration**: Project -> SQL Editor -> "New query". `supabase/migrations/0001_initial_schema.sql`
   icerigini yapistir + Run. 8 tablo + RLS + trigger olusur (idempotent).
3. **Seed (opsiyonel)**: SQL Editor -> `supabase/seed.sql` yapistir + Run.
   10 musteri, 5 booking, 90 satir availability, 6 coupon test verisi.
4. **Env keys**: Settings -> API:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-safe, RLS uygulanir)
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (SERVER-ONLY, RLS bypass —
     sadece backend admin operasyonlari icin, ASLA client-bundle'a koyma)
5. **Cloudflare Pages env**: Dashboard -> tripandtick (Pages) -> Settings ->
   Environment variables. Tum 3 keyi Production + Preview icin ekle.
6. **Dogrula**: `npx next dev` baslat -> /api/health 200 OK + booking submit
   sonrasi Supabase Studio -> Table editor -> bookings'te yeni satir.

### RLS politikalari (deny-by-default)

- `availability`: public SELECT (rezervasyon takvimi).
- `reviews`: public SELECT WHERE `published = TRUE`.
- `coupons`: public SELECT WHERE `active = TRUE` (kod dogrulama).
- `customers`, `bookings`, `loyalty_transactions`, `agencies`, `email_log`:
  hicbir public erisim — sadece `service_role` admin client RLS bypass eder.

## Scripts

```bash
npm run dev              # Next dev server (port 3000)
npm run build            # Production build
npm start                # Production server
npm run lint             # ESLint
npm run seo-agent        # Tek seferlik SEO agent (manuel)
npm run seo-agent:daily  # Daily cron variant (autonom 4h batch)
node scripts/psi-audit.cjs https://tripandtick.com
                         # PSI audit (mobile+desktop) -> scripts/logs/psi-*.json
```

## Deploy (Cloudflare Pages)

Cloudflare Pages + `@cloudflare/next-on-pages` adapter ile edge-runtime
deploy. Vercel YOK — domain de Cloudflare uzerinde.

```bash
npm i -g wrangler
wrangler login
npm run build:cf            # @cloudflare/next-on-pages -> .vercel/output/static
wrangler pages deploy .vercel/output/static --project-name=tripandtick
```

Alternatif: Cloudflare dashboard -> Pages -> Connect GitHub `tripandtick06/website` -> auto-deploy her push'ta.

> **API Token izinleri:** GitHub Actions deploy'u icin gereken Cloudflare API
> Token'i, Cloudflare Dashboard -> My Profile -> API Tokens bolumunden
> `Edit Cloudflare Pages` template'i kullanilarak olusturulmali ve ek olarak
> **`User -> User Details -> Read`** izni eklenmelidir. Bu izin eksik oldugunda
> deploy `Authentication error [code: 10000]` ile basarisiz olur. Tam liste:
> [`CLOUDFLARE_TOKEN_PERMISSIONS.md`](./CLOUDFLARE_TOKEN_PERMISSIONS.md).

Build ayarlari (Cloudflare Pages dashboard):
- Framework preset: `Next.js`
- Build command: `npm run build:cf`
- Build output: `.vercel/output/static`
- Node version: `20`
- Compatibility flag: `nodejs_compat`

1. Cloudflare Pages -> Settings -> Environment variables: yukaridaki tum
   anahtarlari ekle (Production + Preview).
2. Domain: `tripandtick.com` + `www.tripandtick.com` -> Pages -> Custom domains.
   DNS zaten Cloudflare'de oldugu icin CNAME otomatik gelir.
3. Stripe: live mode'a gec, webhook endpoint `https://tripandtick.com/api/stripe/webhook`,
   `STRIPE_WEBHOOK_SECRET` rotate et.
4. `/api/health` 200 OK kontrolu post-deploy.
5. SEO agent cron: Cloudflare dashboard -> Workers & Pages -> tripandtick ->
   Settings -> Triggers -> Cron trigger `0 6 * * *` -> path `/api/seo-agent`.

## Faz roadmap

- **Faz 1** (DONE): Tasarim sistemi, anasayfa, kategori sayfalari, balon detay,
  6-adim booking iskelesi, Stripe Checkout test, admin demo, cookie consent,
  KVKK/GDPR, llms.txt, sitemap/robots, /api/health + /api/og.
- **Faz 2** (next): Gercek operator entegrasyonu (Voyager/Royal/Cappadocia),
  multi-currency (TRY/EUR/USD), TR/EN locale routing live, blog ilk 20 pillar,
  Brevo email capture E2E, Stripe live + webhook reconciliation.
- **Faz 3**: TripAdvisor/Trustpilot review widget, Google Hotel Ads feed,
  PWA offline shell, IndexNow auto-ping postbuild, multi-lang content agent
  (TR/EN + DE/RU/ZH), Lighthouse 95+ tum sayfalarda.

## Lisans

Proprietary. Tum haklar Trip and Tick'e aittir. Kaynak kod yetkisiz dagitilamaz.
