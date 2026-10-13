import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {parseVerifiedWebhook} from '../scripts/stripe-signature.mjs';
import {proposeAfterVerifiedCheckout,proposeAfterVerifiedReversal} from '../scripts/academy-fulfillment-plan.mjs';

const time=1780000000,secret='whsec_TEST_ONLY_NEVER_REAL';
const buyer='11111111-1111-4111-8111-111111111111';
const order={id:'baca1c11-1111-4111-8111-111111111111',user_id:buyer,
 course_slug:'processus',stripe_account_id:'acct_iagile_TEST',
 checkout_session_id:'cs_test_01',payment_intent_id:'pi_test_01',
 currency:'eur',amount_minor:9900,livemode:false,status:'pending'};
const session={id:order.checkout_session_id,object:'checkout.session',
 mode:'payment',payment_status:'paid',amount_total:9900,
 currency:'eur',client_reference_id:buyer,
 metadata:{order_id:order.id,course_slug:order.course_slug}};
const event={id:'evt_test1',type:'checkout.session.completed',
 account:order.stripe_account_id,livemode:false,data:{object:session}};
const sign=e=>{
 const body=JSON.stringify(e),sig=createHmac('sha256',secret).update(time+'.'+body).digest('hex');
 return parseVerifiedWebhook(body,'t='+time+',v1='+sig,secret,time);
};
const options={event:sign(event),order,
 merchantApproval:'merchant-approved-2026-10',offerApproval:'offer-approved-2026-10',
 learnerStatus:'active',coursePublished:true,existingEnrollment:null};
assert.equal(proposeAfterVerifiedCheckout(options).action,'propose-manual-enrollment');
for(const [name,change] of Object.entries({
 forged:{event:{...event,signatureVerified:true}},
 unapprovedMerchant:{merchantApproval:null},
 unapprovedPrice:{offerApproval:null},
 unverifiedCourse:{coursePublished:false},
 suspended:{learnerStatus:'suspended'},
 missingUser:{learnerStatus:undefined},
 mismatchAmount:{event:sign({...event,data:{object:{...session,amount_total:10}}})},
 spoofedBuyer:{event:sign({...event,data:{object:{...session,client_reference_id:'attacker'}}})},
 wrongMerchant:{event:sign({...event,account:'acct_other'})},
 wrongMode:{event:sign({...event,livemode:true})},
 freePurchase:{event:sign({...event,data:{object:{...session,payment_status:'unpaid'}}})},
 manualEntitlement:{existingEnrollment:{active:false,source:'manual'}}
})){
 const verdict=proposeAfterVerifiedCheckout({...options,...change});
 assert.equal(verdict.ok,false,name+' must fail closed');
 assert.equal(verdict.action,'hold');
}
assert.equal(proposeAfterVerifiedCheckout({...options,
 existingEnrollment:{active:true,source:'payment'}}).action,'no-op-already-enrolled');
const refund={id:'evt_refund2',type:'charge.refunded',livemode:false,
 account:order.stripe_account_id,data:{object:{payment_intent:'pi_test_01',
 amount:9900,amount_refunded:9900}}};
assert.equal(proposeAfterVerifiedReversal({event:sign(refund),order,
 existingEnrollment:{active:true,source:'payment'}}).action,'propose-revocation-review');
assert.equal(proposeAfterVerifiedReversal({event:sign(refund),order,
 existingEnrollment:{active:true,source:'manual'}}).action,'hold');
assert.equal(proposeAfterVerifiedReversal({event:{...refund},order,
 existingEnrollment:{active:true,source:'payment'}}).action,'hold');
const partial=sign({...refund,data:{object:{...refund.data.object,amount_refunded:5000}}});
assert.equal(proposeAfterVerifiedReversal({event:partial,order,
 existingEnrollment:{active:true,source:'payment'}}).action,'hold');
console.log('PASS Academy payment fulfillment: verified events, approvals, manual grant only, no automatic revocation');
