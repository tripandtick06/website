import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIcalDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcal(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId") ?? "TT-UNKNOWN";
  const serviceName = searchParams.get("serviceName") ?? "Kapadokya Balon Turu";
  const dateStr = searchParams.get("date") ?? "";
  const timeStr = searchParams.get("time") ?? "05:00";

  let start: Date;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [hh, mm] = timeStr.split(":").map((n) => Number(n) || 0);
    start = new Date(`${dateStr}T${pad(hh)}:${pad(mm)}:00+03:00`);
  } else {
    start = new Date();
    start.setDate(start.getDate() + 1);
  }
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const now = new Date();
  const uid = `${bookingId}@tripandtick.com`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trip and Tick//Booking//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcalDate(now)}`,
    `DTSTART:${toIcalDate(start)}`,
    `DTEND:${toIcalDate(end)}`,
    `SUMMARY:${escapeIcal(serviceName)} — Trip and Tick`,
    `LOCATION:${escapeIcal("Kapadokya, Nevsehir, Turkey")}`,
    `DESCRIPTION:${escapeIcal(
      `Rezervasyon kodu: ${bookingId}\nLutfen ucustan 30 dakika once otelinizde transfer aracini bekleyin.\nDetay: https://tripandtick.com/rezervasyon`
    )}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Balon turu yarin — hazirliklarinizi yapin",
    "TRIGGER:-PT24H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="tripandtick-${bookingId}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
