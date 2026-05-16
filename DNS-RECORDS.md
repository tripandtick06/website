# TripAndTick.com — DNS Records (Cloudflare DNS panel)

Bu dosya **Cloudflare DNS Dashboard** → `tripandtick.com` zone → **DNS** → **Add record** ile elle eklenecek.

Domain: `tripandtick.com`. Apex + www + Brevo email-auth + CAA opsiyonel.

---

## 1. Cloudflare Pages (site)

| Type | Name | Content | TTL | Proxy |
|---|---|---|---|---|
| `CNAME` | `tripandtick.com` (apex) | `<your-project>.pages.dev` | Auto | Proxied |
| `CNAME` | `www` | `<your-project>.pages.dev` | Auto | Proxied |

NOT: CF Pages **Custom domain** ekleyince DNS otomatik konfigure olur. Manuel ekleme gerek olursa yukaridaki gibi.

---

## 2. Brevo Email Auth (DKIM + SPF + DMARC + verify)

> Brevo Dashboard → Settings → **Senders, Domains & Dedicated IPs** → Domains → `tripandtick.com` Add. Brevo sana **DKIM degeri + verify-code** verir, asagidaki bos placeholder'lari onlarla doldur.

### 2.1 Brevo verify (domain ownership)

| Type | Name | Content | TTL |
|---|---|---|---|
| `TXT` | `brevo-code` | `<BREVO_VERIFY_CODE>` (Brevo panel'den) | Auto |

### 2.2 DKIM (mail._domainkey)

| Type | Name | Content | TTL |
|---|---|---|---|
| `TXT` | `mail._domainkey` | `k=rsa; p=<BREVO_DKIM_PUBLIC_KEY>` (Brevo panel'den, uzun base64) | Auto |

### 2.3 SPF (apex TXT — sender authorize)

| Type | Name | Content | TTL |
|---|---|---|---|
| `TXT` | `@` (veya `tripandtick.com`) | `v=spf1 include:spf.brevo.com ~all` | Auto |

NOT: Eger zaten SPF kaydi varsa (Google Workspace vs.) **birlestir**:
`v=spf1 include:_spf.google.com include:spf.brevo.com ~all`

### 2.4 DMARC (mail authentication policy)

| Type | Name | Content | TTL |
|---|---|---|---|
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@tripandtick.com; pct=100` | Auto |

`p=quarantine` baslangic icin guvenli (spam-folder fallback). 1 ay sonra `p=reject` sertlestirebilir.

---

## 3. Stripe (gerek YOK)

Stripe Checkout host'lu sayfa, DNS kaydi gerek olmaz. Sadece webhook endpoint URL yeterli.

---

## 4. CAA (Certificate Authority Authorization, opsiyonel ama tavsiye)

Sadece Cloudflare / Let's Encrypt SSL sertifikalarini kabul eder. Diger CA'larin sahte sertifika uretmesini blokla.

| Type | Name | Content | TTL |
|---|---|---|---|
| `CAA` | `@` | `0 issue "letsencrypt.org"` | Auto |
| `CAA` | `@` | `0 issue "pki.goog"` (Google Trust Services CF kullanir) | Auto |
| `CAA` | `@` | `0 issuewild "letsencrypt.org"` (wildcard cert icin) | Auto |

---

## 5. Verify

DNS yayilimi 5-30 dk sonra:

```bash
# DKIM check
dig +short TXT mail._domainkey.tripandtick.com

# SPF check
dig +short TXT tripandtick.com | grep spf1

# DMARC check
dig +short TXT _dmarc.tripandtick.com

# Pages CNAME
dig +short tripandtick.com
dig +short www.tripandtick.com
```

Veya online: https://mxtoolbox.com/SuperTool.aspx

---

## 6. Email-deliverability test

DNS yayilim sonrasi:

1. Brevo Dashboard → **Authenticate** butonu → onay yesil
2. https://www.mail-tester.com → test maili gonder (Brevo /v3/smtp/email) → 10/10 hedef
3. Gmail/Outlook hesabina test reschedule maili gonder → spam-klasore dusmemeli
