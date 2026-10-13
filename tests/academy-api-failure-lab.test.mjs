import assert from 'node:assert/strict';
import {createLabServer} from '../scripts/academy-api-failure-lab.mjs';
const server=createLabServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const root='http://127.0.0.1:'+server.address().port;
const post=async(mode,id='T-1',other={})=>{
 const res=await fetch(root+'/tickets?mode='+mode,{
  method:'POST',headers:{'Content-Type':'application/json',...other},
  body:JSON.stringify({id,description:'Ticket fictif'})
 });
 return {status:res.status,data:await res.json(),retry:res.headers.get('retry-after')};
};
const get=async(id)=>await (await fetch(root+'/state?id='+id)).json();
try{
 const health=await(await fetch(root+'/health')).json();
 assert.equal(health.live,false);assert.equal(health.storage,'memory-only');
 const first=await post('normal','T-1');assert.equal(first.status,201);
 assert.equal(first.data.effect_confirmed,true);
 const duplicate=await post('normal','T-1');assert.equal(duplicate.status,200);
 assert.equal(duplicate.data.duplicate,true);
 assert.equal((await get('T-1')).written,true);
 const silent=await post('silent-success','T-2');assert.equal(silent.status,200);
 assert.equal(silent.data.effect_confirmed,false);
 assert.equal((await get('T-2')).written,false,'HTTP 200 must not prove effect');
 const ambig=await post('timeout-after-write','T-3');
 assert.equal(ambig.status,504);
 assert.equal((await get('T-3')).written,true,'504 may happen after effect');
 assert.equal((await post('normal','T-3')).data.duplicate,true);
 assert.equal((await post('unauthorized','T-4')).status,401);
 const throttle=await post('rate-limit','T-5');
 assert.equal(throttle.status,429);assert.equal(throttle.retry,'2');
 assert.equal((await post('server-error','T-6')).status,500);
 assert.equal((await post('nonsense','T-7')).status,400);
 const malformed=await fetch(root+'/tickets',{method:'POST',
  headers:{'Content-Type':'application/json'},body:'{"id":'});
 assert.equal(malformed.status,400);
 const invalid=await fetch(root+'/tickets',{method:'POST',
  headers:{'Content-Type':'application/json'},body:'{"id":"private","description":"bad"}'});
 assert.equal(invalid.status,422);
 assert.equal((await post('normal','T-8',{'Origin':'https://example.com'})).status,403);
 assert.equal((await get('T-8')).written,false);
 const over=await fetch(root+'/tickets',{method:'POST',
  headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'T-9',description:'X'.repeat(18000)})});
 assert.equal(over.status,413);
 assert.equal((await get('T-9')).written,false);
 console.log('PASS fake local API: real status codes, double request, false success, post-effect timeout, body and origin guards');
}finally{await new Promise(resolve=>server.close(resolve));}
