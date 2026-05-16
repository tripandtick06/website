# TripAndTick — Supabase Setup (5 dk)

Lokal Supabase CLI yok. Bu adimlari **sen** lokal terminal'de calistir.

---

## 1. Project olustur (Supabase Dashboard)

1. https://app.supabase.com/projects → **New project**
2. Org: kendi org'un
3. Project name: `tripandtick`
4. Database password: guvenli + 1Password/Bitwarden'a kaydet
5. Region: **eu-central-1** (Frankfurt) — TR'ye yakin
6. Plan: **Free** (50 MB DB + 500 MB transfer/ay yeterli baslangic)
7. **Create new project** → 2-3 dk hazirlik

## 2. Anahtarlari al

Project hazirlaninca → **Settings** → **API**:

- Project URL: `https://<REF>.supabase.co` (REF degisken)
- anon public key: `eyJ...` (uzun JWT)
- service_role secret: `eyJ...` (uzun JWT, GIZLI)

Bunlari CF Pages env'ine ekle (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

## 3. CLI install + login + link

PowerShell veya Git Bash:

```bash
npm install -g supabase
supabase login   # browser acilir → onay → terminal'e geri done
```

Sonra:

```bash
cd C:/Users/Hallo/OneDrive/Claude/AGA/Balon/tripandtick
supabase link --project-ref <REF>   # adim 1'deki REF
# Database password sorulur — adim 1'de kaydettigini gir
```

## 4. Migration apply

```bash
supabase db push
```

Beklenen cikti:

```
Applying migration 0001_initial_schema.sql...
Applying migration 0002_service_overrides.sql...
Applying migration 0003_webhook_events.sql...
Finished supabase db push.
```

## 5. Verify (Supabase Dashboard)

Dashboard → **Table Editor**. Sol panelde tablolar gorunmeli:
- `customers`
- `bookings`
- `availability`
- `coupons`
- `reviews`
- `loyalty_transactions`
- `agencies`
- `email_log`
- `service_overrides`
- `webhook_events`

Dashboard → **Authentication** → **Policies**. RLS aktif gorunmeli (`service_overrides` + `webhook_events`).

## 6. Test query (opsiyonel)

Dashboard → **SQL Editor**:

```sql
SELECT count(*) FROM customers;
SELECT count(*) FROM service_overrides;
INSERT INTO webhook_events (event_id, provider, type) VALUES ('test-001', 'stripe', 'test');
SELECT * FROM webhook_events;
DELETE FROM webhook_events WHERE event_id = 'test-001';
```

## 7. Backup (production)

Free plan: 7 gun otomatik backup (Settings → Database → Backups). Pro plan'da PITR (Point-in-Time Recovery).

---

## Sorun cikarsa

- **`supabase link` "permission denied"** → access token expire, `supabase login --no-browser` ile yeniden login
- **`supabase db push` "schema drift"** → onceden Dashboard'da elle tablo olusturduysan; `--include-all` ile zorla apply veya schema'yi sifirla
- **RLS policy hata** → migration 0002+0003 dosyalarinda `auth.role() = 'service_role'` ifadesi var; service_role key olmayan client INSERT denerse 403. Beklenen davranis.
