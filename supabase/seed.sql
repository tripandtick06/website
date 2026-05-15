-- TripAndTick.com — sample seed data
-- =====================================================================
-- Importers: Supabase Studio SQL Editor / `supabase db reset --seed`.
-- Affected: customers + bookings + availability + coupons + loyalty demo rows.
-- Data: 10 musteri, 5 booking, 30 gun availability (3 servis = 90 satir), 6 coupon.
-- User verbatim:
--   "supabase/seed.sql YENI — Sample data (10 musteri, 5 booking, 30 gun availability, 6 coupon)"
-- =====================================================================

-- ---------- Coupons ----------
INSERT INTO coupons (code, type, value, valid_from, valid_until, usage_limit, min_purchase, applicable_slugs, active) VALUES
  ('WELCOME10', 'percent', 10.00, '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 1000, 50.00, NULL, TRUE),
  ('EMERCE5',   'percent', 5.00,  '2026-05-01T00:00:00Z', '2026-06-30T23:59:59Z', 500,  NULL,  NULL, TRUE),
  ('MACERA20',  'percent', 20.00, '2026-05-01T00:00:00Z', '2026-09-30T23:59:59Z', 200,  100.00, ARRAY['atv-standart','atv-full','jeep-tam','at-sunrise'], TRUE),
  ('AILE15',    'percent', 15.00, '2026-05-01T00:00:00Z', '2026-12-31T23:59:59Z', 300,  200.00, ARRAY['aile-paketi','tam-gun-paket'], TRUE),
  ('FIX25',     'fixed',   25.00, '2026-05-01T00:00:00Z', '2026-12-31T23:59:59Z', 100,  150.00, NULL, TRUE),
  ('BALON50',   'fixed',   50.00, '2026-05-01T00:00:00Z', '2026-08-31T23:59:59Z', 50,   400.00, ARRAY['romantik-ozel-balon','deluxe-balon-ucusu'], TRUE)
ON CONFLICT (code) DO NOTHING;

-- ---------- Customers (10) ----------
INSERT INTO customers (id, email, full_name, phone, nationality, language, segment, loyalty_points, referral_code, total_bookings, total_spent) VALUES
  ('11111111-1111-1111-1111-111111111001', 'ayse.demir@example.com',     'Ayse Demir',     '+90 532 100 0001', 'Turkiye',        'tr', 'vip',       450, 'AYSE-VIP-001', 5, 1850.00),
  ('11111111-1111-1111-1111-111111111002', 'mehmet.kara@example.com',    'Mehmet Kara',    '+90 532 100 0002', 'Turkiye',        'tr', 'returning', 220, 'MEHMET-002',   3, 920.00),
  ('11111111-1111-1111-1111-111111111003', 'john.smith@example.com',     'John Smith',     '+44 7700 900 003', 'United Kingdom', 'en', 'new',       0,   'JOHN-003',     1, 215.00),
  ('11111111-1111-1111-1111-111111111004', 'hans.muller@example.com',    'Hans Muller',    '+49 151 234 0004', 'Deutschland',    'de', 'vip',       600, 'HANS-VIP-004', 7, 2640.00),
  ('11111111-1111-1111-1111-111111111005', 'sophie.martin@example.com',  'Sophie Martin',  '+33 6 12 34 0005',  'France',         'fr', 'returning', 180, 'SOPHIE-005',   2, 780.00),
  ('11111111-1111-1111-1111-111111111006', 'wei.chen@example.com',       'Wei Chen',       '+86 138 0000 006',  'Zhongguo',       'zh', 'new',       0,   'WEI-006',      1, 295.00),
  ('11111111-1111-1111-1111-111111111007', 'marco.rossi@example.com',    'Marco Rossi',    '+39 320 000 0007',  'Italia',         'it', 'returning', 140, 'MARCO-007',    2, 560.00),
  ('11111111-1111-1111-1111-111111111008', 'sanne.devries@example.com',  'Sanne de Vries', '+31 6 1000 0008',   'Nederland',      'nl', 'new',       40,  'SANNE-008',    1, 180.00),
  ('11111111-1111-1111-1111-111111111009', 'priya.sharma@example.com',   'Priya Sharma',   '+91 98000 00009',   'India',          'hi', 'cancelled', 0,   'PRIYA-009',    0, 0.00),
  ('11111111-1111-1111-1111-111111111010', 'fatma.yildiz@example.com',   'Fatma Yildiz',   '+90 532 100 0010', 'Turkiye',        'tr', 'returning', 95,  'FATMA-010',    2, 410.00)
ON CONFLICT (email) DO NOTHING;

-- ---------- Bookings (5) ----------
INSERT INTO bookings (id, customer_id, service_slug, service_name, date, adults, children, passengers, unit_price, total_price, currency, insurance, promo_code, discount_amount, payment_status, booking_status) VALUES
  ('TT-DEMO0001', '11111111-1111-1111-1111-111111111001', 'standart-balon-ucusu', 'Standart Balon Ucusu', '2026-05-20', 2, 0,
    '[{"fullName":"Ayse Demir","email":"ayse.demir@example.com","phone":"+90 532 100 0001","nationality":"Turkiye"},{"fullName":"Aile Yolcu 2","email":"ayse.demir@example.com","phone":"+90 532 100 0001","nationality":"Turkiye"}]'::jsonb,
    165.00, 297.00, 'EUR', TRUE, 'WELCOME10', 33.00, 'paid', 'confirmed'),
  ('TT-DEMO0002', '11111111-1111-1111-1111-111111111002', 'atv-standart', 'ATV Standart Tur', '2026-05-22', 1, 0,
    '[{"fullName":"Mehmet Kara","email":"mehmet.kara@example.com","phone":"+90 532 100 0002","nationality":"Turkiye"}]'::jsonb,
    29.00, 29.00, 'EUR', FALSE, NULL, 0.00, 'paid', 'confirmed'),
  ('TT-DEMO0003', '11111111-1111-1111-1111-111111111003', 'konfor-balon-ucusu', 'Konfor Balon Ucusu', '2026-06-01', 1, 0,
    '[{"fullName":"John Smith","email":"john.smith@example.com","phone":"+44 7700 900 003","nationality":"United Kingdom"}]'::jsonb,
    215.00, 215.00, 'EUR', FALSE, NULL, 0.00, 'pending', 'pending'),
  ('TT-DEMO0004', '11111111-1111-1111-1111-111111111004', 'deluxe-balon-ucusu', 'Deluxe Balon Ucusu', '2026-05-18', 2, 1,
    '[{"fullName":"Hans Muller","email":"hans.muller@example.com","phone":"+49 151 234 0004","nationality":"Deutschland"},{"fullName":"Anna Muller","email":"hans.muller@example.com","phone":"+49 151 234 0004","nationality":"Deutschland"},{"fullName":"Lukas Muller","email":"hans.muller@example.com","phone":"+49 151 234 0004","nationality":"Deutschland","age":10}]'::jsonb,
    295.00, 826.00, 'EUR', TRUE, 'AILE15', 124.00, 'paid', 'confirmed'),
  ('TT-DEMO0005', '11111111-1111-1111-1111-111111111005', 'kirmizi-tur', 'Kapadokya Kirmizi Tur', '2026-05-25', 2, 0,
    '[{"fullName":"Sophie Martin","email":"sophie.martin@example.com","phone":"+33 6 12 34 0005","nationality":"France"},{"fullName":"Lucas Bernard","email":"sophie.martin@example.com","phone":"+33 6 12 34 0005","nationality":"France"}]'::jsonb,
    35.00, 70.00, 'EUR', FALSE, NULL, 0.00, 'paid', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ---------- Availability (30 gun x 3 servis = 90 satir) ----------
INSERT INTO availability (service_slug, date, status, remaining_slots, total_slots, note)
SELECT
  slug,
  (date '2026-05-15' + (n || ' days')::interval)::date AS d,
  CASE
    WHEN ((n + ascii(substr(slug,1,1))) % 7) = 0 THEN 'full'
    WHEN ((n + ascii(substr(slug,1,1))) % 5) = 0 THEN 'limited'
    WHEN ((n + ascii(substr(slug,1,1))) % 11) = 0 THEN 'closed'
    ELSE 'available'
  END AS status,
  CASE
    WHEN ((n + ascii(substr(slug,1,1))) % 7) = 0 THEN 0
    WHEN ((n + ascii(substr(slug,1,1))) % 5) = 0 THEN 3
    WHEN ((n + ascii(substr(slug,1,1))) % 11) = 0 THEN 0
    ELSE 12 + (n % 6)
  END AS remaining_slots,
  20 AS total_slots,
  CASE
    WHEN ((n + ascii(substr(slug,1,1))) % 11) = 0 THEN 'Hava kosullari (mock)'
    ELSE NULL
  END AS note
FROM (SELECT unnest(ARRAY['standart-balon-ucusu','konfor-balon-ucusu','atv-standart']) AS slug) s
CROSS JOIN generate_series(0, 29) AS n
ON CONFLICT (service_slug, date) DO NOTHING;

-- ---------- Loyalty seed (3 transactions) ----------
INSERT INTO loyalty_transactions (customer_id, points, transaction_type, booking_id, description) VALUES
  ('11111111-1111-1111-1111-111111111001', 297, 'earn',  'TT-DEMO0001', 'Standart Balon Ucusu icin kazanildi'),
  ('11111111-1111-1111-1111-111111111004', 826, 'earn',  'TT-DEMO0004', 'Deluxe Balon Ucusu icin kazanildi'),
  ('11111111-1111-1111-1111-111111111001', 100, 'bonus', NULL,          'Hosgeldin bonusu')
ON CONFLICT DO NOTHING;
