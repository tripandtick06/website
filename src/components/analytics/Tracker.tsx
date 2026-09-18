"use client";

// Davranış ölçümü mount noktası — src/app/[locale]/layout.tsx <body> sonu.
// Route değişiminde page_view; pagehide/gizlenmede page_exit (süre + kaydırma);
// delegated click (wa.me / tel / rezervasyon / data-track / dış link).
// Cookie yok, consent kapısı yok (kişisel veri toplanmıyor; cerez politikasında
// "anonim istatistik" olarak beyan edilir). Bot/webdriver → hiç çalışmaz.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/I18nProvider";
import {
  EventQueue,
  classifyClick,
  nextSeq,
  referrerHost,
  scrollDepth,
  sessionId,
  utmProps,
  type TrackEvent,
} from "@/lib/analytics/tracker";

// Modül-seviyesi tek kuyruk: BookingClient/SearchWidget `track()` ile aynı kuyruğa yazar.
let queue: EventQueue | null = null;
let current: { path: string; sid: string; seq: number; product: string | null; locale: string; startedAt: number; maxScroll: number } | null = null;

function q(): EventQueue {
  if (!queue) queue = new EventQueue();
  return queue;
}

function productOnPage(): string | null {
  if (typeof document === "undefined") return null;
  const el = document.querySelector<HTMLElement>("[data-tt-product]");
  return el?.dataset.ttProduct?.slice(0, 80) ?? null;
}

/** Dış kullanım: booking_step / search / form_submit gibi olaylar. */
export function track(name: TrackEvent["name"], props: TrackEvent["props"] = {}): void {
  if (!current) return;
  q().push({
    name,
    path: current.path,
    sid: current.sid,
    seq: current.seq,
    locale: current.locale,
    product: current.product,
    props,
  });
}

function isAutomated(): boolean {
  try {
    return !!(navigator as Navigator & { webdriver?: boolean }).webdriver;
  } catch {
    return false;
  }
}

export function Tracker() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const listenersBound = useRef(false);

  // Sayfa görüntüleme + önceki sayfanın çıkış olayı (client-side navigasyonda).
  useEffect(() => {
    if (typeof window === "undefined" || isAutomated()) return;
    const path = pathname || "/";
    if (current && current.path !== path) emitExit(false);

    const { sid, isNew } = sessionId();
    const seq = nextSeq();
    const product = productOnPage();
    current = { path, sid, seq, product, locale, startedAt: Date.now(), maxScroll: 0 };
    const props: TrackEvent["props"] = { ...utmProps(window.location.search) };
    if (product) props.product = product;
    if (typeof document !== "undefined" && document.title) props.title = document.title.slice(0, 120);
    props.w = window.innerWidth;
    q().push({
      name: "page_view",
      path,
      sid,
      seq,
      locale,
      ref_host: referrerHost(document.referrer, window.location.host, isNew),
      product,
      props,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || listenersBound.current || isAutomated()) return;
    listenersBound.current = true;

    const onScroll = () => {
      if (!current) return;
      const d = scrollDepth(window.scrollY, window.innerHeight, document.documentElement.scrollHeight);
      if (d > current.maxScroll) current.maxScroll = d;
    };
    const onClick = (ev: MouseEvent) => {
      const target = ev.target as Element | null;
      const el = target?.closest?.("a[href],[data-track]") as HTMLElement | null;
      if (!el || !current) return;
      const c = classifyClick(el, window.location.host);
      if (!c) return;
      q().push({
        name: "click",
        path: current.path,
        sid: current.sid,
        seq: current.seq,
        locale: current.locale,
        product: current.product,
        props: { kind: c.kind, label: c.label, href: c.href },
      });
      // wa.me / tel yeni sekme veya uygulama açar → kuyruğu hemen boşalt.
      if (c.kind === "whatsapp" || c.kind === "tel" || c.kind === "outbound") q().flush(true);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") emitExit(true);
    };
    const onPageHide = () => emitExit(true);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      listenersBound.current = false;
    };
  }, []);

  return null;
}

// Aynı sayfa için exit'i bir kez gönder (visibilitychange + pagehide ikisi de tetikler).
let exitedFor: string | null = null;
function emitExit(unload: boolean): void {
  if (!current) return;
  const key = `${current.sid}:${current.seq}`;
  if (exitedFor === key) {
    if (unload) q().flush(true);
    return;
  }
  exitedFor = key;
  q().push({
    name: "page_exit",
    path: current.path,
    sid: current.sid,
    seq: current.seq,
    locale: current.locale,
    product: current.product,
    props: { seconds: Math.round((Date.now() - current.startedAt) / 1000), scroll: current.maxScroll },
  });
  if (unload) q().flush(true);
}
