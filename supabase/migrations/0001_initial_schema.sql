-- TripAndTick.com — initial Supabase schema (Faz 2 iskelet)
-- =====================================================================
-- Importers: src/lib/supabase.ts + src/lib/db/*.ts
-- Affected: customer/booking/availability/coupon/review/loyalty/agency/email_log
-- Data:
--   - customers: e-posta unique, segment + loyalty + referral, total_*.
--   - bookings: TT-XXXXXXXX text PK, FK customer_id, passengers JSONB.
--   - availability: (service_slug, date) unique, status enum, slots integer.
--   - coupons: code PK, percent/fixed, usage_limit + used_count.
--   - reviews, loyalty_transactions, agencies (B2B), email_log.
--   - Datetime: TIMESTAMPTZ ISO 8601, DATE: YYYY-MM-DD.
-- User verbatim:
--   "supabase/migrations/0001_initial_schema.sql YENI — Postgres SQL migration"
-- =====================================================================

-- ---------- Customers ----------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  nationality TEXT,
  language TEXT DEFAULT 'tr',
  segment TEXT CHECK (segment IN ('new','returning','vip','cancelled')) DEFAULT 'new',
  loyalty_points INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES customers(id),
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_referral ON customers(referral_code);

-- ---------- Bookings ----------
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,  -- TT-XXXXXXXX format
  customer_id UUID REFERENCES customers(id),
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  date DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  passengers JSONB DEFAULT '[]',
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  insurance BOOLEAN DEFAULT FALSE,
  promo_code TEXT,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('pending','paid','refunded','failed')) DEFAULT 'pending',
  booking_status TEXT CHECK (booking_status IN ('pending','confirmed','cancelled','completed')) DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

-- ---------- Availability ----------
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('available','limited','full','closed')) DEFAULT 'available',
  remaining_slots INTEGER NOT NULL,
  total_slots INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_slug, date)
);
CREATE INDEX IF NOT EXISTS idx_availability_slug_date ON availability(service_slug, date);

-- ---------- Coupons ----------
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('percent','fixed')) NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  min_purchase NUMERIC(10,2),
  applicable_slugs TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Reviews ----------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  booking_id TEXT REFERENCES bookings(id),
  service_slug TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  text TEXT,
  language TEXT DEFAULT 'tr',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Loyalty transactions ----------
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earn','redeem','referral','bonus','expire')) NOT NULL,
  booking_id TEXT REFERENCES bookings(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Agencies (B2B) ----------
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  contact_person TEXT,
  api_key TEXT UNIQUE,
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  credit_limit NUMERIC(12,2) DEFAULT 0,
  credit_used NUMERIC(12,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Email log ----------
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT,
  template TEXT,
  status TEXT CHECK (status IN ('sent','failed','queued')) DEFAULT 'queued',
  brevo_message_id TEXT,
  booking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_customers_timestamp ON customers;
CREATE TRIGGER set_customers_timestamp
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_bookings_timestamp ON bookings;
CREATE TRIGGER set_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_availability_timestamp ON availability;
CREATE TRIGGER set_availability_timestamp
  BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ---------- RLS (Row Level Security) ----------
-- Default deny — sadece availability public-read.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Public read availability
DROP POLICY IF EXISTS "Public read availability" ON availability;
CREATE POLICY "Public read availability" ON availability
  FOR SELECT USING (true);

-- Published reviews public
DROP POLICY IF EXISTS "Public read published reviews" ON reviews;
CREATE POLICY "Public read published reviews" ON reviews
  FOR SELECT USING (published = TRUE);

-- Active coupons readable (kod dogrulamasi)
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
CREATE POLICY "Public read active coupons" ON coupons
  FOR SELECT USING (active = TRUE);

-- NOT: customers/bookings/loyalty/agencies/email_log icin service_role
-- (Supabase admin client) bypass RLS — diger her sey deny-by-default.
