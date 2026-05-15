// Supabase client singleton — browser/server distinction.
//
// Importers:
//   - src/lib/db/bookings.ts
//   - src/lib/db/availability.ts
//   - src/lib/db/customers.ts
//   - src/app/api/booking/route.ts (indirect via db/*)
// Affected: tum Supabase DB calls. Env yoksa client null doner -> mock fallback.
// Data: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (public),
//        SUPABASE_SERVICE_ROLE_KEY (server-only, RLS bypass admin operasyonlari).
// User verbatim: "src/lib/supabase.ts YENI — Singleton client + browser/server distinction"

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Placeholder degerler env-template'ten geliyor — gercek prod degil.
function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes("replace") ||
    lower === "" ||
    lower.startsWith("xxx") ||
    lower.startsWith("https://replace") ||
    lower.startsWith("https://xxx")
  );
}

export const supabaseEnabled = !isPlaceholder(URL) && !isPlaceholder(ANON);
export const supabaseAdminEnabled = supabaseEnabled && !isPlaceholder(SERVICE_ROLE);

// Module-level singletons (process icin korunur).
const g = globalThis as unknown as {
  __ttSupabaseAnon?: SupabaseClient | null;
  __ttSupabaseAdmin?: SupabaseClient | null;
};

export function supabaseAnon(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (g.__ttSupabaseAnon !== undefined) return g.__ttSupabaseAnon ?? null;
  try {
    g.__ttSupabaseAnon = createClient(URL as string, ANON as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn("[supabase] anon client init failed", err);
    g.__ttSupabaseAnon = null;
  }
  return g.__ttSupabaseAnon ?? null;
}

export function supabaseAdmin(): SupabaseClient | null {
  if (!supabaseAdminEnabled) return null;
  if (g.__ttSupabaseAdmin !== undefined) return g.__ttSupabaseAdmin ?? null;
  try {
    g.__ttSupabaseAdmin = createClient(URL as string, SERVICE_ROLE as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn("[supabase] admin client init failed", err);
    g.__ttSupabaseAdmin = null;
  }
  return g.__ttSupabaseAdmin ?? null;
}
