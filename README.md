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
| Hosting | Vercel (production) |

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

## Deploy (Vercel)

```bash
npm i -g vercel
vercel login
vercel link             # ilk seferinde proje secimi
vercel --prod           # production deploy
```

1. Vercel dashboard -> Settings -> Environment Variables: yukaridaki tum
   anahtarlari ekle (Production + Preview).
2. Domain bag: `tripandtick.com` + `www.tripandtick.com` -> Vercel DNS A/CNAME.
3. Stripe: live mode'a gec, webhook endpoint `https://tripandtick.com/api/stripe/webhook`,
   `STRIPE_WEBHOOK_SECRET` rotate et.
4. `/api/health` 200 OK kontrolu post-deploy.

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
