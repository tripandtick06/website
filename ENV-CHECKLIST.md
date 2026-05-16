# TripAndTick — Production ENV Checklist (Cloudflare Pages)

Bu liste Cloudflare Pages Dashboard → Project → **Settings → Environment Variables** altinda `Production` (ve `Preview`) icin set edilir. Secret olanlar **Encrypted** olarak kayit edilmeli.

**Stripe-only canli mod**: `NEXT_PUBLIC_IYZICO_ENABLED=false` (iyzico merchant onay sureci tamamlanana kadar). iyzico tarafi UI'da "Yakinda" gorunur, Stripe (EUR/USD) tum kart turlerini Apple Pay / Google Pay / 3DS dahil kabul eder.

---

## 1. Site (zorunlu, public)

| Key | Tip | Deger |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | plain | `https://www.tripandtick.com` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | plain | `tr` |
| `NEXT_PUBLIC_IYZICO_ENABLED` | plain | `false` (Stripe-only mod) — iyzico aktiflesince `true` |

## 2. Stripe (zorunlu, prod-canli)

| Key | Tip | Aciklama |
|---|---|---|
| `STRIPE_SECRET_KEY` | **secret** | Stripe Dashboard → Developers → API keys → **Live secret key** (`sk_live_...`). Restricted key ise `Checkout sessions: write` + `Payment intents: read` + `Refunds: read` yetkili. |
| `STRIPE_WEBHOOK_SECRET` | **secret** | Stripe Dashboard → Developers → Webhooks → endpoint olustur → `whsec_...`. **Endpoint URL**: `https://www.tripandtick.com/api/stripe/webhook`. Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`. |

## 3. iyzico (su an PASSIVE — onay sonrasi aktif)

| Key | Tip | Aciklama |
|---|---|---|
| `IYZICO_API_KEY` | **secret** | iyzico Merchant Panel → API Anahtarlari → Canli ortam. |
| `IYZICO_SECRET` | **secret** | iyzico Merchant Panel → Secret Key. |
| `IYZICO_BASE_URL` | plain | Prod: `https://api.iyzipay.com` · Sandbox: `https://sandbox-api.iyzipay.com` |
| iyzico Merchant Panel → Geri donus URL'leri whitelist: `https://www.tripandtick.com/api/iyzico/callback` |  |  |

iyzico hesap aktiflesince:
1. Yukaridaki 3 key'i ekle
2. `NEXT_PUBLIC_IYZICO_ENABLED=true` yap
3. Re-deploy

## 4. Admin Panel (zorunlu)

| Key | Tip | Deger |
|---|---|---|
| `ADMIN_API_TOKEN` | **secret** | `openssl rand -hex 32` cikti (32 byte = 64 hex char) |
| `NEXT_PUBLIC_ADMIN_TOKEN` | plain | **Aynisi** — browser admin UI'sin `x-admin-token` header'i okumasi icin |
| `ADMIN_EMAIL` | plain | `info@tripandtick.com` veya admin posta |

## 5. Reschedule magic-link (zorunlu)

| Key | Tip | Deger |
|---|---|---|
| `RESCHEDULE_SECRET` | **secret** | `openssl rand -hex 32`. Set edilmezse `ADMIN_API_TOKEN` fallback (yeterli ama ayri secret tavsiye). |

## 6. Brevo (transactional + magic-link batch)

| Key | Tip | Aciklama |
|---|---|---|
| `BREVO_API_KEY` | **secret** | https://app.brevo.com/settings/keys/api → master key |
| `BREVO_FROM_EMAIL` | plain | `hello@tripandtick.com` (gmail.com KULLANMA — DKIM yok = spam) |
| `BREVO_FROM_NAME` | plain | `Trip and Tick` |
| `BREVO_TO_EMAIL` | plain (opsiyonel) | Yoksa `BREVO_FROM_EMAIL` kullanilir |

**DNS verify (kritik)**: Brevo Dashboard → Senders → `tripandtick.com` domain ekle → DKIM `mail._domainkey` TXT + SPF + DMARC kayitlarini Cloudflare DNS'e ekle. Onaylanana kadar mailler spam'e duser.

## 7. Supabase (zorunlu prod — yoksa in-memory fallback restart'ta data-kaybi)

| Key | Tip | Aciklama |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | plain | https://app.supabase.com → Project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | plain | Anon key (public, RLS korur) |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | Service Role key (RLS bypass — admin endpoint'leri icin) |

**Migration apply** (zorunlu):
```bash
cd C:\Users\Hallo\OneDrive\Claude\AGA\Balon\tripandtick
supabase link --project-ref <PROJECT_REF>
supabase db push
# 0001_initial_schema + 0002_service_overrides apply olur
```

## 8. Cron + Background

| Key | Tip | Aciklama |
|---|---|---|
| `CRON_SECRET` | **secret** | `openssl rand -hex 32`. SEO agent cron auth. |
| `SEO_AGENT_CRON` | plain | `0 3 * * *` (gunluk 03:00) |
| `SEO_AGENT_AUTO_PUBLISH` | plain | `false` (incelemeden auto-publish KAPALI) |

## 9. AI keys (ROTATE — plain-text expose risk var)

| Key | Tip | Aciklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | **secret** | console.anthropic.com → **YENI key uret, eskiyi revoke et**. `Balon/claude api.txt` dosyasini DELETE. |
| `GOOGLE_AI_API_KEY` | **secret** | Google AI Studio. Gemini fallback. |

NOT: 21st.dev API kullanılmıyor — `Balon/21stdev api.txt` dosyasini revoke + DELETE (kod-bazinda referans yok).

## 10. IndexNow (opsiyonel — SEO)

| Key | Tip | Aciklama |
|---|---|---|
| `INDEXNOW_KEY` | plain | https://www.bing.com/indexnow → key uret + `public/<key>.txt` yukle |

---

## Cloudflare Pages Build settings

```
Framework preset:   Next.js
Build command:      npm run build:cf
Build output dir:   .vercel/output/static
Root directory:     /
Node version:       20
```

`compatibility_flags`: `nodejs_compat` (wrangler.toml'da set, dashboard'da tekrar verify).

## DNS — Cloudflare

- `A` veya `CNAME tripandtick.com` → Cloudflare Pages project default URL
- `CNAME www` → Pages project URL
- Brevo: `TXT mail._domainkey` + `TXT @ "v=spf1 include:spf.brevo.com ~all"` + `TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@tripandtick.com"`
- Stripe: gerek yok (Stripe Checkout host'lu)

---

## Post-deploy smoke test

1. `https://www.tripandtick.com/api/health` → 200
2. `/tr/balonlar/standart-balon-ucusu` → SSR render OK
3. `/tr/rezervasyon/standart-balon-ucusu` → tarih sec → 5. adim → Stripe Checkout butonu → Live Stripe payment page
4. `/admin/login` → admin password → `/admin/fiyat` acilir
5. `/admin/fiyat` → bir tarihte override ekle → public sayfada gorunmeli
6. Stripe Dashboard → Webhooks → recent deliveries → test event → 200

## Deploy

```bash
npm run deploy:cf
```

veya GitHub auto-deploy (push → CF Pages auto build).
