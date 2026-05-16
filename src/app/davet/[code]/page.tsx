// /davet/[code] — Referans davet landing (server-shell + Client.tsx pattern).
// Cloudflare Pages edge runtime gereği client component server-wrapper ile sarilir.

import DavetClient from "./Client";

export const runtime = "edge";

export default function Page() {
  return <DavetClient />;
}
