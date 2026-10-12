-- Versioned prelaunch ledger operation. Only a trusted server with service_role may invoke.
-- IMPORTANT: this does not verify a Stripe signature, create a charge, issue a
-- learner entitlement, send a confirmation, or emit an invoice.
ALTER TABLE academy_billing.orders
 ADD COLUMN IF NOT EXISTS livemode boolean NOT NULL DEFAULT false;
ALTER TABLE academy_billing.webhook_events
 ADD COLUMN IF NOT EXISTS livemode boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION academy_billing.record_checkout_payment(
 p_order_id uuid,
 p_event_id text,
 p_event_type text,
 p_session_id text,
 p_payment_intent_id text,
 p_buyer_id uuid,
 p_course_slug text,
 p_merchant_account_id text,
 p_amount_minor bigint,
 p_currency text,
 p_livemode boolean,
 p_payment_status text
) RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $$
DECLARE
 v_order academy_billing.orders%ROWTYPE;
 v_inserted text;
BEGIN
 IF p_order_id IS NULL OR p_event_id IS NULL OR p_event_id !~ '^evt_[A-Za-z0-9_]+$'
  OR p_event_type NOT IN ('checkout.session.completed','checkout.session.async_payment_succeeded')
  OR p_payment_status IS DISTINCT FROM 'paid'
  OR p_session_id IS NULL OR p_session_id !~ '^cs_[A-Za-z0-9_]+$'
  OR p_payment_intent_id IS NULL OR p_payment_intent_id !~ '^pi_[A-Za-z0-9_]+$'
  OR p_buyer_id IS NULL OR p_course_slug IS NULL
  OR p_merchant_account_id IS NULL OR p_merchant_account_id !~ '^acct_[A-Za-z0-9_]+$'
  OR p_amount_minor IS NULL OR p_amount_minor < 1
  OR p_currency IS NULL OR p_currency !~ '^[a-z]{3}$'
  OR p_livemode IS NULL THEN
   RAISE EXCEPTION 'Invalid canonical payment assertion' USING ERRCODE='22023';
 END IF;
 SELECT * INTO v_order FROM academy_billing.orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'No matching order' USING ERRCODE='22023'; END IF;
 IF v_order.buyer_id IS DISTINCT FROM p_buyer_id
  OR v_order.course_slug IS DISTINCT FROM p_course_slug
  OR v_order.merchant_account_id IS DISTINCT FROM p_merchant_account_id
  OR v_order.amount_minor IS DISTINCT FROM p_amount_minor
  OR v_order.currency IS DISTINCT FROM p_currency
  OR v_order.livemode IS DISTINCT FROM p_livemode
  OR v_order.checkout_session_id IS DISTINCT FROM p_session_id
  OR v_order.payment_intent_id IS DISTINCT FROM p_payment_intent_id
  OR v_order.consent_recorded_at IS NULL THEN
   RAISE EXCEPTION 'Order does not match trusted event or consent missing' USING ERRCODE='22023';
 END IF;
 IF v_order.status NOT IN ('pending','paid') THEN
   RAISE EXCEPTION 'Order may not transition from this status' USING ERRCODE='22023';
 END IF;

 INSERT INTO academy_billing.webhook_events AS e
  (event_id,merchant_account_id,event_type,object_id,order_id,livemode,processing_status)
 VALUES
  (p_event_id,p_merchant_account_id,p_event_type,p_session_id,p_order_id,p_livemode,'received')
 ON CONFLICT (event_id) DO NOTHING
 RETURNING event_id INTO v_inserted;
 IF v_inserted IS NULL THEN RETURN 'duplicate_event'; END IF;

 IF v_order.status='paid' THEN
  UPDATE academy_billing.webhook_events
    SET processing_status='ignored',processed_at=pg_catalog.clock_timestamp(),
        notes='Order was already marked paid'
  WHERE event_id=p_event_id;
  RETURN 'already_paid';
 END IF;

 UPDATE academy_billing.orders
    SET status='paid',paid_at=pg_catalog.clock_timestamp(),
        updated_at=pg_catalog.clock_timestamp()
 WHERE id=p_order_id AND status='pending';

 UPDATE academy_billing.webhook_events
    SET processing_status='processed',processed_at=pg_catalog.clock_timestamp(),
        notes='Payment recorded. Manual course entitlement and invoicing not yet enabled'
 WHERE event_id=p_event_id;
 RETURN 'payment_recorded_no_entitlement';
END;
$$;
REVOKE ALL ON FUNCTION academy_billing.record_checkout_payment(uuid,text,text,text,text,uuid,text,text,bigint,text,boolean,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION academy_billing.record_checkout_payment(uuid,text,text,text,text,uuid,text,text,bigint,text,boolean,text)
  TO service_role;
