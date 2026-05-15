// Mock müşteri kataloğu — admin paneli "Müşteriler" tab + rezervasyon detay sayfası.
//
// Importers:
//   - src/data/mock-bookings.ts (booking → customer FK)
//   - src/app/admin/page.tsx (Müşteriler tab + Dashboard stats)
//   - src/app/admin/rezervasyon/[id]/page.tsx (detay customer info)
// Affected: admin panel customer view, deterministic seeding.
// Data: 50 müşteri — 30 TR, 5 EN, 5 DE, 5 FR, 5 ZH/IT/NL/HI mix. Deterministik
//        xorshift32 PRNG seeded per index. lastActivity/createdAt ISO 8601 string.
// User verbatim: "50 musteri: ad, email, telefon, uyruk, segment (yeni/tekrar/VIP/iptal),
// toplam rezervasyon sayisi, toplam harcama, last activity. Cesitlilik: 30 TR, 5 EN,
// 5 DE, 5 FR, 5 ZH/IT/NL/HI mix."

export type CustomerSegment = "new" | "returning" | "vip" | "cancelled";

export interface MockCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  segment: CustomerSegment;
  totalBookings: number;
  totalSpent: number;
  lastActivity: string;
  createdAt: string;
  language: string;
  notes?: string;
}

function rand(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1000000) / 1000000;
  };
}

const TR_NAMES = [
  "Ayşe Demir", "Mehmet Kara", "Fatma Yıldız", "Ali Çelik", "Zeynep Şahin",
  "Mustafa Öztürk", "Elif Aydın", "Hüseyin Doğan", "Emine Arslan", "Hasan Yılmaz",
  "Hatice Polat", "İbrahim Koç", "Merve Aksoy", "Murat Erdoğan", "Selin Korkmaz",
  "Burak Çetin", "Esra Şimşek", "Onur Tunç", "Pınar Acar", "Serkan Bulut",
  "Tuğçe Güneş", "Volkan Avcı", "Yasemin Toprak", "Cem Demirci", "Deniz Özkan",
  "Gül Karahan", "Kerem Ünal", "Leyla Tan", "Okan Çiftçi", "Sevgi Yavuz",
];
const EN_NAMES = ["John Smith", "Emma Wilson", "Oliver Brown", "Sophie Taylor", "James Anderson"];
const DE_NAMES = ["Hans Müller", "Anna Schmidt", "Lukas Wagner", "Lena Hoffmann", "Felix Becker"];
const FR_NAMES = ["Pierre Dubois", "Sophie Martin", "Lucas Bernard", "Camille Petit", "Léa Moreau"];
const MIX_NAMES = ["Wei Chen", "Marco Rossi", "Sanne de Vries", "Priya Sharma", "Yuki Tanaka"];

const NATIONALITIES_MAP: Record<string, string> = {
  TR: "Türkiye",
  EN: "United Kingdom",
  DE: "Deutschland",
  FR: "France",
  ZH: "中国",
  IT: "Italia",
  NL: "Nederland",
  HI: "भारत",
  JP: "日本",
};

const SEGMENTS: CustomerSegment[] = ["new", "returning", "vip", "cancelled"];

function nameToEmail(name: string, idx: number): string {
  const slug = name
    .toLocaleLowerCase("tr")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/(^\.|\.$)/g, "");
  const domains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "proton.me"];
  return `${slug}${idx % 7 === 0 ? idx : ""}@${domains[idx % domains.length]}`;
}

function phoneFor(country: string, idx: number): string {
  const rng = rand(idx * 31 + 7);
  const num = Math.floor(rng() * 9000000 + 1000000);
  switch (country) {
    case "TR":
      return `+90 5${(idx % 9) + 1}${(idx * 7) % 10} ${String(num).slice(0, 3)} ${String(num).slice(3, 7)}`;
    case "EN":
      return `+44 7${(idx * 3) % 10}${(idx * 11) % 10}${(idx * 13) % 10} ${String(num).slice(0, 6)}`;
    case "DE":
      return `+49 ${150 + (idx % 99)} ${String(num).slice(0, 7)}`;
    case "FR":
      return `+33 6 ${String(num).slice(0, 8)}`;
    default:
      return `+1 ${String(num).slice(0, 3)} ${String(num).slice(3, 6)}-${String(num).slice(6, 10)}`;
  }
}

function buildCustomers(): MockCustomer[] {
  const customers: MockCustomer[] = [];
  const baseDate = new Date("2026-05-15T00:00:00.000Z").getTime();
  const DAY = 86400000;

  TR_NAMES.forEach((name, i) => {
    const rng = rand(i + 1);
    const seg = SEGMENTS[Math.floor(rng() * SEGMENTS.length)];
    const bookings = seg === "vip" ? 4 + Math.floor(rng() * 6)
      : seg === "returning" ? 2 + Math.floor(rng() * 3)
      : 1;
    const avgTicket = 200 + Math.floor(rng() * 600);
    customers.push({
      id: `CUST-${String(1000 + i).padStart(4, "0")}`,
      fullName: name,
      email: nameToEmail(name, i),
      phone: phoneFor("TR", i),
      nationality: "TR",
      segment: seg,
      totalBookings: bookings,
      totalSpent: seg === "cancelled" ? 0 : bookings * avgTicket,
      lastActivity: new Date(baseDate - Math.floor(rng() * 90) * DAY).toISOString(),
      createdAt: new Date(baseDate - (180 + Math.floor(rng() * 180)) * DAY).toISOString(),
      language: "tr",
    });
  });

  function addBatch(names: string[], country: string, lang: string, offset: number): void {
    names.forEach((name, j) => {
      const i = offset + j;
      const rng = rand(i + 1);
      const seg = SEGMENTS[Math.floor(rng() * SEGMENTS.length)];
      const bookings = seg === "vip" ? 4 + Math.floor(rng() * 6)
        : seg === "returning" ? 2 + Math.floor(rng() * 3)
        : 1;
      const avgTicket = 250 + Math.floor(rng() * 700);
      customers.push({
        id: `CUST-${String(1000 + i).padStart(4, "0")}`,
        fullName: name,
        email: nameToEmail(name, i),
        phone: phoneFor(country, i),
        nationality: country,
        segment: seg,
        totalBookings: bookings,
        totalSpent: seg === "cancelled" ? 0 : bookings * avgTicket,
        lastActivity: new Date(baseDate - Math.floor(rng() * 90) * DAY).toISOString(),
        createdAt: new Date(baseDate - (180 + Math.floor(rng() * 180)) * DAY).toISOString(),
        language: lang,
      });
    });
  }

  addBatch(EN_NAMES, "EN", "en", 30);
  addBatch(DE_NAMES, "DE", "de", 35);
  addBatch(FR_NAMES, "FR", "fr", 40);

  const mixCountries = ["ZH", "IT", "NL", "HI", "JP"];
  const mixLangs = ["zh", "it", "nl", "hi", "ja"];
  MIX_NAMES.forEach((name, j) => {
    const i = 45 + j;
    const country = mixCountries[j];
    const lang = mixLangs[j];
    const rng = rand(i + 1);
    const seg = SEGMENTS[Math.floor(rng() * SEGMENTS.length)];
    const bookings = seg === "vip" ? 4 + Math.floor(rng() * 6)
      : seg === "returning" ? 2 + Math.floor(rng() * 3)
      : 1;
    const avgTicket = 280 + Math.floor(rng() * 700);
    customers.push({
      id: `CUST-${String(1000 + i).padStart(4, "0")}`,
      fullName: name,
      email: nameToEmail(name, i),
      phone: phoneFor(country, i),
      nationality: country,
      segment: seg,
      totalBookings: bookings,
      totalSpent: seg === "cancelled" ? 0 : bookings * avgTicket,
      lastActivity: new Date(baseDate - Math.floor(rng() * 90) * DAY).toISOString(),
      createdAt: new Date(baseDate - (180 + Math.floor(rng() * 180)) * DAY).toISOString(),
      language: lang,
    });
  });

  return customers;
}

export const MOCK_CUSTOMERS: MockCustomer[] = buildCustomers();

export function getCustomerById(id: string): MockCustomer | undefined {
  return MOCK_CUSTOMERS.find((c) => c.id === id);
}

export function getCustomerByEmail(email: string): MockCustomer | undefined {
  const e = email.toLocaleLowerCase().trim();
  return MOCK_CUSTOMERS.find((c) => c.email.toLowerCase() === e);
}

export function getCustomersBySegment(segment: CustomerSegment): MockCustomer[] {
  return MOCK_CUSTOMERS.filter((c) => c.segment === segment);
}

export function getNationalityLabel(code: string): string {
  return NATIONALITIES_MAP[code] ?? code;
}

export function getCustomerStats(): {
  total: number;
  vip: number;
  returning: number;
  new: number;
  cancelled: number;
  totalRevenue: number;
} {
  const list = MOCK_CUSTOMERS;
  return {
    total: list.length,
    vip: list.filter((c) => c.segment === "vip").length,
    returning: list.filter((c) => c.segment === "returning").length,
    new: list.filter((c) => c.segment === "new").length,
    cancelled: list.filter((c) => c.segment === "cancelled").length,
    totalRevenue: list.reduce((sum, c) => sum + c.totalSpent, 0),
  };
}
