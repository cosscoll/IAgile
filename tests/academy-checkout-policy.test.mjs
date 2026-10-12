import assert from 'node:assert/strict';
import {evaluatePaidCheckout,evaluateReversal,recordUniqueEvent} from '../scripts/academy-checkout-policy.mjs';
const order={id:'order_test_001',user_id:'11111111-1111-4111-8111-111111111111',
  stripe_account_id:'acct_iagile_TEST',course_slug:'processus',checkout_session_id:'cs_test_001',
  payment_intent_id:'pi_test_001',currency:'eur',amount_minor:9900,livemode:false,status:'pending'};
const session={object:'checkout.session',id:'cs_test_001',mode:'payment',payment_status:'paid',
  amount_total:9900,currency:'eur',client_reference_id:order.user_id,
  metadata:{order_id:order.id,course_slug:'processus'}};
const event={id:'evt_test_001',type:'checkout.session.completed',signatureVerified:true,
  livemode:false,account:'acct_iagile_TEST',data:{object:session}};
const test=(label,changes={},ord=order)=>{
  const changed={...event,...changes};
  return evaluatePaidCheckout(changed,ord);
};
assert.deepEqual(test('valid').action,'propose-grant');
assert.equal(test('valid').courseSlug,'processus');
assert.equal(test('invalid signature',{signatureVerified:false}).eligible,false);
assert.equal(test('wrong account',{account:'acct_other'}).eligible,false);
assert.equal(test('wrong live mode',{livemode:true}).eligible,false);
assert.equal(test('unpaid',{data:{object:{...session,payment_status:'unpaid'}}}).eligible,false);
assert.equal(test('async pending',{type:'checkout.session.completed',data:{object:{...session,payment_status:'unpaid'}}}).eligible,false);
assert.equal(test('different course',{data:{object:{...session,metadata:{...session.metadata,course_slug:'agents'}}}}).eligible,false);
assert.equal(test('different user',{data:{object:{...session,client_reference_id:'someone-else'}}}).eligible,false);
assert.equal(test('changed amount',{data:{object:{...session,amount_total:100}}}).eligible,false);
assert.equal(test('changed currency',{data:{object:{...session,currency:'usd'}}}).eligible,false);
assert.equal(test('other session',{data:{object:{...session,id:'cs_test_002'}}}).eligible,false);
assert.equal(test('redirect',{type:'checkout.session.expired'}).eligible,false);
assert.equal(test('unknown item',{}, {...order,course_slug:'invalid'}).eligible,false);
assert.equal(test('refunded order',{}, {...order,status:'refunded'}).eligible,false);
assert.equal(test('async success',{type:'checkout.session.async_payment_succeeded'}).eligible,true);
const paid=new Set();
assert.equal(recordUniqueEvent(paid,'evt_test_001').eligible,true);
assert.equal(recordUniqueEvent(paid,'evt_test_001').eligible,false);
const refund={id:'evt_refund',signatureVerified:true,account:order.stripe_account_id,
  livemode:false,type:'charge.refunded',data:{object:{payment_intent:order.payment_intent_id,
    amount:9900,amount_refunded:9900}}};
assert.equal(evaluateReversal(refund,order).action,'propose-revocation-review');
assert.equal(evaluateReversal({...refund,data:{object:{payment_intent:order.payment_intent_id,amount:9900,amount_refunded:1000}}},order).eligible,false);
assert.equal(evaluateReversal({...refund,account:'acct_other'},order).eligible,false);
assert.equal(evaluateReversal({...refund,data:{object:{...refund.data.object,payment_intent:'pi_other'}}},order).eligible,false);
assert.equal(evaluateReversal({...refund,type:'charge.dispute.created'},order).action,'propose-suspension-review');
console.log('PASS 22 sandbox scenarios for signed, paid, same-buyer, same-course, replay and reversal policy');
