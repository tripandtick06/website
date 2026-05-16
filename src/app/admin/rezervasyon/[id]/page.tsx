// Admin rezervasyon detay sayfasi — server-shell + Client.tsx pattern.
// Cloudflare Pages edge runtime gereği client component server-wrapper ile sarilir.

import AdminBookingDetailClient from "./Client";

export const runtime = "edge";

export default function Page() {
  return <AdminBookingDetailClient />;
}
