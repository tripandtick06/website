"use client";

import { Link } from "@/i18n/routing";
import { Home, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const t = useT();
  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white border-b border-slate-200"
    >
      <div className="container-main py-3">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">{t.component.layout.breadcrumb.ana_sayfa}</span>
            </Link>
          </li>
          {items.map((it, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={it.href} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-slate-400" />
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-semibold text-slate-900"
                  >
                    {it.name}
                  </span>
                ) : (
                  <Link
                    href={it.href}
                    className="hover:text-primary transition-colors"
                  >
                    {it.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
