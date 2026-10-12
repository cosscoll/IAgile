-- Private prelaunch order ledger. NO payment processors connected.
-- SECURITY: never expose this schema to browser clients.
CREATE SCHEMA IF NOT EXISTS academy_billing;
REVOKE ALL ON SCHEMA academy_billing FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA academy_billing TO service_role;

CREATE TABLE IF NOT EXISTS academy_billing.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  course_slug text NOT NULL REFERENCES public.academy_courses(slug) ON DELETE RESTRICT,
  merchant_account_id text NOT NULL CHECK (merchant_account_id LIKE 'acct_%'),
  currency text NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  checkout_session_id text UNIQUE,
  payment_intent_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','refunded','disputed','cancelled')),
  contract_version text NOT NULL CHECK (char_length(contract_version) BETWEEN 3 AND 120),
  consent_recorded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CHECK (status <> 'paid' OR paid_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS academy_billing_orders_buyer_course_idx
  ON academy_billing.orders(buyer_id,course_slug);
CREATE INDEX IF NOT EXISTS academy_billing_orders_status_idx
  ON academy_billing.orders(status);

CREATE TABLE IF NOT EXISTS academy_billing.webhook_events (
  event_id text PRIMARY KEY CHECK (char_length(event_id) BETWEEN 8 AND 255),
  merchant_account_id text NOT NULL CHECK (merchant_account_id LIKE 'acct_%'),
  event_type text NOT NULL CHECK (char_length(event_type) BETWEEN 3 AND 200),
  object_id text NOT NULL CHECK (char_length(object_id) BETWEEN 3 AND 255),
  order_id uuid REFERENCES academy_billing.orders(id) ON DELETE RESTRICT,
  processing_status text NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received','processed','ignored','manual_review')),
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes)<=1000)
);
CREATE INDEX IF NOT EXISTS academy_billing_webhook_object_idx
  ON academy_billing.webhook_events(merchant_account_id,event_type,object_id);

ALTER TABLE academy_billing.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_billing.webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA academy_billing FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA academy_billing TO service_role;
-- No anon/authenticated policies and no grant: all client API access denied.
-- A future backend must check Stripe events and perform atomic grant operations.
-- No webhook, automatic grant or live checkout is enabled by this migration.
