-- TripAndTick.com — service_overrides (Q2-genis admin panel)
-- =====================================================================
-- Importers: src/lib/db/service-overrides.ts + /api/price + /api/admin/service-override
-- Affected: BookingClient.tsx (dinamik fiyat fetch + iptal/rotar banner)
-- Data:
--   service_overrides: (service_slug, date) PK. Admin gunluk override.
--     price_override NULL ise catalog adultPrice gecerli.
--     status='active' default; 'cancelled' (hava iptal), 'delayed' (rotar), 'sold_out'.
--     Datetime: TIMESTAMPTZ ISO 8601, DATE: YYYY-MM-DD.
-- User verbatim:
--   "butun fiyatlari admin panelinde anlik degistirebilmeliyiz. tum hizmetlerde
--    gunluk iptal, rotar gibi ozellikler olabilmeli (hava durumundan dolayi)"
-- =====================================================================

CREATE TABLE IF NOT EXISTS service_overrides (
  service_slug TEXT NOT NULL,
  date DATE NOT NULL,
  price_override NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','cancelled','delayed','sold_out')),
  cancellation_reason TEXT,
  delay_minutes INTEGER,
  note TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (service_slug, date)
);

CREATE INDEX IF NOT EXISTS idx_service_overrides_date ON service_overrides(date);
CREATE INDEX IF NOT EXISTS idx_service_overrides_status ON service_overrides(status);

ALTER TABLE service_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_overrides public read"
  ON service_overrides FOR SELECT
  USING (TRUE);

CREATE POLICY "service_overrides admin write"
  ON service_overrides FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_service_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_overrides_updated_at ON service_overrides;
CREATE TRIGGER trg_service_overrides_updated_at
  BEFORE UPDATE ON service_overrides
  FOR EACH ROW
  EXECUTE FUNCTION set_service_overrides_updated_at();
