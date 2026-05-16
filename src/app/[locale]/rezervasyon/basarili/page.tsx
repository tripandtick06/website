import type { Metadata } from "next";
import { BasariliClient } from "./BasariliClient";

export const runtime = "edge";

// Server-component meta + client-component CTA buttons (PDF/iCal/Hesabim).
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"

export const metadata: Metadata = {
  title: "Rezervasyon Onaylandı | Trip and Tick",
  description: "Rezervasyonunuz başarıyla tamamlandı.",
  robots: { index: false, follow: false },
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams: {
    session_id?: string;
    demo?: string;
    slug?: string;
    total?: string;
    currency?: string;
    bookingId?: string;
  };
}) {
  const isDemo = searchParams?.demo === "1";
  return (
    <BasariliClient
      isDemo={isDemo}
      sessionId={searchParams?.session_id}
      slug={searchParams?.slug}
      total={searchParams?.total}
      currency={searchParams?.currency}
      bookingIdFromUrl={searchParams?.bookingId}
    />
  );
}
