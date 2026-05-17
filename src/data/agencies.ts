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
    name: "Demo Travel Fixture",
    email: "demo@fixture.test",
    phone: "+90 555 000 0001",
    contactPerson: "Demo User",
    apiKey: "tt_b2b_test_demo123",
    commissionRate: 0.15,
    creditLimit: 25000,
    creditUsed: 6850,
    active: true,
    createdAt: "2025-11-12T10:00:00.000Z",
    country: "TR",
  },
  {
    id: "AG-1002",
    name: "Acme Tours Fixture DE",
    email: "fixture-de@example.test",
    phone: "+49 000 0000001",
    contactPerson: "Fixture Person DE",
    apiKey: "tt_b2b_test_fixtde0000000001",
    commissionRate: 0.18,
    creditLimit: 50000,
    creditUsed: 18450,
    active: true,
    createdAt: "2025-08-04T09:30:00.000Z",
    country: "DE",
  },
  {
    id: "AG-1003",
    name: "Foo Holidays Fixture GB",
    email: "fixture-gb@example.test",
    phone: "+44 000 0000002",
    contactPerson: "Fixture Person GB",
    apiKey: "tt_b2b_test_fixtgb0000000002",
    commissionRate: 0.16,
    creditLimit: 40000,
    creditUsed: 12200,
    active: true,
    createdAt: "2025-09-20T14:15:00.000Z",
    country: "GB",
  },
  {
    id: "AG-1004",
    name: "Bar Voyages Fixture FR",
    email: "fixture-fr@example.test",
    phone: "+33 0 00 00 00 03",
    contactPerson: "Fixture Person FR",
    apiKey: "tt_b2b_test_fixtfr0000000003",
    commissionRate: 0.14,
    creditLimit: 30000,
    creditUsed: 9120,
    active: true,
    createdAt: "2025-10-02T08:00:00.000Z",
    country: "FR",
  },
  {
    id: "AG-1005",
    name: "Baz Cappadocia Fixture ES",
    email: "fixture-es@example.test",
    phone: "+34 00 000 0004",
    contactPerson: "Fixture Person ES",
    apiKey: "tt_b2b_test_fixtes0000000004",
    commissionRate: 0.13,
    creditLimit: 22000,
    creditUsed: 4350,
    active: true,
    createdAt: "2026-01-15T11:45:00.000Z",
    country: "ES",
  },
  {
    id: "AG-1006",
    name: "Qux MICE Fixture TR",
    email: "fixture-tr2@example.test",
    phone: "+90 000 000 0005",
    contactPerson: "Fixture Person TR",
    apiKey: "tt_b2b_test_fixttr0000000005",
    commissionRate: 0.17,
    creditLimit: 60000,
    creditUsed: 24800,
    active: true,
    createdAt: "2025-07-10T07:20:00.000Z",
    country: "TR",
  },
  {
    id: "AG-1007",
    name: "Quux Levant Fixture JO",
    email: "fixture-jo@example.test",
    phone: "+962 0 000 0006",
    contactPerson: "Fixture Person JO",
    apiKey: "tt_b2b_test_fixtjo0000000006",
    commissionRate: 0.12,
    creditLimit: 18000,
    creditUsed: 2100,
    active: false,
    createdAt: "2026-02-28T16:00:00.000Z",
    country: "JO",
  },
  {
    id: "AG-1008",
    name: "Corge NomadEast Fixture US",
    email: "fixture-us@example.test",
    phone: "+1 000 000 0007",
    contactPerson: "Fixture Person US",
    apiKey: "tt_b2b_test_fixtus0000000007",
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
