// Cappadocia balloon flight outlook — Open-Meteo forecast for Göreme, read at
// the sunrise slot, classified with public rule-of-thumb limits.
//
// Callers: src/app/[locale]/balonlar/bugun-ucuyor-mu/page.tsx
//
// What this IS: a weather-based outlook (wind, gusts, visibility, rain) for the
// hour around sunrise, the only slot balloons fly. What it is NOT: the official
// go/no-go, which the Turkish civil aviation authority issues each morning and
// which can differ from any forecast. The page says so, loudly, every time.
//
// Thresholds (surface wind at 10 m, km/h). Commercial balloon operations in
// Cappadocia stand down well before the ~18 km/h (10 kt) surface-wind mark and
// with rain or poor visibility; these bands are deliberately conservative so
// "likely" is rarely wrong in the optimistic direction.
//   likely   : wind <= 12, gusts <= 25, visibility >= 5 km, rain prob < 40 %
//   marginal : wind <= 18, gusts <= 35, visibility >= 2 km, rain prob < 60 %
//   unlikely : anything worse
// Data: https://open-meteo.com (free, no key, CC-BY 4.0). Göreme 38.6431 N,
// 34.8289 E (same point as COMPANY.geo). No stats are invented anywhere here:
// there is no public per-day cancellation dataset, so none is shown.

export type Outlook = "likely" | "marginal" | "unlikely" | "unknown";

export interface SunriseSlot {
  /** ISO date YYYY-MM-DD (Europe/Istanbul). */
  date: string;
  /** Local sunrise time HH:MM. */
  sunrise: string;
  windKmh: number | null;
  gustKmh: number | null;
  visibilityKm: number | null;
  rainProbability: number | null;
  cloudCover: number | null;
  outlook: Outlook;
}

export interface FlightForecast {
  days: SunriseSlot[];
  /** ISO timestamp the forecast was fetched (shown as "updated"). */
  fetchedAt: string;
  source: "open-meteo";
}

export const GOREME = { latitude: 38.6431, longitude: 34.8289 } as const;

export function classify(s: {
  windKmh: number | null;
  gustKmh: number | null;
  visibilityKm: number | null;
  rainProbability: number | null;
}): Outlook {
  const { windKmh: w, gustKmh: g, visibilityKm: v, rainProbability: r } = s;
  if (w === null || g === null) return "unknown";
  const vis = v ?? 10;
  const rain = r ?? 0;
  if (w <= 12 && g <= 25 && vis >= 5 && rain < 40) return "likely";
  if (w <= 18 && g <= 35 && vis >= 2 && rain < 60) return "marginal";
  return "unlikely";
}

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    wind_speed_10m: (number | null)[];
    wind_gusts_10m: (number | null)[];
    visibility: (number | null)[];
    precipitation_probability: (number | null)[];
    cloud_cover: (number | null)[];
  };
  daily: { time: string[]; sunrise: string[] };
}

/** Pure: pick the hourly row at (or just before) sunrise for each day. */
export function slotsFromResponse(data: OpenMeteoResponse): SunriseSlot[] {
  const { hourly, daily } = data;
  return daily.time.map((date, i) => {
    const sunriseIso = daily.sunrise[i] ?? `${date}T06:00`;
    const sunriseHour = sunriseIso.slice(0, 13); // YYYY-MM-DDTHH
    let idx = hourly.time.findIndex((t) => t.slice(0, 13) === sunriseHour);
    if (idx === -1) idx = hourly.time.findIndex((t) => t.startsWith(date));
    const num = (arr: (number | null)[]) => (idx >= 0 && arr[idx] != null ? Number(arr[idx]) : null);
    const visM = num(hourly.visibility);
    const slot = {
      windKmh: num(hourly.wind_speed_10m),
      gustKmh: num(hourly.wind_gusts_10m),
      visibilityKm: visM === null ? null : Math.round(visM / 100) / 10,
      rainProbability: num(hourly.precipitation_probability),
    };
    return {
      date,
      sunrise: sunriseIso.slice(11, 16),
      ...slot,
      cloudCover: num(hourly.cloud_cover),
      outlook: classify(slot),
    };
  });
}

const URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${GOREME.latitude}&longitude=${GOREME.longitude}` +
  "&hourly=wind_speed_10m,wind_gusts_10m,visibility,precipitation_probability,cloud_cover" +
  "&daily=sunrise&timezone=Europe%2FIstanbul&forecast_days=4&wind_speed_unit=kmh";

/** Best-effort fetch; null on any failure (the page renders the static part). */
export async function fetchFlightForecast(): Promise<FlightForecast | null> {
  try {
    const res = await fetch(URL, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenMeteoResponse;
    if (!data?.hourly?.time?.length || !data?.daily?.time?.length) return null;
    return { days: slotsFromResponse(data), fetchedAt: new Date().toISOString(), source: "open-meteo" };
  } catch {
    return null;
  }
}
