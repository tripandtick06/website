// i18n node interpolation — single-key translations with {token} placeholders.
//
// Importers: split-sentence render sites (ClientForm, GdprContent, BookingClient,
//   BasariliClient, YenidenTarihClient, error.tsx).
// Replaces the brittle prefix/suffix 3-key pattern: a translator now owns the
// whole sentence in ONE key and places {token} wherever grammar/RTL demands.
//
// Usage:
//   tNodes(t.x.body, { link: <Link href="/sss">{t.x.body_link}</Link> })
// where t.x.body === "Detaylar için {link} sayfasına bakın."

import { Fragment, type ReactNode } from "react";

const TOKEN_RE = /(\{[a-zA-Z0-9_]+\})/g;

/**
 * Render a translation `template` string, substituting `{token}` placeholders
 * with ReactNode values. Unknown tokens are left as literal text.
 */
export function tNodes(
  template: string,
  nodes: Record<string, ReactNode>
): ReactNode {
  if (!template) return null;
  const parts = template.split(TOKEN_RE);
  return parts.map((part, i) => {
    const m = /^\{([a-zA-Z0-9_]+)\}$/.exec(part);
    if (m && Object.prototype.hasOwnProperty.call(nodes, m[1])) {
      return <Fragment key={i}>{nodes[m[1]]}</Fragment>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
