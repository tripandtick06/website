# Incident Post-Mortem — Mock Agency Bundle Exposure

**Tarih**: 2026-05-17
**Severity**: P3 (no real data, no real credential, no obligation)
**Disposition**: NO BREACH — RFC-standard mock data exposure
**Disclosure Obligation**: NONE (GDPR Art 33 not triggered)
**Author**: Founder (solo-engineering)

---

## Finding

Q1.5 prod-readiness audit sirasinda `src/data/agencies.ts` icindeki `MOCK_AGENCIES` fixture
client-bundle.js'e sizdigi tespit edildi:

- `tripandtick.com/b2b/login` sayfasi chunk'i `app/b2b/login/page-a22959878cb7bf4f.js`
- Chunk icinde 7 `tt_b2b_*` apiKey string + 8 firma adi + 8 contactPerson + 8 email gozukuyor

**Root cause**: `src/app/[locale]/b2b/login/page.tsx` ve `src/app/[locale]/b2b/dashboard/page.tsx`
`"use client"` direktifli + `import { getAgencyByEmail/Id } from "@/data/agencies"`.
Bu fonksiyonlar `MOCK_AGENCIES` array'ini referans aldigi icin tree-shaking edemiyor,
8 entry tum field'lariyla bundle.js'e dahil ediliyor.

**Awareness moment**: 2026-05-17 ~07:30 UTC (Q1.5 explore agent + manual bundle inspect)

---

## Verification (4-step disposition)

| Adim | Yontem | Sonuc |
|---|---|---|
| 1 | `git log --follow src/data/agencies.ts` ilk commit | `defe8d5 feat: Faz 2 complete - Supabase + iyzico + Loyalty + B2B + 7 dil + 20 otel` — multi-feature mass-scaffold (mock-fixture context) |
| 2 | Locale-pattern teyit | 8 entry: TR/DE/GB/FR/ES/TR/JO/US → klasik multi-locale UI test fixture pattern |
| 3 | DNS lookup 7 firma domain | 6/7 TAMAMEN OLU (anatolia-tours.de, bosphorusholidays.co.uk, voyages-cappadoce.fr, iberiacappadocia.es, polarismice.com.tr, dmclevant.com — DNS resolve YOK) |
| 3b | 1/7 DNS-var | nomadeast.com → 52.40.42.113 (AWS US-West parking, gercek firma yok) |
| 4 | Var olmayan tenant testi | Brevo/Stripe/Supabase log YOK (Supabase project henuz olusturulmadi, Brevo prod aktif degil) |

**Conclusion**: Hicbir entry gercek B2B partner DEGIL. Tum apiKey'ler placeholder.
Tum contactPerson isimleri uydurma. Tum domain'ler parked/dead.

---

## Disposition

**GDPR Art 33** (supervisory authority notification 72h):
- "Personal data breach" tanimi (Art 4(12)): "breach of security leading to ... unauthorised disclosure of, or access to, personal data"
- Bu olayda **gercek personal data YOK**:
  - `contactPerson` field — uydurma isimler ("Hannes Müller", "Emily Carter" vs.) realistic ama gercek kisilere bagli degil (DNS check + Brevo log teyit)
  - `email` — `*@anatolia-tours.de` vs role-mailbox formati ama domain'ler dead → mailbox yok → identifiable natural person yok
- **NOT TRIGGERED** — notification obligation yok

**GDPR Art 34** (data subject notification):
- Data subject yok (above) → NOT TRIGGERED

**Stripe / PCI-DSS**: payment data yok, sadece test apiKey → NOT APPLICABLE.

**SOC 2 / ISO 27001**: solo founder, formal compliance yok henuz. Bu dosya gelecekte
audit trail.

---

## Timeline

| Saat (UTC) | Olay |
|---|---|
| 2025-08-04 → 2026-04-05 | MOCK_AGENCIES entry'leri olusturuldu (`defe8d5` Faz 2 scaffold) |
| ~2026-05-?? | tripandtick.com prod deploy (manuel `wrangler pages deploy` — git-connect YOK, exact tarih CF dashboard'da) |
| 2026-05-17 07:30 | Q1.5 audit: Explore agent bundle leak tespit |
| 2026-05-17 07:35 | Manuel curl + grep teyit (`tt_b2b_a4f2...` ve 6 digerleri prod chunk'ta) |
| 2026-05-17 07:40 | 4-step verification: mock data, no breach |
| 2026-05-17 07:45 | Hygiene commit `7978eb7` push (RFC-3092 fixture sanitize) |
| 2026-05-17 07:55 | Defense-in-depth commit (this dosya + prefix-reject) |
| **PENDING** | User manuel `wrangler pages deploy` — prod bundle clean |

---

## Remediation

| # | Aksiyon | Status | SHA |
|---|---|---|---|
| 1 | Server-side B2B auth (httpOnly cookie HMAC, agencies.ts client-import sil) | DONE | `69f558c` (Q1.5) |
| 2 | MOCK_AGENCIES RFC-standard fixture rename (Acme/Foo/Bar + `*@fixture.test` + `tt_b2b_test_` prefix) | DONE | `7978eb7` |
| 3 | Defense-in-depth: prod env'de `tt_b2b_test_` prefix hard-reject (b2b-session.ts + 3 auth routes) | DONE | (this commit) |
| 4 | Incident post-mortem doc (this file) | DONE | (this commit) |
| 5 | `wrangler pages deploy` prod cikar — bundle hash degissin | PENDING (user) |
| 6 | CF Pages dashboard → Git auto-deploy connect (drift gap kapat) | PENDING (user) |
| 7 | Q2: `src/data/agencies.ts` → Supabase `b2b_agencies` table migrate + MOCK_AGENCIES sil | DEFERRED |

---

## Lessons Learned

1. **`"use client"` + data file import = bundle leak risk**. Pure function + type-only import
   tree-shake friendly; DB-lookup function + array reference = WHOLE array bundled.
   Rule: client componente `MOCK_*` veya `getXyz()` import etme — sadece `type` + pure helper.

2. **Manuel `wrangler pages deploy` drift yaratiyor**. Git push prod'a yansimiyor → developer
   yanlis bilgilenir. CF Pages → Git auto-deploy zorunlu.

3. **Mock data realistic isim seçimi sonradan kafa karistirir**. RFC 3092 (metasyntax) +
   RFC 6761 (`.test` TLD) + RFC 5733 (`+0...` phone) standartlari fixture/test verisi
   icin hicbir confusion riski yok. Audit, log analysis, security scan'lerde anlik
   "test fixture" diye tanir.

4. **Awareness moment'i log'la**. GDPR Art 33 saatleri "controller has become aware"
   anindan baslar (Recital 87). Confirmation ile breach disposition arasinda gecen
   sureyi dokumante etmek 72h penceresi argumanini destekler.

5. **Defense-in-depth bedava**. 5 satir `isFixtureKeyInProd()` helper + 3 satir
   gate-check = fixture key prod'a sizsa bile auth bypass mumkun degil. Maliyet sifir,
   guvence yuksek.

---

## References

- Commit `69f558c` — chore(payment): iyzico tamamen kaldir + Stripe-only mod (Q1.1-Q1.7 bundle)
- Commit `7978eb7` — chore(b2b): MOCK_AGENCIES fixture sanitize
- Bu commit — chore(security): defense-in-depth prefix-reject + incident log
- Plan dosyasi — `C:\Users\Hallo\.claude\plans\sharded-scribbling-raven.md`
- Memory — `tripandtick_project_state.md` (Anti-tampering coverage section)
- RFC 3092 — Etymology of "Foo" (metasyntax)
- RFC 6761 — Reserved TLDs (`.test`, `.example`, `.invalid`, `.localhost`)
- RFC 5733 — Numbers reserved for documentation
- GDPR Recital 87 — Awareness moment ("as soon as the controller has become aware")
