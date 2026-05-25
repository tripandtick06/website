// Schema.org JSON-LD helpers — Trip and Tick AI cite-friendly markup.

import { COMPANY, FOUNDER, type Founder } from "@/data/founder";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.tripandtick.com";

export const ORG_ID = `${SITE_URL}/#organization`;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["TravelAgency", "LocalBusiness"],
  "@id": ORG_ID,
  name: "Trip and Tick",
  alternateName: "TripAndTick",
  legalName: COMPANY.legalName,
  foundingDate: COMPANY.foundingDate,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-default.jpg`,
  description:
    "Kapadokya balon turu, otel, transfer ve gezi turları için TÜRSAB lisanslı online seyahat acentası. 9+ operatörle doğrudan acentelik, en düşük fiyat garantisi.",
  email: COMPANY.email,
  telephone: COMPANY.phone,
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.locality,
    addressRegion: COMPANY.address.region,
    postalCode: COMPANY.address.postalCode,
    addressCountry: COMPANY.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: COMPANY.geo.lat,
    longitude: COMPANY.geo.lng,
  },
  areaServed: {
    "@type": "Place",
    name: "Kapadokya",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: COMPANY.phone,
      email: COMPANY.email,
      contactType: "customer service",
      areaServed: "TR",
      availableLanguage: ["Turkish", "English"],
    },
    {
      "@type": "ContactPoint",
      email: COMPANY.billingEmail,
      contactType: "billing support",
    },
  ],
  founder: {
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: FOUNDER.title,
    email: FOUNDER.email,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "12000",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    COMPANY.social.instagram,
    COMPANY.social.facebook,
    COMPANY.social.twitter,
    COMPANY.social.youtube,
    COMPANY.social.linkedin,
  ],
  openingHours: "Mo-Su 00:00-23:59",
};

export function personSchema(p: Founder) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    jobTitle: p.title,
    description: p.bio,
    email: p.email,
    telephone: p.phone,
    image: p.image ? `${SITE_URL}${p.image}` : undefined,
    sameAs: [p.linkedin, p.twitter].filter(Boolean),
    worksFor: { "@id": ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.href.startsWith("http") ? it.href : `${SITE_URL}${it.href}`,
    })),
  };
}

export interface TouristTripInput {
  slug: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image?: string;
  /** Price hidden in UI (quote-based) — omit numeric price from Offer. */
  priceOnRequest?: boolean;
}

export function touristTripSchema(p: TouristTripInput) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: p.name,
    description: p.description,
    url: `${SITE_URL}/balonlar/${p.slug}`,
    image: p.image ? `${SITE_URL}${p.image}` : `${SITE_URL}/og-default.jpg`,
    touristType: ["Couples", "Families", "Solo", "Groups"],
    itinerary: {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Otelden alış" },
        { "@type": "ListItem", position: 2, name: "Kalkış noktasında kahvaltı" },
        { "@type": "ListItem", position: 3, name: `${p.duration} balon uçuşu` },
        { "@type": "ListItem", position: 4, name: "İniş + şampanya + sertifika" },
        { "@type": "ListItem", position: 5, name: "Otele dönüş" },
      ],
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/balonlar/${p.slug}`,
      ...(p.priceOnRequest
        ? {}
        : { price: p.price.toString(), priceCurrency: p.currency }),
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString().split("T")[0],
    },
    provider: { "@id": ORG_ID },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating.toString(),
      reviewCount: p.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}

export interface ArticleInput {
  slug: string;
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  authorType?: "Person" | "Organization";
  authorUrl?: string;
  keywords?: string[];
}

export function articleSchema(a: ArticleInput) {
  const authorNode =
    a.authorType === "Person"
      ? {
          "@type": "Person",
          name: a.author || FOUNDER.name,
          ...(a.authorUrl ? { url: a.authorUrl } : {}),
        }
      : {
          "@type": "Organization",
          name: a.author || "Trip and Tick Editöryal",
          url: SITE_URL,
        };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: a.image ? `${SITE_URL}${a.image}` : `${SITE_URL}/og-default.jpg`,
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    author: authorNode,
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${a.slug}`,
    },
    ...(a.keywords && a.keywords.length ? { keywords: a.keywords.join(", ") } : {}),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".speakable"],
    },
  };
}

export interface ServiceInput {
  slug: string;
  category: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
}

export function serviceSchema(s: ServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.category,
    name: s.name,
    description: s.description,
    url: `${SITE_URL}/rezervasyon/${s.slug}`,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Place", name: "Kapadokya" },
    offers: {
      "@type": "Offer",
      price: s.price.toString(),
      priceCurrency: s.currency,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: s.rating.toString(),
      reviewCount: s.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export interface ReviewInput {
  author: string;
  rating: number;
  text: string;
  date: string; // YYYY-MM-DD
  itemName?: string;
}

/** Single schema.org Review node — embed inside Product/Service `review`. */
export function reviewSchema(r: ReviewInput) {
  return {
    "@type": "Review",
    author: { "@type": "Person", name: r.author },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody: r.text,
    datePublished: r.date,
    ...(r.itemName
      ? { itemReviewed: { "@type": "Thing", name: r.itemName } }
      : {}),
  };
}

export interface ProductSchemaInput {
  slug: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  category?: string;
  urlPath?: string; // default /balonlar/<slug>
  reviews?: ReviewInput[];
  /** Price hidden in UI (quote-based) — omit numeric price from Offer. */
  priceOnRequest?: boolean;
}

/**
 * Product + Offer + AggregateRating + Review — strongest commerce signal for
 * AI assistants and Google rich results. Refund guarantee surfaced via
 * hasMerchantReturnPolicy (trust cue LLMs cite).
 */
export function productSchema(p: ProductSchemaInput) {
  const url = `${SITE_URL}${p.urlPath ?? `/balonlar/${p.slug}`}`;
  const priceValidUntil = new Date(Date.now() + 365 * 86400000)
    .toISOString()
    .split("T")[0];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image ? `${SITE_URL}${p.image}` : `${SITE_URL}/og-default.jpg`,
    url,
    sku: p.slug,
    brand: { "@type": "Brand", name: "Trip and Tick" },
    ...(p.category ? { category: p.category } : {}),
    offers: {
      "@type": "Offer",
      url,
      ...(p.priceOnRequest
        ? {}
        : {
            price: p.price.toString(),
            priceCurrency: p.currency,
            priceValidUntil,
          }),
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 3,
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating.toString(),
      reviewCount: p.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    ...(p.reviews && p.reviews.length
      ? { review: p.reviews.map(reviewSchema) }
      : {}),
  };
}

export interface LodgingInput {
  slug: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  region?: string;
  amenities?: string[];
  priceRange?: string;
}

/**
 * Hotel (LodgingBusiness) schema — info-only hotel pages (no online price).
 * aggregateRating + amenityFeature give AI assistants citable "best cave
 * hotel" answer material.
 */
export function lodgingSchema(h: LodgingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: h.name,
    description: h.description,
    url: `${SITE_URL}/oteller/${h.slug}`,
    ...(h.region
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: h.region,
            addressRegion: "Nevşehir",
            addressCountry: "TR",
          },
        }
      : {}),
    ...(h.priceRange ? { priceRange: h.priceRange } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: h.rating.toString(),
      reviewCount: h.reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    ...(h.amenities && h.amenities.length
      ? {
          amenityFeature: h.amenities.map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a,
            value: true,
          })),
        }
      : {}),
  };
}

export interface ItemListEntry {
  name: string;
  urlPath: string;
  position?: number;
}

/**
 * ItemList — helps AI answer "best/compare X" queries by exposing a ranked
 * catalogue (balloon packages, hotels) as a single structured list.
 */
export function itemListSchema(items: ItemListEntry[], listName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(listName ? { name: listName } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: it.position ?? idx + 1,
      name: it.name,
      url: it.urlPath.startsWith("http")
        ? it.urlPath
        : `${SITE_URL}${it.urlPath}`,
    })),
  };
}
