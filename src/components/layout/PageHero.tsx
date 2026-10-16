import NextImage from "next/image";
import { QuickContactCard } from "@/components/booking/QuickContact";
import { TrustBadges } from "@/components/sections/TrustBadges";

export interface PageHeroProps {
  tag: string;
  title: string;
  highlight?: string;
  description: string;
  /** /iletisim kendi formunu tasir (id=quick-contact) — orada ikinci form olmasin. */
  contactCard?: boolean;
  /** H1 altinda fiyat alt-satiri ("from" kalibi; net fiyat degil). */
  subline?: string;
  /** Sadece mobilde, aciklama ile form karti arasinda urun fotosu (LCP, priority). */
  mobileImage?: { src: string; alt: string };
  /** Form kartinin altinda guven satiri (iade / sigorta / TURSAB). */
  trust?: boolean;
}

export function PageHero({ tag, title, highlight, description, contactCard = true, subline, mobileImage, trust = false }: PageHeroProps) {
  return (
    <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
      <div className="container-main grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:gap-12 lg:py-20">
        <div className="text-center lg:text-left">
        <span className="inline-block bg-white/[0.08] text-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
          {tag}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
          {title}
          {highlight && (
            <>
              {" "}
              <span className="text-accent">{highlight}</span>
            </>
          )}
        </h1>
        {subline && (
          <p className="-mt-2 mb-4 text-base sm:text-lg font-semibold text-accent-light">{subline}</p>
        )}
        <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          {description}
        </p>
        {mobileImage && (
          <div className="relative mx-auto mt-5 aspect-[16/9] w-full max-w-[300px] overflow-hidden rounded-xl border border-white/15 lg:hidden">
            <NextImage src={mobileImage.src} alt={mobileImage.alt} fill priority sizes="300px" className="object-cover" />
          </div>
        )}
        </div>
        {contactCard && (
          <div className="mx-auto flex w-full max-w-md flex-col gap-4 lg:mx-0">
            <QuickContactCard className="mx-auto lg:mx-0" />
            {trust && <TrustBadges compact />}
          </div>
        )}
      </div>
    </section>
  );
}
