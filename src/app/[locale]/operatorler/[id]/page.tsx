// /operatorler/[id] — Operator detay sayfa (SSG).
//
// Importers: Next.js routing; generateStaticParams ile OPERATORS prebuild,
//   /operatorler list page linkleri, sitemap.ts auto-discovery.
// Affected: SEO operator-bazli sayfa + linkli paketler + testimonial blok.
// Data: OPERATORS (read-only), BALLOON_PACKAGES filter operatorIds.includes(id),
//       pickReviews mock testimonial; Schema.org Organization+AggregateRating
// User verbatim: "devam et"

import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Users as UsersIcon,
  ShieldCheck,
  Award,
  Languages,
  CheckCircle2,
} from "lucide-react";

export const runtime = "edge";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/layout/JsonLd";
import { OPERATORS, getOperatorById } from "@/data/services/operators";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { pickReviews } from "@/data/reviews";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { formatPrice, cn } from "@/lib/utils";

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
  const ops = op;

  const packages = BALLOON_PACKAGES.filter((p) =>
    p.operatorIds.includes(ops.id)
  );
  const reviews = pickReviews(4, `op:${ops.id}`);
  const yearsActive = new Date().getFullYear() - ops.founded;

  return (
    <>
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
        <div className="container-main py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/[0.08] text-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
              Operatör · Lisans {ops.licenseNo}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              {ops.name}
            </h1>
            {ops.tagline && (
              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                {ops.tagline}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold">
                <Star className="w-4 h-4 fill-warning text-warning" />
                {ops.rating.toFixed(2)} / 5.0
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm">
                {ops.reviewCount.toLocaleString("tr-TR")} yorum
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm">
                <Calendar className="w-4 h-4" /> {ops.founded} ({yearsActive}+ yıl)
              </span>
              {ops.fleetSize && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm">
                  <ShieldCheck className="w-4 h-4" /> {ops.fleetSize} balon
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <Breadcrumb
        items={[
          { name: "Operatörler", href: "/operatorler" },
          { name: ops.name, href: `/operatorler/${ops.id}` },
        ]}
      />

      <div className="bg-slate-50 py-12">
        <div className="container-main grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {ops.name} Hakkında
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {ops.description}
              </p>
              {ops.specialties && ops.specialties.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Uzmanlık Alanları
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ops.specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {packages.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {ops.name} Balon Paketleri
                </h2>
                <p className="text-slate-600 text-sm mb-6">
                  Bu operatörün gerçekleştirdiği {packages.length} paket arasından
                  seçim yapabilirsiniz.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <Link
                      key={pkg.slug}
                      href={`/balonlar/${pkg.slug}`}
                      className="border border-slate-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                            pkg.badgeColor === "accent" && "bg-amber-100 text-amber-700",
                            pkg.badgeColor === "success" && "bg-emerald-100 text-emerald-700",
                            pkg.badgeColor === "warning" && "bg-rose-100 text-rose-700",
                            pkg.badgeColor === "primary" && "bg-indigo-100 text-indigo-700"
                          )}
                        >
                          {pkg.badge}
                        </span>
                        <span className="text-xs flex items-center gap-0.5 text-slate-500">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {pkg.rating}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{pkg.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">
                        {pkg.shortDescription}
                      </p>
                      <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">{pkg.duration}</span>
                        <span className="font-bold text-amber-600">
                          {formatPrice(pkg.adultPrice, pkg.currency)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Misafir Yorumları
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {ops.name} ile uçuş yapan misafirlerden seçili yorumlar.
              </p>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <article
                    key={r.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "w-3.5 h-3.5",
                              n <= r.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs uppercase font-bold text-slate-400">
                        {r.service}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 italic mb-2">
                      &ldquo;{r.text}&rdquo;
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.name} {r.flag} — {r.date}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Künye</h3>
              <div className="space-y-3 text-sm">
                <KeyValue label="SHGM Lisansı" value={ops.licenseNo} icon={<Award className="w-4 h-4" />} />
                <KeyValue label="Kuruluş" value={`${ops.founded} (${yearsActive}+ yıl)`} icon={<Calendar className="w-4 h-4" />} />
                {ops.fleetSize && (
                  <KeyValue label="Filo" value={`${ops.fleetSize} balon`} icon={<ShieldCheck className="w-4 h-4" />} />
                )}
                {ops.pilotCount && (
                  <KeyValue label="Pilot Kadrosu" value={`${ops.pilotCount} pilot`} icon={<UsersIcon className="w-4 h-4" />} />
                )}
                {ops.address && (
                  <KeyValue label="Adres" value={ops.address} icon={<MapPin className="w-4 h-4" />} />
                )}
                {ops.phone && (
                  <KeyValue label="Telefon" value={ops.phone} icon={<Phone className="w-4 h-4" />} />
                )}
                {ops.website && (
                  <KeyValue
                    label="Web"
                    value={
                      <a
                        href={ops.website}
                        target="_blank"
                        rel="noopener nofollow"
                        className="text-amber-600 hover:underline break-all"
                      >
                        {ops.website.replace(/^https?:\/\//, "")}
                      </a>
                    }
                    icon={<Globe className="w-4 h-4" />}
                  />
                )}
                {ops.languages && ops.languages.length > 0 && (
                  <KeyValue
                    label="Diller"
                    value={ops.languages.join(", ")}
                    icon={<Languages className="w-4 h-4" />}
                  />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Rezervasyon</h3>
              <p className="text-sm text-white/90 mb-4">
                {ops.name} ile uçmak için Trip and Tick üzerinden tek tıkla
                rezervasyon yapabilirsiniz.
              </p>
              <Link
                href="/balonlar"
                className="block text-center bg-white text-amber-600 font-bold py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Paketleri Gör
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Sertifikalar
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>SHGM Ticari Hava Aracı İşletme Sertifikası</li>
                <li>EASA Part-BOP Balloon Operations</li>
                <li>TÜRSAB üyeliği</li>
                <li>40M EUR Üçüncü Şahıs Sorumluluk Sigortası</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Operatörler", href: "/operatorler" },
            { name: ops.name, href: `/operatorler/${ops.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/operatorler/${ops.id}#org`,
            name: ops.name,
            url: ops.website ?? `${SITE_URL}/operatorler/${ops.id}`,
            foundingDate: String(ops.founded),
            description: ops.description.slice(0, 600),
            address: ops.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: ops.address,
                  addressCountry: "TR",
                }
              : undefined,
            telephone: ops.phone,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: ops.rating,
              reviewCount: ops.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          },
        ]}
      />
    </>
  );
}

function KeyValue({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-slate-400 mt-0.5">{icon}</span>}
      <div className="flex-1">
        <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
          {label}
        </p>
        <p className="text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  );
}
