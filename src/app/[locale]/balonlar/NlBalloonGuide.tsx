import {
  NL_BALLOON_FAQ,
  NL_GUIDE_INTRO,
  NL_GUIDE_LAST_UPDATED,
  NL_GUIDE_SECTIONS,
  NL_GUIDE_TITLE,
} from "@/data/i18n/nlBalloonGuide";

// Original Dutch editorial block on /nl/ballonvaarten (server component, no JS).
// FAQ rendered here is the same list emitted as FAQPage JSON-LD in page.tsx.
export function NlBalloonGuide() {
  return (
    <>
      <section className="section-padding bg-white" id="gids">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">{NL_GUIDE_TITLE}</h2>
          <p className="text-slate-700 mb-2 speakable">{NL_GUIDE_INTRO}</p>
          <p className="text-sm text-slate-500 mb-8">
            Bijgewerkt op <time dateTime={NL_GUIDE_LAST_UPDATED}>17 oktober 2026</time> door de redactie van Trip and Tick.
          </p>
          {NL_GUIDE_SECTIONS.map((s) => (
            <article key={s.id} id={s.id} className="mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{s.heading}</h3>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>
      <section className="section-padding bg-slate-50" id="veelgestelde-vragen-ballonvaart">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Veelgestelde vragen over ballonvaren in Cappadocië
          </h2>
          <div className="space-y-4">
            {NL_BALLOON_FAQ.map((f) => (
              <details key={f.question} className="rounded-xl bg-white p-4 shadow-card">
                <summary className="cursor-pointer font-semibold text-slate-900">{f.question}</summary>
                <p className="mt-2 text-slate-700">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
