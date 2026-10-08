import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.OPENAI_API_KEY;
const originalAllowed = process.env.CHAT_ALLOWED_ORIGIN;
after(()=>{globalThis.fetch=originalFetch;if(originalKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=originalKey;if(originalAllowed===undefined)delete process.env.CHAT_ALLOWED_ORIGIN;else process.env.CHAT_ALLOWED_ORIGIN=originalAllowed;});
function mock(method='POST',body={},origin='https://cosscoll.github.io'){
 const req={method,headers:{origin,'content-type':'application/json','x-forwarded-for':'192.0.2.100'},body};
 let status,headers,data;
 const res={writeHead(s,h){status=s;headers=h;},end(value=''){data=value;}};
 return {req,res,result:()=>({status,headers,json:data?JSON.parse(data):null})};
}

test('service correctly reports missing secret — no fake generative answers',async()=>{
 delete process.env.OPENAI_API_KEY;const m=mock('GET');await handler(m.req,m.res);assert.deepEqual(m.result().json,{ready:false,generative:true});
 const p=mock('POST',{message:'Coucou'});await handler(p.req,p.res);assert.equal(p.result().status,503);
});

test('prohibits cross-origin calls',async()=>{
 process.env.OPENAI_API_KEY='DUMMY_TEST_SECRET';const m=mock('POST',{message:'hi'},'https://bad.example');await handler(m.req,m.res);assert.equal(m.result().status,403);
});

test('validates empty and oversized questions',async()=>{
 process.env.OPENAI_API_KEY='DUMMY_TEST_SECRET';let m=mock('POST',{message:' '});await handler(m.req,m.res);assert.equal(m.result().status,400);
 m=mock('POST',{message:'z'.repeat(851)});await handler(m.req,m.res);assert.equal(m.result().status,400);
});

test('generates response through OpenAI API and forwards constrained history',async()=>{
 process.env.OPENAI_API_KEY='DUMMY_TEST_SECRET';let payload,auth;
 globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://api.openai.com/v1/responses');auth=opts.headers.Authorization;payload=JSON.parse(opts.body);return {ok:true,async json(){return {output:[{type:'message',content:[{type:'output_text',text:'Pour votre activité, je commencerais par automatiser la réception des formulaires. Pouvez-vous préciser la fréquence des demandes ?'}]}]};}}};
 const m=mock('POST',{message:'Je veux gagner du temps avec mes formulaires clients.',history:[{role:'user',content:'Bonjour'}, {role:'assistant',content:'Bonjour, que souhaitez-vous faire ?'}],page:'/IAgile/formations/automatiser-tache.html'});
 await handler(m.req,m.res);assert.equal(m.result().status,200);assert.match(m.result().json.answer,/automatiser la réception/);assert.equal(m.result().json.generative,true);
 assert.equal(auth,'Bearer DUMMY_TEST_SECRET');assert.equal(payload.store,false);assert.match(payload.instructions,/quatre formations/);assert.equal(payload.input.at(-1).content,'Je veux gagner du temps avec mes formulaires clients.');assert.equal(payload.input.at(-3).content,'Bonjour');
 assert.equal(m.result().headers['Access-Control-Allow-Origin'],'https://cosscoll.github.io');
});

test('does not fabricate answer if the model fails',async()=>{
 process.env.OPENAI_API_KEY='DUMMY_TEST_SECRET';globalThis.fetch=async()=>({ok:false,status:500});const m=mock('POST',{message:'Quels sont les tarifs ?'});await handler(m.req,m.res);assert.equal(m.result().status,502);assert.equal(m.result().json.answer,undefined);
});
