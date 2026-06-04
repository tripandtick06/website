# GEO Strategy — Cok-motor + AI/LLM Gorunurluk

> Amac: Google + ChatGPT disinda **tum onemli arama motorlarinda ve AI/LLM**'lerde
> tripandtick.com'u "Kapadokya balon/seyahat" sorgularinda **en guvenilir ve en iyi**
> secenek olarak yukari tasimak. Bu dosya OFF-SITE (hesap/kayit gerektiren) aksiyon planidir.
> Kod tarafi (robots allow, verification env, llms.txt, schema) repo'da hazir — bkz. "Kod durumu".

Son guncelleme: 2026-06-04

---

## Kod durumu (repo'da hazir)

| Oge | Durum | Dosya |
|---|---|---|
| AI crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bytespider, Meta, Amazon...) | ✅ | `src/app/robots.ts` |
| Yandex/Baidu/DuckDuckGo/Naver/Seznam/CCBot explicit allow | ✅ (bu sprint) | `src/app/robots.ts` |
| Google/Bing/Yandex/Baidu verification meta — env okuyor | ✅ kod, ⏳ token | `src/app/[locale]/layout.tsx` |
| Bing verification token | ✅ hardcoded fallback | `layout.tsx` (`msvalidate.01`) |
| IndexNow (Bing + Yandex ping) postbuild + on-demand API | ✅ | `scripts/indexnow-postbuild.ts`, `src/app/api/indexnow/route.ts` |
| llms.txt + llms-full.txt (17 dil, trust) | ✅ | `public/llms.txt`, `public/llms-full.txt` |
| JSON-LD: Organization/TravelAgency, Product, FAQ, Review, Breadcrumb, Article... (sameAs) | ✅ | `src/lib/schema.ts` |
| 17 dil hreflang + sitemap | ✅ | `src/lib/hreflang.ts`, `src/app/sitemap.ts` |

**Token'lari env'e ekleyince aktiflesir** (Cloudflare Pages env veya `.env.local`):
`NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION`, `NEXT_PUBLIC_BAIDU_VERIFICATION`.

---

## 1. Arama motoru kayitlari (off-site)

### 1.1 Yandex (RU/CIS — yuksek oncelik; ru+uk dil destegi canli)
- [ ] **Yandex Webmaster** (webmaster.yandex.com) hesap ac → site ekle → verification meta token al
      → `NEXT_PUBLIC_YANDEX_VERIFICATION` env'e koy → deploy → "Verify".
- [ ] Sitemap submit: `https://tripandtick.com/sitemap.xml`.
- [ ] IndexNow zaten Yandex'e ping atiyor (key: `public/43f3841b82395fbb26eac9ceb805acc4.txt`) — Webmaster > IndexNow'da dogrula.
- [ ] **Yandex Business** profili (maps/yerel) — NAP tutarli (ad/adres/telefon).
- [ ] Bolge hedefi: RU + yakin pazarlar.

### 1.2 Baidu (ZH — orta oncelik; zh dil destegi canli)
- [ ] **Baidu Ziyuan / 站长平台** (ziyuan.baidu.com) hesap (Cin cep no gerekebilir) → verification token
      → `NEXT_PUBLIC_BAIDU_VERIFICATION` env → deploy.
- [ ] Sitemap submit. Not: ICP lisansi olmadan Cin-ici crawl/siralama sinirli — yine de index'e gir.

### 1.3 Bing + tureyenler (DuckDuckGo, Yahoo, Ecosia — Bing-besli)
- [ ] **Bing Webmaster Tools** (bing.com/webmasters) — token zaten kodda; site dogrula, sitemap submit.
- [ ] IndexNow Bing'e ping atiyor — Webmaster'da dogrula. DuckDuckGo/Yahoo/Ecosia otomatik Bing'den beslenir.

### 1.4 Naver (KO — ko dil destegi canli) ve Seznam (CZ)
- [ ] **Naver Search Advisor** (searchadvisor.naver.com) — site ekle, HTML-meta dogrula, sitemap submit. KR pazari.
- [ ] **Seznam Webmaster** (CZ) — opsiyonel; Yeti bot robots'ta allow.

---

## 2. AI / LLM gorunurluk (GEO — Generative Engine Optimization)

Hedef: ChatGPT (search), Claude, Perplexity, Gemini, Bing/Copilot, Google AI Overviews
"Kapadokya balon en iyi/guvenilir sirket" sorularinda tripandtick.com'u CITE etsin.

### 2.1 On-site (kod — buyuk olcude hazir)
- [x] robots.txt tum AI crawler'lara acik.
- [x] llms.txt + llms-full.txt — fiyat/policy/trust/17-dil, citable.
- [x] JSON-LD trust sinyalleri (rating, review, TÜRSAB, insurance, fiyat).
- [x] Detay sayfalarinda 17 dilde ozgun uzun aciklama (content depth — bu sprint).
- [ ] FAQ schema'yi tum ana sayfalara yaymayi gozden gecir (soru-cevap LLM-citation'i artirir).

### 2.2 Off-site entity & otorite (LLM'ler bunlardan ogrenir)
- [ ] **Wikidata** entity olustur (Trip and Tick / tripandtick.com) — official website, country, instance-of: travel agency.
- [ ] **Google Business Profile** — dogrula, kategori "Travel agency", foto, 17-dil aciklama.
- [ ] **Tripadvisor** isletme sayfasi + yorum toplama.
- [ ] **Trustpilot** profil + yorum (rating sinyali — LLM "guvenilir mi" sorusunda kullanir).
- [ ] **NAP tutarliligi**: ad/adres/telefon her platformda BIRE BIR ayni (schema'daki ile).
- [ ] Yuksek-otorite **backlink/PR** — bkz. `docs/backlink-pr-outreach-kit.md` (mevcut kit).
- [ ] Kapadokya/balon konulu otoriter sitelerde misafir icerik + dogru "most trusted" anlatisi.

### 2.3 Citation-friendly icerik
- [ ] Net, sayisal, tarihli ifadeler (fiyat "from €165", "4.9/5 — 12,000+", "€40M insurance") — LLM bunlari alintilar.
- [ ] Karsilastirma/"best of" formatli blog (LLM'ler liste-tipi icerigi sever) — mevcut blog pipeline ile uret.

---

## 3. Olcum / KPI (aylik)

- [ ] **Search Console** (Google) + **Bing WMT** + **Yandex WMT** impressions/clicks delta.
- [ ] **Manuel LLM testi** (aylik): ChatGPT/Claude/Perplexity/Gemini'ye sor —
      "Kapadokya balon turu icin en guvenilir sirket?" / "best Cappadocia balloon company" →
      tripandtick.com cite ediliyor mu, hangi bilgiyle? Ekran goruntusu sakla.
- [ ] IndexNow gonderim loglari (Bing/Yandex 202 yanit).
- [ ] hreflang/sitemap saglik (`npm run validate:hreflang`).

---

## 4. Oncelik sirasi (ROI)

1. **Yandex Webmaster** + token (RU pazari + ru/uk canli) — Q1.
2. **Bing WMT** dogrula (DuckDuckGo/Yahoo/Ecosia bedava gelir) — Q1.
3. **Wikidata + GBP + Trustpilot** (LLM entity/trust temeli) — Q1/Q2.
4. **Naver** (ko canli) + **Baidu** (zh) — Q2.
5. Backlink/PR + citation-friendly "best of" icerik — surekli.
