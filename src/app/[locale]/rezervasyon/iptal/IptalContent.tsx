"use client";

// /rezervasyon/iptal — client content component with i18n.
// Importers: src/app/[locale]/rezervasyon/iptal/page.tsx
// Affected: tüm JSX TR string'leri → t.page.rezervasyon.iptal.*
// User verbatim: "SERVER→CLIENT SPLIT: JSX gövdesi YENİ <Sayfa>Content.tsx"

import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";

interface IptalContentProps {
  retrySlug: string;
}

export function IptalContent({ retrySlug }: IptalContentProps) {
  const t = useT();
  const d = t.page.rezervasyon.iptal;
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 lg:p-12 text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
          {d.odeme_iptal_edildi}
        </h1>
        <p className="text-slate-600 mb-6">{d.odeme_isleminiz_tamamlanmadi}</p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-slate-700">
            <strong>{d.bilgi_etiketi}</strong> {d.rezervasyon_bilgileriniz}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Link
            href={{ pathname: "/rezervasyon/[slug]", params: { slug: retrySlug } }}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> {d.tekrar_dene}
          </Link>
          <a
            href="https://wa.me/905374647861"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium"
          >
            <MessageCircle className="w-4 h-4" /> {d.whatsapp_destek}
          </a>
        </div>

        <div className="border-t border-slate-100 pt-6 text-xs text-slate-500">
          <p>{d.sorun_yasiyorsaniz}</p>
          <p className="mt-1">
            <a href="mailto:hello@tripandtick.com" className="underline">
              hello@tripandtick.com
            </a>{" "}
            · +90 537 464 78 61
          </p>
        </div>
      </div>
    </main>
  );
}
