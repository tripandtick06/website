"use client";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { SITE_URL } from "@/lib/schema";
import { useT } from "@/lib/i18n/I18nProvider";

export function ImpressumContent() {
  const t = useT();
  const d = t.page.impressum;

  return (
    <>
      <PageHero
        tag={d.pagehero_tag}
        title={d.pagehero_title}
        description={d.pagehero_description}
      />

      <Breadcrumb items={[{ name: d.breadcrumb_name, href: "/impressum" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            {d.stand_date}
          </p>

          <p className="text-slate-700 mb-6 italic">
            {d.english_summary}
          </p>

          <h2 className="text-2xl font-extrabold mt-4 mb-3">{d.h2_anbieter}</h2>
          <p className="text-slate-700 mb-3">
            <strong>{d.company_name_full}</strong>
            <br />
            ({d.company_name_en})
          </p>
          <p className="text-slate-700 mb-4">
            <strong>{d.label_anschrift}:</strong> {d.address}
            <br />
            <strong>{d.label_telefon}:</strong> +90 537 464 78 61
            <br />
            <strong>{d.label_email}:</strong>{" "}
            <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
              info@tripandtick.com
            </a>
            <br />
            <strong>{d.label_internet}:</strong>{" "}
            <a href={SITE_URL} className="text-accent font-semibold">
              www.tripandtick.com
            </a>
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.h2_vertreten}</h2>
          <p className="text-slate-700 mb-4">
            {d.geschaeftsfuehrer_label}{" "}
            <em>{d.geschaeftsfuehrer_value}</em>
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.h2_register}</h2>
          <p className="text-slate-700 mb-4">
            <strong>{d.label_handelsregister}:</strong> {d.handelsregister_value}
            <br />
            <strong>{d.label_reisebuero_lizenz}:</strong> {d.reisebuero_lizenz_value}
            <br />
            <strong>{d.label_ust_id}:</strong> {d.ust_id_value}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.h2_verantwortlich}
          </h2>
          <p className="text-slate-700 mb-4">
            {d.verantwortlich_company}
            <br />
            {d.verantwortlich_address}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.h2_aufsicht}</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>
              <strong>TÜRSAB</strong> {d.tursab_description}{" "}
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
              <strong>KVKK</strong> {d.kvkk_description}{" "}
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
              {d.eu_verbraucher_text}
            </li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.h2_eu_streit}
          </h2>
          <p className="text-slate-700 mb-3">
            {d.eu_kommission_text}
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
            {d.email_unter_punkt_1}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.h2_verbraucher_streit}
          </h2>
          <p className="text-slate-700 mb-4">
            {d.verbraucher_streit_text_prefix}<strong>{d.verbraucher_streit_nicht}</strong>{d.verbraucher_streit_text_suffix}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.h2_offenlegung}</h2>
          <p className="text-slate-700 mb-4">
            <strong>{d.label_medieninhaber}:</strong> {d.medieninhaber_value}
            <br />
            <strong>{d.label_unternehmensgegenstand}:</strong> {d.unternehmensgegenstand_value}
            <br />
            <strong>{d.label_grundlegende_richtung}:</strong> {d.grundlegende_richtung_value}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.h2_haftung}</h2>
          <h3 className="text-lg font-bold mt-4 mb-2">{d.h3_haftung_inhalte}</h3>
          <p className="text-slate-700 mb-3">
            {d.haftung_inhalte_text}
          </p>
          <h3 className="text-lg font-bold mt-4 mb-2">{d.h3_haftung_links}</h3>
          <p className="text-slate-700 mb-3">
            {d.haftung_links_text}
          </p>
          <h3 className="text-lg font-bold mt-4 mb-2">{d.h3_urheberrecht}</h3>
          <p className="text-slate-700 mb-4">
            {d.urheberrecht_text}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.h2_datenschutz}
          </h2>
          <p className="text-slate-700 mb-3">
            {d.datenschutz_text_prefix}{" "}
            <Link href="/gizlilik-politikasi" className="text-accent font-semibold">
              {d.datenschutz_link_text}
            </Link>
            {d.datenschutz_text_middle}{" "}
            <Link href="/gdpr" className="text-accent font-semibold">
              {d.gdpr_link_text}
            </Link>{" "}
            {d.datenschutz_text_suffix}
          </p>

          <p className="text-xs text-slate-500 mt-8 border-t pt-4">
            {d.footer_note_prefix}{" "}
            <a href="mailto:info@tripandtick.com" className="text-accent">
              info@tripandtick.com
            </a>
            {d.footer_note_suffix}
          </p>
        </div>
      </article>
    </>
  );
}
