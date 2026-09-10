# Telegram lead bildirimi

Site formlarindan gelen her lead aninda Telegram'a duser (Murat + owner). E-posta (Brevo)
ikincil kanal; Brevo kapaliyken de Telegram calisir.

## Kapsam

| Kaynak | Rota | Mesaj |
|---|---|---|
| Iletisim formu | `POST /api/contact` | ✉️ ad, telefon, e-posta, konu, mesaj |
| Rezervasyon | `POST /api/booking` | 🎈 rezervasyon no, tarih, kisi, tutar, musteri iletisim |
| Otel bilgi talebi | `POST /api/hotel-inquiry` | 🏨 otel, tarihler, misafir, butce, tercih |
| B2B acente basvurusu | `POST /api/b2b/apply` | 🤝 sirket, yetkili, ulke, lisans |

Kod: `src/lib/telegram.ts` (gonderim, retry, HTML escape), `src/lib/leads.ts` (Supabase `leads`
tablosuna kalici kayit — bildirim dusse de lead kaybolmaz).

## Kurulum (bir kez)

1. **Bot**: BotFather → `/newbot` → token. Mevcut bot: `@Trip_tickbot`.
2. **Chat id'ler**: bildirim alacak herkes (Murat, owner) bota `/start` yazar. Sonra:
   ```bash
   curl -s "https://api.telegram.org/bot<TOKEN>/getUpdates"
   ```
   Cikan `message.chat.id` degerlerini not al. Grup icin: botu gruba ekle, grupta bir mesaj at,
   ayni komut negatif id verir (`-100...`).
3. **Cloudflare Pages env** (Production): `TELEGRAM_BOT_TOKEN` (secret) +
   `TELEGRAM_CHAT_IDS` = `id1,id2`. Yeni deploy tetikle (env degisikligi otomatik build ETMEZ).
4. **Supabase**: `supabase/migrations/0005_leads.sql` SQL editorde calistir (leads tablosu).
   Tablo yoksa kod loglar, patlamaz.

## Dogrulama

```bash
# Yapilandirma
curl -s https://tripandtick.com/api/health | jq .integrations   # telegram:true, telegramPing:"ok"
curl -s https://tripandtick.com/api/admin/telegram-test -H "x-admin-token: $ADMIN_API_TOKEN"
# Test mesaji (her chat'e)
curl -s -X POST https://tripandtick.com/api/admin/telegram-test -H "x-admin-token: $ADMIN_API_TOKEN"
```

Form yanitlarinda `notified: { telegram: bool, email: bool }` alani gonderim sonucunu verir.

## Davranis

- Her chat id'ye ayri `sendMessage`; biri dusse digeri gider (`ok` = en az 1 teslim).
- 429/5xx → 3 deneme, `retry_after` saygili. 4xx (yanlis chat id) → tekrar yok, log.
- Mesaj 4096 karakterde kesilir. Kullanici girdisi HTML-escape edilir.
- Hicbir kanala ulasamayan lead `LEAD HICBIR KANALA ULASMADI` ile error-log'a duser.

## Bilinen sinirlar

- Bot, kullanici ona `/start` demeden mesaj ATAMAZ (Telegram kurali). Yeni kisi = yeni `/start` + env guncelle.
- Dogrudan `hello@`/`info@tripandtick.com` adresine gelen mailler bu akisin DISINDA — domainde MX
  kaydi yok (2026-09-10 tespiti). Cloudflare Email Routing + Email Worker ile Telegram'a
  yonlendirilebilir; DNS/Email Routing yetkili token gerekir.
