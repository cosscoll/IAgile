import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync('supabase/migrations/20261012_academy_billing_private_ledger.sql','utf8');
for(const table of ['orders','webhook_events']){
  assert(sql.includes('CREATE TABLE IF NOT EXISTS academy_billing.'+table),'Missing '+table);
  assert(sql.includes('ALTER TABLE academy_billing.'+table+' ENABLE ROW LEVEL SECURITY'),'Missing RLS '+table);
}
assert(sql.includes('REVOKE ALL ON SCHEMA academy_billing FROM PUBLIC,anon,authenticated'));
assert(sql.includes('REVOKE ALL ON ALL TABLES IN SCHEMA academy_billing FROM PUBLIC,anon,authenticated'));
assert(sql.includes('GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA academy_billing TO service_role'));
assert(sql.includes('checkout_session_id text UNIQUE'));
assert(sql.includes('payment_intent_id text UNIQUE'));
assert(sql.includes('event_id text PRIMARY KEY'));
assert(sql.includes('REFERENCES public.academy_courses(slug)'));
assert(!/GRANT (?:SELECT|INSERT|UPDATE).* TO (?:anon|authenticated)/i.test(sql));
console.log('PASS private billing ledger schema requires RLS, merchant-side permissions and unique event keys');
