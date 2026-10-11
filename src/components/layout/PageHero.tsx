import { QuickContactCard } from "@/components/booking/QuickContact";

export interface PageHeroProps {
  tag: string;
  title: string;
  highlight?: string;
  description: string;
  /** /iletisim kendi formunu tasir (id=quick-contact) — orada ikinci form olmasin. */
  contactCard?: boolean;
}

export function PageHero({ tag, title, highlight, description, contactCard = true }: PageHeroProps) {
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
        <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          {description}
        </p>
        </div>
        {contactCard && <QuickContactCard className="mx-auto lg:mx-0" />}
      </div>
    </section>
  );
}
