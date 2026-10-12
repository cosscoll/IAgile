import {createHmac, timingSafeEqual} from 'node:crypto';
// Verify Stripe's signed raw payload before any event can trigger fulfillment.
// The signing secret is provided by server configuration, never by a browser.
export function verifyWebhookBody(body, header, secret, clock=Math.floor(Date.now()/1000)){
  if(typeof body!=='string'||typeof header!=='string'||typeof secret!=='string')return false;
  const fields=header.split(',');
  const timestamp=fields.find(x=>x.trim().startsWith('t='))?.trim().slice(2);
  const time=Number(timestamp);
  if(!timestamp||!Number.isSafeInteger(time)||Math.abs(clock-time)>300)return false;
  const expected=createHmac('sha256',secret).update(timestamp+'.'+body).digest();
  return fields.filter(x=>x.trim().startsWith('v1=')).some(x=>{
    const provided=x.trim().slice(3);
    if(!/^[0-9a-f]{64}$/i.test(provided))return false;
    const candidate=Buffer.from(provided,'hex');
    return candidate.length===expected.length&&timingSafeEqual(candidate,expected);
  });
}
