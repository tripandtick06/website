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

export const runtime = "edge";

import { JsonLd } from "@/components/layout/JsonLd";
import { OPERATORS, getOperatorById } from "@/data/services/operators";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { pickReviews } from "@/data/reviews";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
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
  if (!op) return { title: "Operator bulunamadı | Trip and Tick" };
  return {
    title: `${op.name} — Kapadokya Balon Operatörü | Trip and Tick`,
    description:
      op.tagline ??
      `${op.name} — ${op.founded} kuruluş, SHGM lisanslı, ${op.reviewCount.toLocaleString("tr-TR")}+ yorum. ${op.description.slice(0, 100)}...`,
    alternates: {
      canonical: `${SITE_URL}/operatorler/${op.id}`,
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
  const yearsActive = new Date().getFullYear() - op.founded;

  return (
    <>
      <OperatorDetayContent
        op={op}
        packages={packages}
        reviews={reviews}
        yearsActive={yearsActive}
      />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Operatörler", href: "/operatorler" },
            { name: op.name, href: `/operatorler/${op.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/operatorler/${op.id}#org`,
            name: op.name,
            url: op.website ?? `${SITE_URL}/operatorler/${op.id}`,
            foundingDate: String(op.founded),
            description: op.description.slice(0, 600),
            address: op.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: op.address,
                  addressCountry: "TR",
                }
              : undefined,
            telephone: op.phone,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: op.rating,
              reviewCount: op.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          },
        ]}
      />
    </>
  );
}
