// /operatorler/[id] — Operator detay sayfa (SSG).
//
// Importers: Next.js routing; generateStaticParams ile OPERATORS prebuild,
//   /operatorler list page linkleri, sitemap.ts auto-discovery.
// Affected: SEO operator-bazli sayfa + linkli paketler + testimonial blok.
// Data: OPERATORS (read-only), BALLOON_PACKAGES filter operatorIds.includes(id),
//       pickReviews mock testimonial; Schema.org Organization+AggregateRating
// User verbatim: "page.tsx SERVER kalır"

import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const dynamicParams = false;

import { JsonLd } from "@/components/layout/JsonLd";
import { OPERATORS, getOperatorById } from "@/data/services/operators";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { pickReviews } from "@/data/reviews";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { canonicalFor, generateHreflang } from "@/lib/hreflang";
import { operatorFaqs } from "@/lib/operator-faq";
import { OperatorDetayContent } from "./OperatorDetayContent";

export function generateStaticParams() {
  return OPERATORS.map((o) => ({ id: o.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const op = getOperatorById(params.id);
  if (!op) return { title: "Operator bulunamadı" };
  const isTr = params.locale === "tr";
  const title = isTr
    ? `${op.name} — Fiyatlar ve Rezervasyon 2026`
    : `${op.aliases[0] ?? op.name} — Prices & Booking 2026`;
  const description = isTr
    ? `${op.name} ile Kapadokya balon turu: Trip and Tick üzerinden paketler, güncel fiyat ve rezervasyon. Gün doğumu uçuşu, otel transferi, hava iptalinde %100 iade.`
    : `${op.aliases[0] ?? op.name} balloon flights in Cappadocia: packages, live prices and booking through Trip and Tick. Sunrise flight, hotel transfer, 100% refund on weather cancellation.`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalFor(`/operatorler/${op.id}`, params.locale),
      languages: generateHreflang(`/operatorler/${op.id}`),
    },
  };
}

export default function OperatorDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const op = getOperatorById(params.id);
  if (!op) notFound();

  const packages = BALLOON_PACKAGES.filter((p) =>
    p.operatorIds.includes(op.id)
  );
  const reviews = pickReviews(4, `op:${op.id}`);
  const faqs = operatorFaqs(op, packages, params.locale);

  return (
    <>
      <OperatorDetayContent
        op={op}
        packages={packages}
        reviews={reviews}
        faqs={faqs}
      />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Operatörler", href: "/operatorler" },
            { name: op.name, href: `/operatorler/${op.id}` },
          ]),
          faqPageSchema(faqs),
        ]}
      />
    </>
  );
}
