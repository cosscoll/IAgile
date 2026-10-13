import {parseVerifiedWebhook} from './stripe-signature.mjs';
import {evaluatePaidCheckout} from './academy-checkout-policy.mjs';

// Server-side *planning* logic only, never a deployed or invoked webhook endpoint.
// This module does not make payments, mutate a database, send mail or grant access.
const uuid=s=>typeof s==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
const merchant=s=>typeof s==='string'&&/^acct_[a-zA-Z0-9_]{3,120}$/.test(s);
const reject=(reason)=>({eligible:false,reason});

export async function planCanonicalStripeWebhook({
  rawBody,signature,webhookSecret,expectedMerchantAccount,approvedContractVersion,
  getOrder,clock=Math.floor(Date.now()/1000)
}={}){
  if(!merchant(expectedMerchantAccount)||!approvedContractVersion||
    typeof approvedContractVersion!=='string'||approvedContractVersion.length>100)
    return reject('merchant or offer not explicitly configured');
  if(typeof getOrder!=='function')return reject('trusted order lookup unavailable');

  let event;
  try{event=parseVerifiedWebhook(rawBody,signature,webhookSecret,clock);}
  catch(_error){return reject('Stripe signature or event parsing refused');}
  if(event.account!==expectedMerchantAccount)return reject('unapproved Stripe merchant');
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))
    return reject('event is not a purchase confirmation');

  const session=event.data?.object;
  const orderId=session?.metadata?.order_id;
  if(!uuid(orderId))return reject('untrusted or missing order identifier');
  if(!session?.payment_intent||!/^pi_[a-zA-Z0-9_]{3,120}$/.test(session.payment_intent))
    return reject('missing verified payment intent');

  let order;
  try{order=await getOrder(orderId);}
  catch(_error){return reject('canonical order lookup failed');}
  if(!order||order.id!==orderId)return reject('no matching canonical order');
  const decision=evaluatePaidCheckout(event,order);
  if(!decision.eligible)return reject('canonical checkout rejected: '+decision.reason);
  if(!order.consent_recorded_at||!Number.isFinite(Date.parse(order.consent_recorded_at))||
    order.contract_version!==approvedContractVersion)return reject('contract and buyer consent not verified');
  if(session.payment_intent!==order.payment_intent_id)return reject('payment intent mismatch');
  // Return a *proposal*. The caller must separately validate merchant ownership
  // and security, then use a privileged server-side transaction. Never hand
  // these arguments to an authenticated browser.
  return {
    eligible:true,action:'propose-private-ledger-record',
    rpc:'academy_billing.record_checkout_payment',
    args:{
      p_order_id:order.id,p_event_id:event.id,p_event_type:event.type,
      p_session_id:session.id,p_payment_intent_id:session.payment_intent,
      p_buyer_id:order.user_id,p_course_slug:order.course_slug,
      p_merchant_account_id:order.stripe_account_id,
      p_amount_minor:order.amount_minor,p_currency:order.currency,
      p_livemode:order.livemode,p_payment_status:session.payment_status
    },
    enrollmentGranted:false,invoiceIssued:false,ledgerUpdated:false
  };
}
