"use client";

// Sosyal kanit popup — sol alt kose, tum sayfalarda, tum dillerde.
// Degisken araliklarla (3/7/4/6... sn) donen 80 sahte-gercekci rezervasyon bildirimi.
// Isimler yildizla maskeli. Servis adlari locale'e gore (localize data). X ile kapatilir.

import { useState, useEffect, useRef, useMemo } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { tServiceList, tBalloons } from "@/lib/i18n/localizeData";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";

const DISMISS_KEY = "tripandtick:socialproof:dismissed";

// Donus araligi: yavas + ongorulemez (aritmetik degil). Her adimda 13-29 sn arasi rastgele.
const MIN_DELAY = 13000;
const MAX_DELAY = 29000;
function nextDelay(): number {
  return MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY));
}

// Gercekci + cesitli kisi sayilari (cogu 1-4, ara sira daha fazla). 5 tekrari azaltildi.
const COUNT_POOL = [2, 1, 4, 2, 3, 1, 6, 2, 1, 4, 3, 2, 8, 1, 2, 3, 1, 5, 2, 4, 1, 3, 2, 7, 1, 2, 4, 1, 3, 2];

// Maskeli isim havuzu (uluslararasi). Ad ilk harf + **, soyad ilk harf + ***.
const NAMES = [
  "A** Y***", "M** K***", "J*** S**", "L** R***", "S** M***", "E** D***",
  "D** B***", "O** Ç***", "C** A***", "N** T***", "R** P***", "K** H***",
  "T** V***", "B** G***", "F** L***", "H** N***", "I** W***", "P** O***",
  "G** F***", "Y** Z***", "Z** K***", "M** S***", "A** B***", "J** M***",
  "S** Y***", "L** C***", "D** R***", "E** T***", "O** V***", "C** D***",
  "W** H***", "K** J***", "N** A***", "R** S***", "B** M***", "T** K***",
];

type Copy = { title: string; people: string; recently: string };

// Kisa metin — 17 dil. Yeni diller (pt/pt-BR/ja/ko/it/ru/uk/az) gercek ceviri.
const COPY: Record<string, Copy> = {
  tr: { title: "Son Rezervasyonlar", people: "kişi", recently: "az önce rezervasyon yaptı" },
  en: { title: "Recent Bookings", people: "people", recently: "just booked" },
  de: { title: "Letzte Buchungen", people: "Personen", recently: "gerade gebucht" },
  fr: { title: "Réservations récentes", people: "personnes", recently: "vient de réserver" },
  es: { title: "Reservas recientes", people: "personas", recently: "acaba de reservar" },
  nl: { title: "Recente boekingen", people: "personen", recently: "heeft net geboekt" },
  zh: { title: "最近预订", people: "人", recently: "刚刚预订" },
  hi: { title: "हाल की बुकिंग", people: "लोग", recently: "ने अभी बुक किया" },
  ur: { title: "حالیہ بکنگ", people: "افراد", recently: "نے ابھی بک کیا" },
  pt: { title: "Reservas recentes", people: "pessoas", recently: "acabou de reservar" },
  "pt-BR": { title: "Reservas recentes", people: "pessoas", recently: "acabou de reservar" },
  ja: { title: "最近の予約", people: "名", recently: "が予約しました" },
  ko: { title: "최근 예약", people: "명", recently: "님이 방금 예약함" },
  it: { title: "Prenotazioni recenti", people: "persone", recently: "ha appena prenotato" },
  ru: { title: "Недавние брони", people: "чел.", recently: "только что забронировал" },
  uk: { title: "Останні бронювання", people: "осіб", recently: "щойно забронював" },
  az: { title: "Son rezervasyonlar", people: "nəfər", recently: "indicə rezervasiya etdi" },
};

interface Item {
  name: string;
  service: string;
  count: number;
}

export function SocialProofPopup() {
  const { locale } = useLocale();
  const copy = COPY[locale] ?? COPY.en;

  // Locale'e gore lokalize servis adlari (balon + tum kategoriler).
  const items = useMemo<Item[]>(() => {
    const services = [
      ...tBalloons(locale).map((b) => b.name),
      ...tServiceList(
        [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS],
        locale
      ).map((s) => s.name),
    ];
    if (services.length === 0) return [];
    // 80 bildirim: isim x servis x kisi sayisi kombinasyonu (deterministik dagilim).
    const out: Item[] = [];
    for (let i = 0; i < 80; i++) {
      out.push({
        name: NAMES[(i * 7) % NAMES.length],
        service: services[(i * 3) % services.length],
        count: COUNT_POOL[i % COUNT_POOL.length],
      });
    }
    return out;
  }, [locale]);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // SSR-safe default: gizli
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(0);

  // Mount: dismissed kontrol + ilk gosterim.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      setDismissed(true);
      return;
    }
    setDismissed(false);
    // Rastgele baslangic indeksi (her dil/oturum farkli his).
    setIndex(Math.floor(Math.random() * Math.max(1, items.length)));
    const firstDelay = 2500;
    timerRef.current = setTimeout(() => setVisible(true), firstDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Degisken aralikli donus: her adimda farkli sure (INTERVALS dongusu).
  useEffect(() => {
    if (dismissed || !visible || items.length === 0) return;
    const delay = nextDelay();
    timerRef.current = setTimeout(() => {
      // Kisa "cikis" sonra yeni icerik + tekrar gosterim (fade).
      setVisible(false);
      stepRef.current += 1;
      window.setTimeout(() => {
        setIndex((p) => (p + 1) % items.length);
        setVisible(true);
      }, 350);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, index, dismissed, items.length]);

  function dismiss() {
    setDismissed(true);
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  if (dismissed || items.length === 0) return null;

  const item = items[index];
  const initial = item.name.charAt(0);

  return (
    <div
      className={
        "fixed left-4 bottom-20 sm:bottom-4 z-40 max-w-[300px] transition-all duration-300 ease-out " +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none")
      }
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 pr-8 shadow-booking-hover">
        <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-primary/[0.10] flex items-center justify-center font-bold text-primary text-sm">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {copy.title}
          </div>
          <p className="text-sm font-semibold text-slate-900 leading-snug truncate">{item.name}</p>
          <p className="text-xs text-slate-600 leading-snug line-clamp-1">{item.service}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {item.count} {copy.people} · {copy.recently}
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.45] rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
