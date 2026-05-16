import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BALLOON_PACKAGES, getBalloonPackageBySlug } from "@/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS, type ServiceItem } from "@/data/services/catalog";
import { BookingClient, type BookingService } from "./BookingClient";

type Params = { locale: string; slug: string };

function findService(slug: string): BookingService | null {
  const balloon = getBalloonPackageBySlug(slug);
  if (balloon) {
    return {
      slug: balloon.slug,
      name: balloon.name,
      category: "balloon",
      shortDescription: balloon.shortDescription,
      duration: balloon.duration,
      adultPrice: balloon.adultPrice,
      childRatio: balloon.childRatio,
      marketPrice: balloon.marketPrice,
      currency: balloon.currency,
      minAge: balloon.minAge,
      capacity: balloon.capacity,
      includes: balloon.includes,
      warnings: balloon.warnings,
      highlights: balloon.highlights,
      image: balloon.images?.[0] ?? null,
    };
  }

  const allOther: ServiceItem[] = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];
  const other = allOther.find((s) => s.slug === slug);
  if (other) {
    return {
      slug: other.slug,
      name: other.name,
      category: other.category,
      shortDescription: other.shortDescription,
      duration: other.duration,
      adultPrice: other.adultPrice,
      childRatio: 0.8,
      marketPrice: other.marketPrice,
      currency: other.currency,
      minAge: 0,
      capacity: { min: 1, max: 20 },
      includes: other.includes,
      warnings: [],
      highlights: other.highlights,
      image: null,
    };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const service = findService(params.slug);
  if (!service) {
    return { title: "Rezervasyon Bulunamadi | Trip and Tick" };
  }
  return {
    title: `Rezervasyon | ${service.name} - Trip and Tick`,
    description: `${service.name} icin online rezervasyon. ${service.shortDescription}`,
    robots: { index: false, follow: true },
  };
}

export function generateStaticParams() {
  const allOther: ServiceItem[] = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];
  return [
    ...BALLOON_PACKAGES.map((p) => ({ slug: p.slug })),
    ...allOther.map((s) => ({ slug: s.slug })),
  ];
}

export default function RezervasyonSlugPage({ params }: { params: Params }) {
  const service = findService(params.slug);
  if (!service) notFound();
  return (
    <Suspense fallback={<div className="container-main py-16 text-center text-slate-500">Yukleniyor...</div>}>
      <BookingClient service={service} />
    </Suspense>
  );
}
