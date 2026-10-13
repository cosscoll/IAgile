import {evaluatePaidCheckout,evaluateReversal} from './academy-checkout-policy.mjs';

// Decision support only. There are NO database writes, checkout API calls,
// automatic entitlements, invoices or webhooks in this file.
const fail=reason=>({ok:false,action:'hold',reason});
const hasApproval=s=>typeof s==='string'&&s.length>=8&&s.length<=120;

export function proposeAfterVerifiedCheckout({event,order,merchantApproval,offerApproval,
  learnerStatus,coursePublished,existingEnrollment}={}){
  const validated=evaluatePaidCheckout(event,order);
  if(!validated.eligible)return fail('Payment policy: '+validated.reason);
  if(!hasApproval(merchantApproval)||!hasApproval(offerApproval))
    return fail('Merchant and contractual offer need human approval');
  if(learnerStatus!=='active')return fail('Buyer profile not active');
  if(coursePublished!==true)return fail('Course not published and verified');
  if(existingEnrollment?.active===true)
    return {ok:true,action:'no-op-already-enrolled',buyerId:validated.userId,
      courseSlug:validated.courseSlug,orderId:validated.orderId};
  if(existingEnrollment && existingEnrollment.source!=='payment')
    return fail('Existing entitlement source needs human review');
  return {ok:true,action:'propose-manual-enrollment',
    buyerId:validated.userId,courseSlug:validated.courseSlug,
    orderId:validated.orderId,source:'payment',
    note:'No writes or payment activation: require independently reviewed server transaction'};
}
export function proposeAfterVerifiedReversal({event,order,existingEnrollment}={}){
  const decision=evaluateReversal(event,order);
  if(!decision.eligible)return fail(decision.reason);
  if(!existingEnrollment||existingEnrollment.source!=='payment')
    return fail('Entitlement is absent or from a different source; no revocation');
  return {ok:true,action:decision.action,orderId:decision.orderId,
    courseSlug:order.course_slug,buyerId:order.user_id,
    note:'No automatic revocation: consult applicable contract and customer support'};
}
