export interface PageHeroProps {
  tag: string;
  title: string;
  highlight?: string;
  description: string;
}

export function PageHero({ tag, title, highlight, description }: PageHeroProps) {
  return (
    <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
      <div className="container-main py-16 sm:py-20 lg:py-24 text-center">
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
        <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
