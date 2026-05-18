import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Impressum — Trip and Tick",
  description:
    "Anbieterkennzeichnung gemäß § 5 TMG (DE) und § 18 Abs. 2 MStV. Vertreten durch Trip and Tick Turizm ve Seyahat Acentası Limited Şirketi, Göreme/Nevşehir, Türkei.",
  alternates: {
    canonical: `${SITE_URL}/impressum`,
    languages: generateHreflang("/impressum"),
  },
  openGraph: {
    title: "Impressum — Trip and Tick",
    description: "Anbieterkennzeichnung § 5 TMG · § 18 MStV · EU-Streitschlichtung.",
    url: `${SITE_URL}/impressum`,
    type: "website",
    images: [
      {
        url: ogImageUrl("Impressum", "§ 5 TMG · § 18 MStV"),
        width: 1200,
        height: 630,
        alt: "Impressum — Trip and Tick",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <PageHero
        tag="Rechtliches / Yasal"
        title="Impressum"
        description="Anbieterkennzeichnung gemäß § 5 TMG (Deutschland) und § 18 Abs. 2 MStV. Für österreichische Besucher: Offenlegung gemäß § 25 Mediengesetz."
      />

      <Breadcrumb items={[{ name: "Impressum", href: "/impressum" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            Stand: 18. Mai 2026
          </p>

          <p className="text-slate-700 mb-6 italic">
            English summary: This Impressum is provided as a courtesy to visitors from
            Germany and Austria. The operator is a Turkish travel agency; full contact
            details below.
          </p>

          <h2 className="text-2xl font-extrabold mt-4 mb-3">1. Anbieter / Diensteanbieter</h2>
          <p className="text-slate-700 mb-3">
            <strong>Trip and Tick Turizm ve Seyahat Acentası Limited Şirketi</strong>
            <br />
            (Trip and Tick Tourism and Travel Agency Ltd.)
          </p>
          <p className="text-slate-700 mb-4">
            <strong>Anschrift:</strong> Göreme Merkez, Nevşehir 50180, Türkei
            <br />
            <strong>Telefon:</strong> +90 537 464 78 61
            <br />
            <strong>E-Mail:</strong>{" "}
            <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
              info@tripandtick.com
            </a>
            <br />
            <strong>Internet:</strong>{" "}
            <a href={SITE_URL} className="text-accent font-semibold">
              www.tripandtick.com
            </a>
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">2. Vertreten durch</h2>
          <p className="text-slate-700 mb-4">
            Geschäftsführer:{" "}
            <em>siehe Handelsregistereintrag (Ticaret Sicil Gazetesi, Nevşehir)</em>
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">3. Registereintrag</h2>
          <p className="text-slate-700 mb-4">
            <strong>Handelsregister:</strong> Türkisches Handelsregister Nevşehir
            (Türkiye Ticaret Sicili — Nevşehir)
            <br />
            <strong>Reisebüro-Lizenz:</strong> TÜRSAB (Verband der türkischen
            Reisebüros)
            <br />
            <strong>Umsatzsteuer-IdNr.:</strong> Türkische Steuernummer (Vergi
            Kimlik No.) — auf Anfrage
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            4. Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="text-slate-700 mb-4">
            Trip and Tick Turizm ve Seyahat Acentası Limited Şirketi
            <br />
            Göreme Merkez, Nevşehir 50180, Türkei
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">5. Aufsichtsbehörden</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>
              <strong>TÜRSAB</strong> (Türkische Reisebüro-Verband) —{" "}
              <a
                href="https://www.tursab.org.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold"
              >
                tursab.org.tr
              </a>
            </li>
            <li>
              <strong>KVKK</strong> (Türkische Datenschutzbehörde) —{" "}
              <a
                href="https://www.kvkk.gov.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold"
              >
                kvkk.gov.tr
              </a>
            </li>
            <li>
              Verbraucher aus der EU: zuständige Behörden in Ihrem Heimatstaat —
              für Deutschland z. B. die Schlichtungsstelle für den
              öffentlichen Personenverkehr (söp).
            </li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            6. EU-Streitschlichtung
          </h2>
          <p className="text-slate-700 mb-3">
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:
          </p>
          <p className="text-slate-700 mb-3">
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-semibold"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
          <p className="text-slate-700 mb-4">
            Unsere E-Mail-Adresse finden Sie oben unter Punkt 1.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            7. Verbraucherstreitbeilegung / Universalschlichtungsstelle
          </h2>
          <p className="text-slate-700 mb-4">
            Wir sind <strong>nicht</strong> bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen. Streitigkeiten zwischen
            Kunde und Trip and Tick werden direkt per E-Mail oder über die
            türkischen Schiedsstellen (TÜRSAB Tahkim Kurulu) beigelegt.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">8. Offenlegung (Österreich, § 25 MedienG)</h2>
          <p className="text-slate-700 mb-4">
            <strong>Medieninhaber:</strong> Trip and Tick Turizm ve Seyahat
            Acentası Limited Şirketi, Göreme Merkez, Nevşehir 50180, Türkei.
            <br />
            <strong>Unternehmensgegenstand:</strong> Online-Vermittlung von
            Reise-, Heißluftballonflug- und Hoteldienstleistungen in Kappadokien.
            <br />
            <strong>Grundlegende Richtung:</strong> Vermittlung touristischer
            Leistungen unter Wahrung der Verbraucherrechte gemäß GDPR/KVKK.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">9. Haftungsausschluss</h2>
          <h3 className="text-lg font-bold mt-4 mb-2">Haftung für Inhalte</h3>
          <p className="text-slate-700 mb-3">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen
            zu überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>
          <h3 className="text-lg font-bold mt-4 mb-2">Haftung für Links</h3>
          <p className="text-slate-700 mb-3">
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf
            deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
            diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
            der verlinkten Seiten ist stets der jeweilige Anbieter oder
            Betreiber der Seiten verantwortlich.
          </p>
          <h3 className="text-lg font-bold mt-4 mb-2">Urheberrecht</h3>
          <p className="text-slate-700 mb-4">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem türkischen Urheberrecht (Fikir ve
            Sanat Eserleri Kanunu, Nr. 5846) sowie dem internationalen
            Urheberrechtsschutz. Vervielfältigung, Bearbeitung, Verbreitung
            und jede Art der Verwertung außerhalb der Grenzen des
            Urheberrechtes bedürfen der schriftlichen Zustimmung des
            jeweiligen Autors bzw. Erstellers.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            10. Datenschutz & Verbraucherrechte
          </h2>
          <p className="text-slate-700 mb-3">
            Informationen zur Verarbeitung personenbezogener Daten finden Sie
            in unserer{" "}
            <Link href="/gizlilik-politikasi" className="text-accent font-semibold">
              Datenschutzerklärung
            </Link>
            . GDPR-Anträge (Art. 15 Auskunft / Art. 17 Löschung) können Sie über
            unser{" "}
            <Link href="/gdpr" className="text-accent font-semibold">
              Datenrechte-Formular
            </Link>{" "}
            stellen — mit 24-stündigem Magic-Link-Verfahren.
          </p>

          <p className="text-xs text-slate-500 mt-8 border-t pt-4">
            Stand: 18. Mai 2026. Inhaltliche Änderungen vorbehalten. Bei
            Fragen zur Rechtmäßigkeit unseres Angebots wenden Sie sich an{" "}
            <a href="mailto:info@tripandtick.com" className="text-accent">
              info@tripandtick.com
            </a>
            .
          </p>
        </div>
      </article>
    </>
  );
}
