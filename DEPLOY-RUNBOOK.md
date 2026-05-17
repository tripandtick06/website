# TripAndTick — Production Deploy Runbook

**Hedef**: tripandtick.com Cloudflare Pages canli, Stripe-only odeme, Supabase prod, Brevo mail.

**Tahmini sure**: 60-90 dk (3rd-party hesap onaylari haric).

**Prerequisite**: Github access (`tripandtick06/website`), Cloudflare hesap, Stripe live aktif, Supabase hesap, Brevo hesap.

---

## Faz 1 — Hesaplar + Anahtarlar (30 dk)

### 1.1 Stripe Live Anahtarlari

1. https://dashboard.stripe.com → sag-ust **View test data** TOGGLE OFF (live mode)
2. Developers → **API keys** → "Reveal live key" → **Secret key** kopyala (`sk_live_...`)
3. Developers → **Webhooks** → **Add endpoint**
   - Endpoint URL: `https://www.tripandtick.com/api/stripe/webhook`
   - Events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Olustur → **Signing secret** kopyala (`whsec_...`)

### 1.2 Admin Token + Reschedule Secret

PowerShell veya WSL:

```bash
openssl rand -hex 32   # ADMIN_API_TOKEN
openssl rand -hex 32   # RESCHEDULE_SECRET
openssl rand -hex 32   # CRON_SECRET
```

Cikti'lari guvenli yere kaydet (1Password / Bitwarden).

### 1.3 Anthropic + 21stdev key ROTATE

1. console.anthropic.com → **API Keys** → eski key revoke → yeni key uret
2. 21st.dev → API keys → yeni key uret
3. Lokal `.env.local` icindeki eski degerleri sil
4. **DELETE**: `C:\Users\Hallo\OneDrive\Claude\AGA\Balon\claude api.txt` ve `21stdev api.txt` (plain-text expose)

### 1.4 Brevo Domain Verify

1. https://app.brevo.com → Settings → **Senders, Domains & Dedicated IPs** → Domains
2. **Add a domain** → `tripandtick.com`
3. DNS kayitlari (Cloudflare DNS panel'e ekle):
   - `TXT mail._domainkey.tripandtick.com` → `<Brevo DKIM>`
   - `TXT brevo-code.tripandtick.com` → `<Brevo verify code>`
   - `TXT @ tripandtick.com` → `v=spf1 include:spf.brevo.com ~all`
   - `TXT _dmarc.tripandtick.com` → `v=DMARC1; p=quarantine; rua=mailto:dmarc@tripandtick.com`
4. **Authenticate** → onay 5-30 dk
5. API key: Settings → API keys → master key kopyala

### 1.5 Supabase Project Olustur

1. https://app.supabase.com → **New project**
2. Region: **Europe (Frankfurt)** veya **eu-central-1** (TR'ye en yakin)
3. Password: guvenli + kaydet
4. Project hazirlaninca: **Settings → API**
   - Project URL: `https://<ref>.supabase.co`
   - anon public key: `eyJ...`
   - service_role secret: `eyJ...`

Migration:
```bash
cd C:\Users\Hallo\OneDrive\Claude\AGA\Balon\tripandtick
npm install -g supabase
supabase login
supabase link --project-ref <ref>
supabase db push
```

Beklenen cikti: `0001_initial_schema` + `0002_service_overrides` apply OK.

---

## Faz 2 — Cloudflare Pages Project (15 dk)

### 2.1 Project olustur

1. https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. GitHub: `tripandtick06/website` → master branch
3. Build settings:
   - Framework preset: **Next.js**
   - Build command: `npm run build:cf`
   - Build output dir: `.vercel/output/static`
   - Root directory: (bos)
   - Node version: `20`
4. **Save and Deploy** (ilk build env-var olmadan fail edebilir, devam et)

### 2.2 Environment Variables

Settings → Environment Variables → **Production** (her variable icin "Encrypt" tikla secret olanlarda):

| Key | Deger / Kaynak |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.tripandtick.com` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `tr` |
| `STRIPE_SECRET_KEY` | Faz 1.1 — `sk_live_...` (Encrypt) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Faz 1.1 — `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Faz 1.1 — `whsec_...` (Encrypt) |
| `ADMIN_API_TOKEN` | Faz 1.2 — token (Encrypt) |
| `NEXT_PUBLIC_ADMIN_TOKEN` | Faz 1.2 — **AYNI** token |
| `ADMIN_EMAIL` | `info@tripandtick.com` |
| `ADMIN_PASSWORD` | Faz 1.2 — `openssl rand -base64 24` (Encrypt) |
| `RESCHEDULE_SECRET` | Faz 1.2 — secret (Encrypt) |
| `BREVO_API_KEY` | Faz 1.4 — `xkeysib-...` (Encrypt) |
| `BREVO_FROM_EMAIL` | `hello@tripandtick.com` |
| `BREVO_FROM_NAME` | `Trip and Tick` |
| `NEXT_PUBLIC_SUPABASE_URL` | Faz 1.5 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Faz 1.5 |
| `SUPABASE_SERVICE_ROLE_KEY` | Faz 1.5 (Encrypt) |
| `CRON_SECRET` | Faz 1.2 — secret (Encrypt) |
| `SEO_AGENT_CRON` | `0 3 * * *` |
| `SEO_AGENT_AUTO_PUBLISH` | `false` |
| `ANTHROPIC_API_KEY` | Faz 1.3 — rotated `sk-ant-...` (Encrypt) |
| `GOOGLE_AI_API_KEY` | mevcut (Encrypt) |

**Preview** environment'a ayni degerleri kopyala (Stripe-TEST keys + Supabase preview project tavsiye).

### 2.3 Custom domain

1. Pages project → Custom domains → **Set up a custom domain**
2. `www.tripandtick.com` ekle → DNS otomatik konfigurasyon
3. `tripandtick.com` ekle (apex) → CF Pages CNAME flattening kullanir
4. SSL/TLS otomatik

### 2.4 Re-deploy

1. Deployments → **Retry deployment** veya master'a kucuk commit push
2. Build izle (3-5 dk)
3. Yesil → next adim

---

## Faz 3 — Post-deploy Smoke Test (15 dk)

| # | Test | Beklenen |
|---|---|---|
| 1 | `https://www.tripandtick.com` GET | 200 + TR homepage |
| 2 | `/api/health` GET | `{"status":"ok"}` 200 |
| 3 | `/tr/balonlar/standart-balon-ucusu` | SSR balon detay sayfa |
| 4 | `/en/balonlar/standart-balon-ucusu` | EN locale render |
| 5 | `/tr/rezervasyon/standart-balon-ucusu` | 5-step booking form |
| 6 | Step 5 → Stripe Checkout button | **Live** Stripe payment page |
| 7 | 0.50 EUR test booking gercek kart | Brevo onay maili gelir (5-30 sn) |
| 8 | Stripe Dashboard → Webhooks → recent | 200 event delivered |
| 9 | `/admin/login` → admin sifre | Admin panel acilir |
| 10 | `/admin/fiyat` → bir tarihte cancel | Public sayfa override gosterir |
| 11 | `/admin/fiyat` → bulk-cancel → preview | Etkilenen rezervasyon listesi |
| 12 | `/admin/fiyat` → notify → Brevo magic-link | Mail gelir + link tikla → reschedule page |

---

## Faz 4 — Monitoring (Faz 1 sonrasi)

| Kanal | URL |
|---|---|
| Cloudflare Analytics | dash.cloudflare.com → Pages → Analytics |
| Stripe Dashboard | dashboard.stripe.com → Payments / Webhooks |
| Supabase Logs | app.supabase.com → Project → Logs |
| Brevo Statistics | app.brevo.com → Statistics → Email |
| Google Search Console | search.google.com/search-console |
| Lighthouse PSI | pagespeed.web.dev → `https://www.tripandtick.com` |

---

## Faz 5 — Geri donus (rollback)

CF Pages → Deployments → onceki yesil deployment → **Rollback to this deployment**.

5-10 sn icinde eski versiyon canli.

---

## Faz 6 — Monitoring (Faz 1 sonrasi)

Yukaridaki Faz 4 monitoring kanallari aktif kal.

---

## Bilinen sinirlar (canli sonrasi takip)

- `bookings.date` reschedule sonra DB-tarafi manuel update (Q4 migration TODO)
- Iade auto-trigger yok — admin Stripe panelinden manuel (5 isgunu icinde)
- Lighthouse/CWV henuz olculmedi (Faz 4 sonrasi PSI bekle)
- 242 hard-coded TR string Faz 4.3 (cogu admin-side, public-side i18n 100%)
- DEMO MODE banner: env-var eksikse otomatik gorunur (production'da gormemen gerek)

---

## Acil iletisim

- **Stripe support**: dashboard.stripe.com → top-right → Support
- **Cloudflare support**: dash.cloudflare.com → top-right → Support
- **Supabase Discord**: discord.supabase.com
- **Brevo support**: app.brevo.com → Help
