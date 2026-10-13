import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {planCanonicalStripeWebhook} from '../scripts/academy-checkout-webhook-plan.mjs';

const secret='whsec_ONLY_SYNTHETIC_MOCKS',clock=1780000000;
const buyer='11111111-1111-4111-8111-111111111111';
const order={id:'baca1c11-1111-4111-8111-111111111111',
  user_id:buyer,course_slug:'processus',stripe_account_id:'acct_iagile_TEST',
  checkout_session_id:'cs_test_01',payment_intent_id:'pi_test_01',
  currency:'eur',amount_minor:9900,livemode:false,status:'pending',
  consent_recorded_at:'2026-10-12T12:00:00Z',contract_version:'draft-2026-10'};
const session={id:order.checkout_session_id,object:'checkout.session',
  mode:'payment',payment_status:'paid',payment_intent:order.payment_intent_id,
  amount_total:9900,currency:'eur',client_reference_id:buyer,
  metadata:{order_id:order.id,course_slug:order.course_slug}};
const event={id:'evt_test1',type:'checkout.session.completed',
  account:order.stripe_account_id,livemode:false,data:{object:session}};
const signed=e=>{
  const rawBody=JSON.stringify(e);
  const signature='t='+clock+',v1='+createHmac('sha256',secret)
    .update(clock+'.'+rawBody).digest('hex');
  return {rawBody,signature};
};
let lookups=0;
const getOrder=async id=>{lookups++;assert.equal(id,order.id);return order};
const base={...signed(event),webhookSecret:secret,
 expectedMerchantAccount:order.stripe_account_id,
 approvedContractVersion:order.contract_version,getOrder,clock};
const valid=await planCanonicalStripeWebhook(base);
assert.equal(valid.eligible,true);
assert.equal(valid.action,'propose-private-ledger-record');
assert.equal(valid.rpc,'academy_billing.record_checkout_payment');
assert.equal(valid.args.p_amount_minor,9900);
assert.equal(valid.args.p_buyer_id,buyer);
assert.equal(valid.args.p_payment_status,'paid');
assert.equal(valid.enrollmentGranted,false);
assert.equal(valid.ledgerUpdated,false);
assert.equal(valid.invoiceIssued,false);
assert.equal(lookups,1);
for(const bad of [
 {name:'invalid-signature',args:{signature:'t='+clock+',v1='+('0'.repeat(64))}},
 {name:'expired',args:{clock:clock+400}},
 {name:'merchant-not-configured',args:{expectedMerchantAccount:''}},
 {name:'not-purchase',args:signed({...event,type:'charge.refunded'})},
 {name:'wrong-merchant',args:signed({...event,account:'acct_other'})},
 {name:'no-order-id',args:signed({...event,data:{object:{...session,metadata:{course_slug:'processus'}}}})},
 {name:'mismatched-course',args:signed({...event,data:{object:{...session,metadata:{...session.metadata,course_slug:'agents'}}}})},
 {name:'different-buyer',args:signed({...event,data:{object:{...session,client_reference_id:'other'}}})},
 {name:'unpaid',args:signed({...event,data:{object:{...session,payment_status:'unpaid'}}})},
 {name:'no-intent',args:signed({...event,data:{object:{...session,payment_intent:null}}})},
 {name:'wrong-intent',args:signed({...event,data:{object:{...session,payment_intent:'pi_other'}}})},
 {name:'wrong-amount',args:signed({...event,data:{object:{...session,amount_total:1}}})},
 {name:'no-consent',args:{getOrder:async()=>({...order,consent_recorded_at:null})}},
 {name:'wrong-contract',args:{approvedContractVersion:'other-approved-version'}},
 {name:'lookup-error',args:{getOrder:async()=>{throw Error('db unavailable')}}}
]){
  const result=await planCanonicalStripeWebhook({...base,...bad.args});
  assert.equal(result.eligible,false,bad.name);
  assert.equal(result.action,undefined,bad.name);
}
assert.equal(await planCanonicalStripeWebhook({...base,
  getOrder:async()=>null}).then(r=>r.eligible),false);
assert.equal(await planCanonicalStripeWebhook({...base,
  getOrder:async()=>({...order,livemode:true})}).then(r=>r.eligible),false);
console.log('PASS 18 signed Stripe preflight cases; 0 checkout, ledger, access or invoice writes');
