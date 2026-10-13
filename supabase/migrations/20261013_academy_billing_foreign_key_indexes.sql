-- IAgile Academy — private billing ledger foreign-key lookup indexes.
-- Non-destructive: billing stays private, RLS stays enabled, no checkout enabled.
-- Existing buyer_id index begins with buyer_id, so only these two FK
-- columns need a separate covering index.
create index if not exists academy_billing_orders_course_slug_fk_idx
  on academy_billing.orders (course_slug);
create index if not exists academy_billing_webhook_events_order_id_fk_idx
  on academy_billing.webhook_events (order_id);
