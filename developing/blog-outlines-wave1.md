# Wave-1 Blog Article Outlines (EN) — Draft for Owner Approval

> Status: OUTLINES ONLY. Authored by hand (no paid API batch).
> One full article was shipped this wave: `en-best-time-cappadocia-balloon.json`
> (targetKeyword "best time for cappadocia balloon"). The three outlines below
> are ready to be expanded into full ~1200-word articles once approved.
> Each follows the existing `BlogArticle` JSON format (slug, title, metaTitle,
> metaDescription, excerpt, content markdown, category, tags, targetKeyword,
> locale: "en", publishedAt, isAiGenerated:false, seoScore, coverImage, faq[]).

---

## Outline 1 — Cappadocia Balloon: Budget vs VIP — Which Package Is Worth It?

- **Proposed slug**: `cappadocia-budget-vs-vip-balloon`
- **targetKeyword**: `cappadocia budget vs vip balloon`
- **category**: `balon-turlari`
- **Search intent**: comparison / decision (high commercial intent)
- **Gap**: existing price article lists packages but does not compare value head-to-head.

### Section plan
1. **H2 The four packages at a glance** — Standard €165, Comfort €215, Deluxe €295, Romantic Private €580; one-line value summary each.
2. **H2 What actually differs** — basket size (16-20 vs 12 vs 8 vs 2-couple), flight duration (60 vs 75 vs 90 min), crowd density, photo quality, champagne tier.
3. **H2 Budget (Standard) — who it's for** — first-timers, families, groups; honest trade-offs (larger basket, less elbow room).
4. **H2 Mid-tier (Comfort/Deluxe) — the sweet spot** — fewer passengers, longer airtime; best €/minute.
5. **H2 VIP (Romantic Private) — when it's worth it** — proposals, honeymoons, photographers; what €580 buys.
6. **H2 Cost-per-minute comparison table** — make the value math explicit.
7. **H2 Our recommendation by traveller type** — link to /balonlar.
8. **FAQ (6-8)**: Is Deluxe worth the extra €130? Can 2 people book a private basket cheaper off-season? Do kids pay full price in VIP? Is the champagne different per tier? etc.
- **CTA**: /balonlar lowest-price guarantee.
- **coverImage**: needs `/images/blog/budget-vs-vip-balloon.jpg` (owner/image-pipeline).

---

## Outline 2 — Cappadocia Balloon Booking Guide — How to Book Without Getting Scammed

- **Proposed slug**: `cappadocia-balloon-booking-guide`
- **targetKeyword**: `cappadocia balloon booking guide`
- **category**: `balon-turlari`
- **Search intent**: informational → transactional (trust-heavy).
- **Gap**: no end-to-end "how to book + how to avoid scams" trust article exists.

### Section plan
1. **H2 How balloon booking works in Cappadocia** — operator vs agency, SHGM licensing, what a legitimate booking includes.
2. **H2 Red flags of an unlicensed seller** — no TURSAB/SHGM license shown, cash-only, no written refund policy, suspiciously cheap.
3. **H2 What a fair price includes** — transfer, breakfast, insurance, certificate, champagne; VAT transparency.
4. **H2 Step-by-step booking** — choose package, date (link to best-time article), passengers, secure payment, instant PDF ticket.
5. **H2 Weather cancellation rights** — 100% refund or free rebooking; why a multi-night buffer matters.
6. **H2 Payment safety** — 3D Secure, currency options, what a real confirmation looks like.
7. **H2 Booking checklist** — bullet list the reader can screenshot.
8. **FAQ (6-8)**: How far ahead should I book? Can I change my date? Is cash-on-arrival safe? What if the operator is overbooked? How do I verify a license?
- **Internal links**: /balonlar, best-time article, price article.
- **coverImage**: needs `/images/blog/balloon-booking-guide.jpg`.

---

## Outline 3 — Cappadocia Balloon Flight Safety — What Travellers Should Know (2026)

- **Proposed slug**: `cappadocia-balloon-safety-guide`
- **targetKeyword**: `cappadocia balloon flight safety`
- **category**: `balon-turlari`
- **Search intent**: informational / reassurance (E-E-A-T + trust signal for AI citation).
- **Gap**: high-anxiety query with no dedicated, calm, factual answer page.

### Section plan
1. **H2 Is a Cappadocia balloon flight safe?** — direct answer up top (speakable-friendly), framed around regulation.
2. **H2 Who regulates balloon operators** — SHGM (Turkish Civil Aviation Authority), EASA Part-BOP standards, mandatory pilot certification.
3. **H2 What happens before a flight** — overnight weather monitoring, 03:30-04:30 go/no-go call, pre-flight briefing.
4. **H2 Safety equipment & crew** — basket standards, pilot experience, ground crew, insurance coverage.
5. **H2 Weather rules** — wind/visibility/fog limits; why cancellations are a safety *feature*, not a failure.
6. **H2 What you can do** — listen to the briefing, dress right (link winter packing list), choose licensed operators only.
7. **H2 How to verify an operator is licensed** — what to ask, link to booking guide.
8. **FAQ (6-8)**: Have there been accidents? What's the minimum age? Can pregnant travellers fly? What if I'm afraid of heights? Is travel insurance included?
- **Trust note**: avoid absolute "100% safe" claims; cite regulation and refund policy instead.
- **coverImage**: needs `/images/blog/balloon-safety-guide.jpg`.

---

## Notes for owner
- All three outlines reuse the proven JSON article structure and include a planned
  6-8 item FAQ that will feed the new FAQPage JSON-LD (the `faq` field added this wave).
- Each needs a dedicated cover image (image pipeline) before publish; until then they
  can reuse an existing `/images/blog/*.jpg` as the shipped best-time article does.
- No fabricated operator names, license numbers, or awards are used in these outlines.
