# TripAndTick Cloudflare Pages — Env Var Checklist

Sıfır-kayıp deploy için Cloudflare Pages dashboard → Settings → Environment Variables altına aşağıdaki **PRODUCTION** ve **PREVIEW** key'leri ekleyin. Her commit sonrası build tetiklenirken bu env'ler runtime'a inject edilir.

## Q1 Ödeme & Admin Panel (yeni)

| Env Key | Zorunlu | Açıklama |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API Keys → Live `sk_live_…` |
| `IYZICO_API_KEY` | ✅ | iyzico Merchant Panel → API → Live Key |
| `IYZICO_SECRET` | ✅ | iyzico Merchant Panel → API → Secret Key |
| `IYZICO_BASE_URL` | ⚠️ | `https://api.iyzipay.com` (live) veya `https://sandbox-api.iyzipay.com` (test). Set edilmezse sandbox. |
| `ADMIN_API_TOKEN` | ✅ | 32-byte random hex — `openssl rand -hex 32` |
| `NEXT_PUBLIC_ADMIN_TOKEN` | ✅ | `ADMIN_API_TOKEN` ile **aynı** değer (browser admin UI fetch) |

## Mevcut (kontrol et)

| Env Key | .env.local | Status |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://www.tripandtick.com` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | ✅ | `tr` |
| `BREVO_API_KEY` | ✅ | Otel inquiry + booking onay mail |
| `BREVO_FROM_EMAIL` | ✅ | hello@tripandtick.com |
| `BREVO_FROM_NAME` | ✅ | Trip and Tick |
| `BREVO_TO_EMAIL` | ⚠️ | Optional; set edilmezse FROM_EMAIL'e gider |
| `CRON_SECRET` | ✅ | 32-byte — rotate edin (Q4) |
| `ANTHROPIC_API_KEY` | ✅ | **ROTATE** (`Balon/claude api.txt` plain-text expose) |
| `GOOGLE_AI_API_KEY` | ✅ | Gemini fallback |
| `NEXT_PUBLIC_21STDEV_API_KEY` | ✅ | **ROTATE** (`Balon/21stdev api.txt` plain-text expose) |

## Q2-genis Supabase (opsiyonel — yoksa in-memory fallback)

| Env Key | Açıklama |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (admin endpoint için) |

Supabase enabled olmadığında:
- `service_overrides` → in-memory Map (process restart'ta kaybolur)
- `availability` → mock store fallback
- `bookings`/`customers` → localStorage-only

## Q1 deploy çalıştır

1. Cloudflare Pages dashboard → tripandtick proje → Settings → Env Variables
2. Yukarıdaki tabloya göre ekleyin (Production + Preview)
3. Re-deploy: Deployments → latest → Retry deployment
4. Test:
   - `/admin/login` → admin@tripandtick.com / admin123
   - `/admin/fiyat` → bir tarihte override ekle
   - `/rezervasyon/standart-balon-ucusu` → tarih seç, override görünmeli
   - Stripe checkout button → gerçek Stripe sayfası (demo banner görünmez)
   - iyzico checkout (TR para birimi) → iyzico hosted page

## Q1 dev test (lokal)

```bash
cd C:\Users\Hallo\OneDrive\Claude\AGA\Balon\tripandtick
# 1) .env.local'a IYZICO + ADMIN_TOKEN ekle (sandbox key alabilirsiniz)
# 2) npm run dev
# 3) http://localhost:3000 → /admin/fiyat
```

## Q1 Supabase migration (production)

```bash
supabase link --project-ref <ref>
supabase db push  # 0002_service_overrides.sql apply
```

## Q4 (sırada) — Key Rotation

1. `ANTHROPIC_API_KEY` → console.anthropic.com → yeni key + eski revoke
2. `NEXT_PUBLIC_21STDEV_API_KEY` → 21st.dev → yeni key
3. `CRON_SECRET` → `openssl rand -hex 32` yeni değer
4. `Balon/claude api.txt` ve `Balon/21stdev api.txt` **DELETE** (plain-text expose)
