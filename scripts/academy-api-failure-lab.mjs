import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';

// Local pedagogical simulator only. In-memory fictitious tickets; no external API.
export function createLabServer(){
 const records=new Map();
 const send=(res,status,body)=>{
   res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
   res.end(JSON.stringify(body));
 };
 const server=createServer(async(req,res)=>{
   if(req.headers.origin){send(res,403,{error:'Cross-origin browser requests are not allowed in this local lab.'});return;}
   const url=new URL(req.url,'http://127.0.0.1');
   if(req.method==='GET'&&url.pathname==='/health'){
     send(res,200,{status:'local-simulation',live:false,storage:'memory-only'});return;
   }
   if(req.method==='GET'&&url.pathname==='/state'){
     const key=url.searchParams.get('id');
     if(!key||!/^T-[0-9]{1,5}$/.test(key)){send(res,422,{error:'Use fictitious ticket id like T-1'});return;}
     send(res,200,{id:key,written:records.has(key),ticket:records.get(key)||null});return;
   }
   if(req.method!=='POST'||url.pathname!=='/tickets'){
     send(res,404,{error:'Try POST /tickets?mode=normal or GET /health or GET /state?id=T-1'});return;
   }
   if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')){
     send(res,415,{error:'Expected Content-Type: application/json'});return;
   }
   let length=0,parts=[];
   for await(const chunk of req){
     length+=chunk.length;
     if(length>16384){send(res,413,{error:'Example body too long'});return;}
     parts.push(chunk);
   }
   let body;
   try{body=JSON.parse(Buffer.concat(parts).toString('utf8'));}
   catch{send(res,400,{error:'Malformed JSON'});return;}
   const id=body?.id;
   if(typeof id!=='string'||!/^T-[0-9]{1,5}$/.test(id)||
      typeof body?.description!=='string'||!body.description.trim()||body.description.length>200){
     send(res,422,{error:'Expected fictitious id T-1 and nonempty description (max 200 chars)'});return;
   }
   const mode=url.searchParams.get('mode')||'normal';
   if(mode==='unauthorized'){send(res,401,{error:'Synthetic authorization denied'});return;}
   if(mode==='rate-limit'){res.setHeader('Retry-After','2');send(res,429,{error:'Synthetic rate limit. Retry only after checking the operation state.'});return;}
   if(mode==='server-error'){send(res,500,{error:'Synthetic provider error; effect not created'});return;}
   if(mode==='silent-success'){send(res,200,{ok:true,message:'Simulation: success response but no data was written',effect_confirmed:false});return;}
   if(!['normal','timeout-after-write'].includes(mode)){send(res,400,{error:'Unknown synthetic mode'});return;}
   if(records.has(id)){
     send(res,200,{ok:true,id,duplicate:true,effect_confirmed:true});return;
   }
   records.set(id,{description:body.description,source:'synthetic-only'});
   if(mode==='timeout-after-write'){
     send(res,504,{error:'Synthetic gateway timeout AFTER the effect. Verify GET /state before retrying.',effect_confirmed:false});return;
   }
   send(res,201,{ok:true,id,duplicate:false,effect_confirmed:true});
 });
 return server;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const raw=process.argv[2]||'12700';
 const port=Number(raw);
 if(!Number.isInteger(port)||port<1024||port>65535){
   process.stderr.write('Specify a local port from 1024 to 65535.\n');process.exitCode=1;
 }else{
   const server=createLabServer();
   server.listen(port,'127.0.0.1',()=>{
     process.stdout.write('IAgile fake API on http://127.0.0.1:'+port+' (local, RAM only, no external calls)\n');
   });
 }
}
