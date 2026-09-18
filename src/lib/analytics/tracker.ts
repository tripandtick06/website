// Davranış ölçümü — tarayıcı tarafı mantık (saf fonksiyonlar + kuyruk). Cookie YOK:
// oturum sessionStorage'da, sekme kapanınca biter; 30 dk hareketsizlik → yeni oturum.
//
// Importers:
//   - src/components/analytics/Tracker.tsx (mount, route değişimi, click/exit dinleyici)
//   - src/app/[locale]/rezervasyon/[slug]/BookingClient.tsx (booking_step)
//   - src/components/booking/SearchWidget.tsx (search)
//   - tests/lib/analytics-tracker.test.ts
// Sunucu: /api/event (src/app/api/event/route.ts). Kuyruk 5 sn'de veya 10 olayda boşalır;
// sayfa kapanışında sendBeacon (navigasyonu asla bloklamaz).

export const SESSION_IDLE_MS = 30 * 60 * 1000;
export const FLUSH_MS = 5000;
export const FLUSH_AT = 10;
export const ENDPOINT = "/api/event";

const K_SID = "tt:sid";
const K_LAST = "tt:last";
const K_SEQ = "tt:seq";
const K_REF = "tt:ref";

export type ClickKind = "whatsapp" | "reserve" | "tel" | "mail" | "outbound" | "track";

export interface TrackEvent {
  name: "page_view" | "page_exit" | "click" | "booking_step" | "search" | "form_submit" | "error";
  path: string;
  sid: string;
  seq: number;
  locale?: string;
  ref_host?: string | null;
  product?: string | null;
  props: Record<string, string | number | boolean | null>;
}

function randomId(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 8; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface Store {
  get(k: string): string | null;
  set(k: string, v: string): void;
}

function storage(): Store | null {
  try {
    const s = window.sessionStorage;
    return { get: (k) => s.getItem(k), set: (k, v) => s.setItem(k, v) };
  } catch {
    return null;
  }
}

// Bellek yedeği: sessionStorage kapalıysa (private mode) oturum sekme ömrünce RAM'de.
const mem: Record<string, string> = {};
const memStore: Store = { get: (k) => mem[k] ?? null, set: (k, v) => void (mem[k] = v) };

/** Oturum kimliğini döndürür; idle aşıldıysa yenisini açar. `now` test için. */
export function sessionId(now = Date.now(), store: Store | null = storage() ?? memStore): { sid: string; isNew: boolean } {
  const s = store ?? memStore;
  const sid = s.get(K_SID);
  const last = Number(s.get(K_LAST) ?? 0);
  if (sid && last && now - last < SESSION_IDLE_MS) {
    s.set(K_LAST, String(now));
    return { sid, isNew: false };
  }
  const fresh = randomId();
  s.set(K_SID, fresh);
  s.set(K_LAST, String(now));
  s.set(K_SEQ, "0");
  s.set(K_REF, "");
  return { sid: fresh, isNew: true };
}

export function nextSeq(store: Store | null = storage() ?? memStore): number {
  const s = store ?? memStore;
  const n = Number(s.get(K_SEQ) ?? 0) + 1;
  s.set(K_SEQ, String(n));
  return n;
}

/** Referrer host'u yalnız oturumun ilk sayfasında (site dışı ise). */
export function referrerHost(documentReferrer: string, ownHost: string, isNewSession: boolean): string | null {
  if (!isNewSession || !documentReferrer) return null;
  try {
    const h = new URL(documentReferrer).host.toLowerCase();
    if (!h || h === ownHost.toLowerCase() || h.endsWith(".tripandtick.com") || h === "tripandtick.com") return null;
    return h.slice(0, 200);
  } catch {
    return null;
  }
}

/** utm_* parametrelerini props'a taşır (kaynak analizi). */
export function utmProps(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const q = new URLSearchParams(search);
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]) {
      const v = q.get(k);
      if (v) out[k] = v.slice(0, 100);
    }
  } catch {
    /* yok */
  }
  return out;
}

/** Tıklanan elemanı sınıflandırır. data-track öncelikli; sonra href'e göre. */
export function classifyClick(el: { getAttribute(n: string): string | null }, ownHost: string): { kind: ClickKind; label: string; href: string } | null {
  const explicit = el.getAttribute("data-track");
  const href = (el.getAttribute("href") ?? "").trim();
  const label = (el.getAttribute("data-track-label") ?? el.getAttribute("aria-label") ?? "").slice(0, 120);
  if (explicit) return { kind: (explicit as ClickKind) || "track", label, href: href.slice(0, 300) };
  if (!href) return null;
  const h = href.toLowerCase();
  if (h.startsWith("tel:")) return { kind: "tel", label, href };
  if (h.startsWith("mailto:")) return { kind: "mail", label, href };
  if (/wa\.me|api\.whatsapp\.com|whatsapp:/.test(h)) return { kind: "whatsapp", label, href: href.slice(0, 300) };
  if (h.includes("/rezervasyon/")) return { kind: "reserve", label, href: href.slice(0, 300) };
  if (/^https?:\/\//.test(h)) {
    try {
      const u = new URL(href);
      if (u.host.toLowerCase() !== ownHost.toLowerCase()) return { kind: "outbound", label, href: u.host };
    } catch {
      return null;
    }
  }
  return null;
}

/** Sayfa kaydırma derinliği % (0-100). */
export function scrollDepth(scrollY: number, innerHeight: number, docHeight: number): number {
  if (docHeight <= innerHeight) return 100;
  return Math.max(0, Math.min(100, Math.round(((scrollY + innerHeight) / docHeight) * 100)));
}

// ---- kuyruk ---------------------------------------------------------------------

export interface Transport {
  beacon(body: string): boolean;
  fetch(body: string): void;
}

function browserTransport(): Transport {
  return {
    beacon(body) {
      try {
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          return navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
        }
      } catch {
        /* yok */
      }
      return false;
    },
    fetch(body) {
      try {
        void fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      } catch {
        /* yok */
      }
    },
  };
}

export class EventQueue {
  private q: TrackEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(private transport: Transport = browserTransport(), private flushMs = FLUSH_MS, private flushAt = FLUSH_AT) {}

  push(e: TrackEvent): void {
    this.q.push(e);
    if (this.q.length >= this.flushAt) this.flush();
    else if (!this.timer) this.timer = setTimeout(() => this.flush(), this.flushMs);
  }

  size(): number {
    return this.q.length;
  }

  /** `unload=true` → sendBeacon (sayfa giderken tek şans). */
  flush(unload = false): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.q.length === 0) return;
    const batch = this.q.splice(0, 25);
    const body = JSON.stringify({ events: batch });
    if (unload) {
      if (!this.transport.beacon(body)) this.transport.fetch(body);
    } else {
      this.transport.fetch(body);
    }
    if (this.q.length > 0) this.flush(unload);
  }
}
