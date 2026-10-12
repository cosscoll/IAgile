// Pure sandbox policy: authentication of raw Stripe webhooks is OUTSIDE this module.
// No Stripe secret, network access, enrolment write, invoice or live payment.
const courses=new Set(['processus','agents','automatisation','sites-3d']);
const isSafeId=s=>typeof s==='string'&&s.length>0&&s.length<256;
const reject=reason=>({eligible:false,reason});
export function evaluatePaidCheckout(event,order){
  if(!event||!order||!event.data?.object) return reject('missing event or order');
  if(!isSafeId(event.id)||!isSafeId(order.id))return reject('missing event identity');
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))
    return reject('not a fulfillment event');
  // This module is not a fulfillment handler; only call it AFTER server-side validation.
  if(event.signatureVerified!==true)return reject('unverified sandbox event');
  const session=event.data.object;
  if(session.object!=='checkout.session'||session.mode!=='payment')
    return reject('wrong Stripe object or mode');
  if(!courses.has(order.course_slug)||!isSafeId(order.user_id))
    return reject('unknown course or buyer');
  if(!isSafeId(order.stripe_account_id)||event.account!==order.stripe_account_id)
    return reject('wrong merchant account');
  if(event.livemode!==order.livemode)return reject('test/live mode mismatch');
  if(session.id!==order.checkout_session_id)return reject('session mismatch');
  if(session.metadata?.order_id!==order.id||
      session.metadata?.course_slug!==order.course_slug||
      session.client_reference_id!==order.user_id)
    return reject('buyer, order, or course mismatch');
  if(session.payment_status!=='paid')return reject('payment not confirmed');
  if(!Number.isSafeInteger(order.amount_minor)||order.amount_minor<1||
      session.amount_total!==order.amount_minor||
      String(session.currency||'').toLowerCase()!==String(order.currency||'').toLowerCase())
    return reject('price or currency mismatch');
  if(!['pending','paid'].includes(order.status))return reject('unexpected order status');
  return {eligible:true,action:'propose-grant',
    eventId:event.id,orderId:order.id,userId:order.user_id,courseSlug:order.course_slug};
}
export function evaluateReversal(event,order){
  if(!event||!order||event.signatureVerified!==true)return reject('missing verified sandbox event');
  if(event.account!==order.stripe_account_id||event.livemode!==order.livemode)
    return reject('merchant or mode mismatch');
  const obj=event.data?.object;
  if(event.type==='charge.refunded'){
    if(!obj||obj.payment_intent!==order.payment_intent_id)return reject('payment mismatch');
    if(!Number.isSafeInteger(obj.amount_refunded)||!Number.isSafeInteger(obj.amount)||
        obj.amount_refunded<=0||obj.amount_refunded>obj.amount)return reject('invalid refunded amount');
    if(obj.amount_refunded!==obj.amount)
      return {eligible:false,reason:'partial refund requires manual contractual review'};
    return {eligible:true,action:'propose-revocation-review',orderId:order.id,eventId:event.id};
  }
  if(event.type==='charge.dispute.created'){
    if(!obj||obj.payment_intent!==order.payment_intent_id)return reject('payment mismatch');
    return {eligible:true,action:'propose-suspension-review',orderId:order.id,eventId:event.id};
  }
  return reject('not a reversal event');
}
export function recordUniqueEvent(processedEvents,eventId){
  if(!(processedEvents instanceof Set)||!isSafeId(eventId))return reject('invalid event ledger');
  if(processedEvents.has(eventId))return reject('event already processed');
  processedEvents.add(eventId); // Test simulation only; production requires a UNIQUE database transaction.
  return {eligible:true,eventId};
}
