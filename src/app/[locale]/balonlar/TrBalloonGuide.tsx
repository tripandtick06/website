import { Link } from "@/i18n/routing";
import {
  TR_BALLOON_GUIDE_FAQ,
  TR_GUIDE_INTRO,
  TR_GUIDE_LAST_UPDATED,
  TR_GUIDE_SECTIONS,
  TR_GUIDE_TITLE,
} from "@/data/trBalloonGuide";

// Original Turkish editorial block on /balonlar (TR only; server component, no JS).
// The FAQ rendered here is the same list merged into the FAQPage JSON-LD in page.tsx.
const linkCls = "text-primary font-semibold underline underline-offset-2";

export function TrBalloonGuide() {
  return (
    <>
      <section className="section-padding bg-white" id="rehber">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">{TR_GUIDE_TITLE}</h2>
          <p className="text-slate-700 mb-2 speakable">{TR_GUIDE_INTRO}</p>
          <p className="text-sm text-slate-500 mb-8">
            Güncelleme: <time dateTime={TR_GUIDE_LAST_UPDATED}>18 Ekim 2026</time>, Trip and Tick editörlüğü.
          </p>
          {TR_GUIDE_SECTIONS.map((s) => (
            <article key={s.id} id={s.id} className="mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{s.heading}</h3>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </article>
          ))}
          <p className="text-slate-700 leading-relaxed">
            Paketleri ayrı ayrı görmek için{" "}
            <Link href={{ pathname: "/balonlar/[slug]", params: { slug: "standart-balon-ucusu" } }} className={linkCls}>
              Standart Balon Uçuşu
            </Link>{" "}
            ve{" "}
            <Link href={{ pathname: "/balonlar/[slug]", params: { slug: "romantik-ozel-balon" } }} className={linkCls}>
              Romantik Özel Balon
            </Link>{" "}
            sayfalarına, rüzgâr tahmini için{" "}
            <Link href="/balonlar/bugun-ucuyor-mu" className={linkCls}>
              Bugün balonlar uçuyor mu?
            </Link>{" "}
            sayfasına, operatörleri tanımak için{" "}
            <Link href="/operatorler" className={linkCls}>
              operatörler
            </Link>{" "}
            sayfasına ve fiyat kalemleri için{" "}
            <Link href={{ pathname: "/blog/[slug]", params: { slug: "kapadokya-balon-turu-fiyat-2026" } }} className={linkCls}>
              balon turu fiyat rehberine
            </Link>{" "}
            bakabilirsiniz.
          </p>
        </div>
      </section>
      <section className="section-padding bg-slate-50" id="balon-rehberi-sss">
        <div className="container-main max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Kapadokya balon turu hakkında ek sorular
          </h2>
          <div className="space-y-4">
            {TR_BALLOON_GUIDE_FAQ.map((f) => (
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
