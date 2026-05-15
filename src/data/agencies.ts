// B2B acente mock kataloğu — Faz 2 acente paneli + API endpoints.
//
// Importers:
//   - src/app/b2b/dashboard/page.tsx (acente dashboard)
//   - src/app/b2b/login/page.tsx (demo login validate)
//   - src/app/api/b2b/bookings/route.ts (x-api-key auth)
//   - src/app/api/b2b/services/route.ts (x-api-key auth + acente-fiyat)
//   - src/app/api/b2b/apply/route.ts (basvuru — agencies'e dokunmaz)
// Affected: B2B acente authentication + commission tracking + credit limit display.
// Data: 8 entry deterministik. apiKey format `tt_b2b_{32-hex}`. commissionRate 0.10-0.18.
//        Demo acente ilk entry: email "acente@example.com", apiKey "tt_b2b_demo123".
// User verbatim: "8 entry, API key format tt_b2b_{32-random-hex}, demo
// acente@example.com / tt_b2b_demo123, deterministik."

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  apiKey: string;
  commissionRate: number; // 0..1, 0.15 = %15 komisyon
  creditLimit: number; // EUR
  creditUsed: number; // EUR
  active: boolean;
  createdAt: string; // ISO
  country: string;
}

export const MOCK_AGENCIES: Agency[] = [
  {
    id: "AG-1001",
    name: "Demo Travel Agency",
    email: "acente@example.com",
    phone: "+90 555 100 0001",
    contactPerson: "Demo Acente",
    apiKey: "tt_b2b_demo123",
    commissionRate: 0.15,
    creditLimit: 25000,
    creditUsed: 6850,
    active: true,
    createdAt: "2025-11-12T10:00:00.000Z",
    country: "TR",
  },
  {
    id: "AG-1002",
    name: "Anatolia Tours GmbH",
    email: "buchung@anatolia-tours.de",
    phone: "+49 89 12345678",
    contactPerson: "Hannes Müller",
    apiKey: "tt_b2b_a4f2c891d7e3b6f08c1e5a7b9d2e4f6a",
    commissionRate: 0.18,
    creditLimit: 50000,
    creditUsed: 18450,
    active: true,
    createdAt: "2025-08-04T09:30:00.000Z",
    country: "DE",
  },
  {
    id: "AG-1003",
    name: "Bosphorus Holidays Ltd.",
    email: "reservations@bosphorusholidays.co.uk",
    phone: "+44 20 7946 0011",
    contactPerson: "Emily Carter",
    apiKey: "tt_b2b_b9e3d2c1a8f74e5b6c0d9a8e7f1b2c3d",
    commissionRate: 0.16,
    creditLimit: 40000,
    creditUsed: 12200,
    active: true,
    createdAt: "2025-09-20T14:15:00.000Z",
    country: "GB",
  },
  {
    id: "AG-1004",
    name: "Voyages Cappadoce SARL",
    email: "contact@voyages-cappadoce.fr",
    phone: "+33 1 42 96 12 34",
    contactPerson: "Marc Lefevre",
    apiKey: "tt_b2b_c7d1e8a5b3f0964e2c5d8a1b4e7f0c3a",
    commissionRate: 0.14,
    creditLimit: 30000,
    creditUsed: 9120,
    active: true,
    createdAt: "2025-10-02T08:00:00.000Z",
    country: "FR",
  },
  {
    id: "AG-1005",
    name: "Iberia Cappadocia SL",
    email: "ventas@iberiacappadocia.es",
    phone: "+34 91 540 0011",
    contactPerson: "Sofia Martín",
    apiKey: "tt_b2b_d2a5b8c1e4f70936a8c2d5e1b4f7a0c3",
    commissionRate: 0.13,
    creditLimit: 22000,
    creditUsed: 4350,
    active: true,
    createdAt: "2026-01-15T11:45:00.000Z",
    country: "ES",
  },
  {
    id: "AG-1006",
    name: "Polaris MICE Türkiye",
    email: "operations@polarismice.com.tr",
    phone: "+90 212 555 7788",
    contactPerson: "Burak Yılmaz",
    apiKey: "tt_b2b_e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4",
    commissionRate: 0.17,
    creditLimit: 60000,
    creditUsed: 24800,
    active: true,
    createdAt: "2025-07-10T07:20:00.000Z",
    country: "TR",
  },
  {
    id: "AG-1007",
    name: "DMC Levant Travel",
    email: "booking@dmclevant.com",
    phone: "+962 6 461 2233",
    contactPerson: "Layla Khoury",
    apiKey: "tt_b2b_f1a2b3c4d5e6f70819a2b3c4d5e6f708",
    commissionRate: 0.12,
    creditLimit: 18000,
    creditUsed: 2100,
    active: false,
    createdAt: "2026-02-28T16:00:00.000Z",
    country: "JO",
  },
  {
    id: "AG-1008",
    name: "NomadEast Tours",
    email: "agency@nomadeast.com",
    phone: "+1 415 555 9911",
    contactPerson: "Daniel Rivers",
    apiKey: "tt_b2b_0a1b2c3d4e5f6071829a3b4c5d6e7f80",
    commissionRate: 0.15,
    creditLimit: 35000,
    creditUsed: 0,
    active: true,
    createdAt: "2026-04-05T13:30:00.000Z",
    country: "US",
  },
];

export function getAgencyByApiKey(apiKey: string): Agency | undefined {
  return MOCK_AGENCIES.find((a) => a.apiKey === apiKey && a.active);
}

export function getAgencyByEmail(email: string): Agency | undefined {
  const lower = email.trim().toLowerCase();
  return MOCK_AGENCIES.find((a) => a.email.toLowerCase() === lower);
}

export function getAgencyById(id: string): Agency | undefined {
  return MOCK_AGENCIES.find((a) => a.id === id);
}

/**
 * Acente-ozel fiyat hesapla. Baz fiyat uzerinden komisyon orani kadar indirim.
 * Acente B2B fiyati = adultPrice * (1 - commissionRate)
 */
export function agencyNetPrice(adultPrice: number, commissionRate: number): number {
  return Math.round(adultPrice * (1 - commissionRate) * 100) / 100;
}
