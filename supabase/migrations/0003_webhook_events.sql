-- TripAndTick.com — webhook_events (idempotency dedup for Stripe/iyzico)
-- =====================================================================
-- Importers: src/lib/db/webhook-events.ts (yeni) + src/app/api/stripe/webhook/route.ts
-- Affected: Stripe redeliver veya retry sirasinda duplicate event-process onlenir.
-- Data:
--   webhook_events: event_id TEXT PK. Provider 'stripe' veya 'iyzico'.
--     received_at TIMESTAMPTZ ISO 8601. type basit string.
-- =====================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'iyzico')),
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Sadece service_role yazar — public okuma yasak.
CREATE POLICY "webhook_events service write"
  ON webhook_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
