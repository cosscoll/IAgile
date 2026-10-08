/* IAgile Assistant V15 — model-generated answers only.
 * Browser sends the conversation to a secure API; no canned Q&A fallback.
 * Requires a configured server; never expose API credentials here.
 */
(()=>{
'use strict';
if(document.getElementById('iaChatShell'))return;
const isCoursePage=location.pathname.includes('/formations/');
const prefix=isCoursePage?'../':'';
const endpoint=(window.IAgileChatConfig?.endpoint||((location.hostname==='cosscoll.github.io')?'':'/api/chat')).trim();
const paths=[
 ['Site web 3D','formations/sites-web-3d.html'],['Agents IA','formations/agents-personnalises.html'],
 ['Automatisation','formations/automatiser-tache.html'],['IA au quotidien','formations/ia-au-quotidien.html']
];
const context=isCoursePage?paths.find(p=>location.pathname.endsWith('/'+p[1]))?.[0]:null;
const samplePrompts=context?['Que vais-je savoir faire à la fin ?','Est-ce adapté à mon niveau ?','Quel projet final vais-je créer ?','Quels outils sont au programme ?']:
 ['J’ai une petite entreprise : que me conseilles-tu ?','Comment créer un agent IA personnalisé ?','Je débute, par où commencer ?','Quelles différences entre les 4 formations ?'];
const html=`<button class="ia-chat-launch" id="iaChatLaunch" type="button" aria-controls="iaChatPanel" aria-expanded="false" aria-label="Ouvrir IAgile Assistant"><span class="ia-chat-glyph" aria-hidden="true"></span><span class="ia-chat-launch-copy"><b>Parlons de votre projet</b><small>ASSISTANT IA · CHROME</small></span></button>
<section class="ia-chat-panel" id="iaChatPanel" role="dialog" aria-modal="false" aria-label="IAgile Assistant IA" hidden>
 <div class="ia-chat-panel-head"><span class="ia-chat-headmark" aria-hidden="true">✳</span><div class="ia-chat-heading"><strong>IAgile Assistant</strong><span><i class="ia-chat-live" id="iaChatStatusDot"></i><span id="iaChatStatus">VÉRIFICATION DU SERVICE…</span></span></div><button class="ia-chat-close" type="button" id="iaChatReset" aria-label="Nouvelle conversation" title="Nouvelle conversation">↺</button><button class="ia-chat-close" type="button" id="iaChatClose" aria-label="Fermer l'assistant">×</button></div>
 <div class="ia-chat-thread" id="iaChatThread" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions"></div>
 <form class="ia-chat-bottom" id="iaChatForm"><label class="ia-chat-visually-hidden" for="iaChatInput">Votre question</label><div class="ia-chat-composer"><textarea id="iaChatInput" rows="1" maxlength="850" placeholder="Écrivez votre question…" autocomplete="off"></textarea><button type="submit" class="ia-chat-send" id="iaChatSend" aria-label="Envoyer votre question">↗</button></div><div class="ia-chat-bottom-note">Réponses générées par IA après connexion au moteur. Ne partagez pas de données sensibles.</div></form>
</section>`;
const shell=document.createElement('aside');shell.id='iaChatShell';shell.className='ia-chat-shell';shell.setAttribute('aria-label','Assistant conversationnel IAgile');shell.innerHTML=html;document.body.appendChild(shell);
const $=(s,root=document)=>root.querySelector(s);
const launch=$('#iaChatLaunch'),panel=$('#iaChatPanel'),close=$('#iaChatClose'),thread=$('#iaChatThread'),form=$('#iaChatForm'),input=$('#iaChatInput'),send=$('#iaChatSend'),status=$('#iaChatStatus'),dot=$('#iaChatStatusDot');
let ready=false,checked=false,busy=false,history=[],requestAbort=null,started=false;
function setStatus(text,ok){status.textContent=text;dot.classList.toggle('ia-chat-connected',Boolean(ok));}
function append(author,text,opts={}){
 const row=document.createElement('div');row.className='ia-chat-row '+(author==='user'?'user':'assistant');
 const inner=document.createElement('div');inner.className='ia-chat-response';
 if(author!=='user'){const label=document.createElement('div');label.className='ia-chat-author';label.textContent=opts.system?'INFORMATION / SERVICE':'IAgile / IA GÉNÉRATIVE';inner.append(label);}
 const bubble=document.createElement('div');bubble.className='ia-chat-bubble';bubble.textContent=text;inner.append(bubble);
 if(opts.suggest?.length){const chips=document.createElement('div');chips.className='ia-chat-chipline';opts.suggest.slice(0,4).forEach(q=>{const b=document.createElement('button');b.className='ia-chat-chip';b.type='button';b.textContent=q;b.addEventListener('click',()=>ask(q));chips.append(b)});inner.append(chips);}
 if(opts.links){const links=document.createElement('div');links.className='ia-chat-links';paths.forEach(p=>{const a=document.createElement('a');a.className='ia-chat-link';a.href=prefix+p[1];a.textContent=p[0]+' ↗';links.append(a)});inner.append(links);}
 row.append(inner);thread.append(row);thread.scrollTop=thread.scrollHeight;while(thread.children.length>40)thread.firstElementChild?.remove();return row;
}
function errorText(message){append('assistant',message,{system:true,links:!ready});}
function busyState(b){busy=b;send.disabled=b;input.disabled=b;send.textContent=b?'···':'↗';shell.classList.toggle('ia-chat-busy',b);}
async function testConnection(){
 if(checked)return ready;
 checked=true;
 if(!endpoint){setStatus('MOTEUR IA NON CONNECTÉ',false);return false;}
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
 try{const r=await fetch(endpoint,{method:'GET',signal:controller.signal,cache:'no-store'});const data=await r.json();ready=r.ok&&data.ready===true&&data.generative===true;}
 catch{ready=false;} finally{clearTimeout(timer)}
 setStatus(ready?'IA GÉNÉRATIVE CONNECTÉE':'MOTEUR IA INDISPONIBLE',ready);
 return ready;
}
async function ask(q){
 const text=String(q||'').trim();if(!text||busy)return;
 append('user',text);input.value='';input.style.height='auto';
 if(!await testConnection()){errorText('La connexion au modèle IA n’est pas encore activée. Les réponses automatiques ont été retirées : je ne vais pas vous présenter une réponse prédéfinie comme si elle venait d’une IA.');return;}
 busyState(true);const previous=history.slice(-10), controller=new AbortController();requestAbort=controller;
 const timeout=setTimeout(()=>controller.abort(),23000);const typing=append('assistant','Je prépare une réponse adaptée à votre question…',{system:true});
 try{
   const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:previous,page:location.pathname}),signal:controller.signal});
   const data=await r.json().catch(()=>({}));
   typing.remove();
   if(!r.ok||typeof data.answer!=='string'){errorText(data.error||'Le moteur IA rencontre un problème temporaire.');return;}
   const answer=data.answer.trim();if(!answer){errorText('Le modèle n’a pas produit de réponse exploitable.');return;}
   append('assistant',answer,{links:true});history.push({role:'user',content:text},{role:'assistant',content:answer});history=history.slice(-12);
 }catch(err){typing.remove();errorText(err?.name==='AbortError'?'Le modèle met trop de temps à répondre. Réessayez.':'Connexion impossible avec le moteur IA.');}
 finally{clearTimeout(timeout);requestAbort=null;busyState(false);input.focus();}
}
async function open(){panel.hidden=false;launch.hidden=true;launch.setAttribute('aria-expanded','true');
 if(!started){started=true;append('assistant',context?`Vous explorez la formation « ${context} ». Expliquez-moi votre projet ou votre question, et je vous répondrai en tenant compte du programme.`:'Bonjour. Décrivez-moi ce que vous aimeriez apprendre ou réaliser avec l’IA. Je pourrai vous orienter vers le bon parcours.',{system:true,suggest:samplePrompts});
 const ok=await testConnection();if(!ok)errorText('Le service de génération n’est pas encore configuré. Vous pouvez découvrir les quatre programmes, mais aucune réponse ne sera simulée.',true);
 }input.focus();}
function shut(){panel.hidden=true;launch.hidden=false;launch.setAttribute('aria-expanded','false');launch.focus()}
function reset(){requestAbort?.abort();thread.replaceChildren();history=[];started=false;checked=false;ready=false;busyState(false);setStatus('VÉRIFICATION DU SERVICE…',false);open();}
$('#iaChatReset').addEventListener('click',reset);launch.addEventListener('click',open);close.addEventListener('click',shut);
document.querySelectorAll('[data-open-iagile-chat]').forEach(b=>b.addEventListener('click',open));
form.addEventListener('submit',e=>{e.preventDefault();ask(input.value)});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input.value)}else if(e.key==='Escape')shut();});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(96,input.scrollHeight)+'px'});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)shut()});
window.IAgileAssistant={open,close:shut,ask,reset,isGenerative:true,get connected(){return ready}};
})();
