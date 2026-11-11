// Markdown content negotiation for the homepage (GEO site-level, 2026-11-11).
// `GET /` with `Accept: text/markdown` -> markdown digest of the homepage.
// Facts mirror public/llms.txt + public/ai/summary.json (no new claims, no
// phone/prices beyond the published "from" price). Everything else (browsers,
// bots without text/markdown in Accept) keeps the existing HTML behaviour.
// Guard: tests/lib/markdown-home.test.ts
export const HOME_MARKDOWN = `# Trip and Tick

> Trip and Tick (tripandtick.com) is a TÜRSAB-licensed online travel agency for Cappadocia, Turkey, that books hot-air balloon flights with licensed local operators. It sells hot-air balloon tours (from €100, starting price), guided day tours, activities, airport transfers and combo packages, and provides cave-hotel information with custom quotes.

Website: https://tripandtick.com
Location: Göreme / Nevşehir, Cappadocia, Turkey
Languages indexed: TR (default), EN, DE, FR, PT-BR, JA, KO

## Services

- [Hot-air balloon tours](https://tripandtick.com/en/balloon-tours) — from €100 (starting price)
- [Day tours](https://tripandtick.com/en/tours) — Red, Green, Mix, Eco Green and sunset tours
- [Activities](https://tripandtick.com/en/activities) — ATV, jeep safari, horse riding, Turkish Hammam, microlight
- [Airport transfers](https://tripandtick.com/en/transfers) — Nevşehir (NAV) and Kayseri (ASR)
- [Combo packages](https://tripandtick.com/en/packages) — priced on request
- [Cave hotels](https://tripandtick.com/en/hotels) — information and custom quote only

## Trust

- TÜRSAB-licensed travel agency working with licensed balloon operators
- Secure 3D-Secure card payment for balloon and tour bookings
- Free-cancellation policies

## Machine-readable

- [llms.txt](https://tripandtick.com/llms.txt)
- [llms-full.txt](https://tripandtick.com/llms-full.txt)
- [ai/summary.json](https://tripandtick.com/ai/summary.json)
- [sitemap.xml](https://tripandtick.com/sitemap.xml)
`;

export function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  return accept
    .split(",")
    .some((part) => part.split(";")[0].trim().toLowerCase() === "text/markdown");
}

export function markdownHomeResponse(): Response {
  return new Response(HOME_MARKDOWN, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "no-store",
    },
  });
}
