import assert from 'node:assert/strict';
import fs from 'node:fs';
const text=fs.readFileSync(
 'supabase/migrations/20261012_billing_record_server_verified_checkout.sql','utf8');
for(const value of [
 'ADD COLUMN IF NOT EXISTS livemode boolean NOT NULL DEFAULT false',
 'SECURITY INVOKER',
 'SET search_path TO',
 'p_payment_status IS DISTINCT FROM',
 "v_order.consent_recorded_at IS NULL",
 'v_order.checkout_session_id IS DISTINCT FROM p_session_id',
 'v_order.payment_intent_id IS DISTINCT FROM p_payment_intent_id',
 'v_order.amount_minor IS DISTINCT FROM p_amount_minor',
 'v_order.livemode IS DISTINCT FROM p_livemode',
 "IF v_order.status NOT IN ('pending','paid')",
 'FOR UPDATE',
 'ON CONFLICT (event_id) DO NOTHING',
 "RETURN 'duplicate_event'",
 "RETURN 'already_paid'",
 "RETURN 'payment_recorded_no_entitlement'",
 'REVOKE ALL ON FUNCTION',
 'TO service_role'
])assert(text.includes(value),'Missing a required payment guard: '+value);
assert(!/INSERT INTO public\.academy_enrollments/i.test(text),
  'Recording a Stripe payment must not silently grant enrollment');
assert(!/GRANT EXECUTE[\s\S]*?TO authenticated/i.test(text),
  'Client roles must never be able to confirm payments');
console.log('PASS server-only payment ledger verifies canonical order, amount, consent, mode and event id');
