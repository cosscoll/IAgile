import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import {unzipSync} from 'https://esm.sh/fflate@0.8.2';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './config.js';

const $=id=>document.getElementById(id);
const db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const BUCKET='iagile-course-files';
const COURSE='processus';
const PATH_PREFIX=COURSE+'/datasets/';
const MAX_ZIP_BYTES=100000;
const MAX_FILE_BYTES=30000;
const MAX_TOTAL_BYTES=250000;
const encoder=new TextEncoder();
const decoder=new TextDecoder('utf-8',{fatal:true});
const info=text=>{$('status').textContent=text||'';};
let currentUser=null;
let authorized=false;
let staged=null;
let sessionGeneration=0;

const sha256=async bytes=>{
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
};
const messageError=error=>error instanceof Error?error.message:'Erreur inattendue';

function clearStage(){
  staged=null;
  $('package').value='';
  $('upload').disabled=true;
  $('files').replaceChildren();
}
function showAccess(value){
  authorized=value;
  $('auth').hidden=value;
  $('importer').hidden=!value;
  $('signout').hidden=!currentUser;
  $('identity').textContent=currentUser?.email||'';
  if(!value)clearStage();
}

async function authenticate(){
  const generation=++sessionGeneration;
  clearStage();
  const {data,error}=await db.auth.getUser();
  if(generation!==sessionGeneration)return;
  currentUser=error?null:data?.user||null;
  if(!currentUser){showAccess(false);return;}
  const [{data:profile,error:profileError},{data:assignments,error:assignmentError}]=await Promise.all([
    db.from('academy_profiles').select('account_status').eq('user_id',currentUser.id).maybeSingle(),
    db.from('academy_instructor_courses').select('course_slug').eq('instructor_id',currentUser.id).eq('course_slug',COURSE)
  ]);
  if(generation!==sessionGeneration)return;
  if(profileError||assignmentError||profile?.account_status!=='active'||!assignments?.length){
    showAccess(false);
    info('Ce compte ne dispose pas des droits formateur nécessaires pour ce parcours.');
    return;
  }
  showAccess(true);
  info('Droits formateur vérifiés. Sélectionnez une archive pour poursuivre.');
}

async function validateZip(file,remoteMetadata){
  if(!file||file.size===0||file.size>MAX_ZIP_BYTES)
    throw Error('Archive absente ou trop volumineuse (limite 100 Ko).');
  // Inspect ZIP central-directory metadata BEFORE decompressing any entry.
  // This limits accidental huge archives and trivial decompression bombs.
  let entriesSeen=0;
  let advertisedBytes=0;
  const all=unzipSync(new Uint8Array(await file.arrayBuffer()),{
    filter(entry){
      entriesSeen++;
      if(entriesSeen>15)throw Error('Archive : trop de fichiers.');
      const allowed=entry.name==='manifest.json'||entry.name==='README.md'||
        /^datasets\\/[A-Z0-9-]+\\.(md|csv)$/.test(entry.name);
      if(!allowed)throw Error('Fichier inattendu ou chemin dangereux dans l’archive.');
      if(!Number.isSafeInteger(entry.originalSize)||
         entry.originalSize>MAX_FILE_BYTES||
         entry.originalSize<0)throw Error('Fichier ZIP annoncé trop volumineux.');
      advertisedBytes+=entry.originalSize;
      if(advertisedBytes>MAX_TOTAL_BYTES)
        throw Error('Taille totale décompressée excessive.');
      return entry.name!=='README.md';
    }
  });
  if(!all['manifest.json'])throw Error('Manifeste JSON absent.');
  const manifest=JSON.parse(decoder.decode(all['manifest.json']));
  if(manifest.course_slug!==COURSE||manifest.status!=='draft_unpublished'||manifest.version!=='0.1')
    throw Error('Version ou statut du pack inattendu.');
  if(!Array.isArray(manifest.files)||manifest.files.length!==12||remoteMetadata.length!==12)
    throw Error('Douze ressources et leurs métadonnées sont obligatoires.');
  const entries=Object.keys(all).filter(k=>k.startsWith('datasets/'));
  if(entries.length!==12)throw Error('L’archive contient des fichiers de cours non attendus.');
  const records=new Map(remoteMetadata.map(x=>[x.storage_path,x]));
  const seen=new Set();
  const prepared=[];
  let total=0;
  for(const item of manifest.files){
    const rel=item.file;
    const path=item.private_storage_path;
    if(typeof rel!=='string'||!/^datasets\/[A-Z0-9-]+\.(md|csv)$/.test(rel)
      ||path!==COURSE+'/'+rel||seen.has(path)||!all[rel]){
      throw Error('Chemin de fichier non conforme ou dupliqué.');
    }
    seen.add(path);
    const bytes=all[rel];
    total+=bytes.byteLength;
    if(bytes.byteLength<1||bytes.byteLength>MAX_FILE_BYTES||total>MAX_TOTAL_BYTES)
      throw Error('Fichier décompressé trop volumineux.');
    const record=records.get(path);
    if(!record||record.published||record.source_version!=='v0.1'
      ||record.content_bytes!==bytes.byteLength
      ||item.bytes!==bytes.byteLength||item.sha256!==record.content_sha256){
      throw Error('Les métadonnées Supabase ne correspondent pas à l’archive.');
    }
    if(await sha256(bytes)!==record.content_sha256)
      throw Error('Contrôle d’intégrité SHA-256 incorrect : '+rel);
    prepared.push({path,bytes,mime:rel.endsWith('.csv')?'text/csv':'text/markdown',
      digest:record.content_sha256});
  }
  if(prepared.length!==12||prepared.some(x=>!records.has(x.path)))
    throw Error('Des fichiers de cours sont absents du manifeste.');
  return prepared;
}

async function verify(){
  staged=null;
  $('upload').disabled=true;
  $('files').replaceChildren();
  const file=$('package').files?.[0];
  if(!file){info('Sélectionnez une archive .zip privée.');return;}
  $('verify').disabled=true;
  const generation=sessionGeneration;
  info('Vérification locale des empreintes et des autorisations…');
  try{
    const {data,error}=await db.from('academy_course_assets')
      .select('storage_path,content_sha256,content_bytes,source_version,published')
      .eq('course_slug',COURSE).order('storage_path');
    if(generation!==sessionGeneration||!authorized)return;
    if(error)throw Error('Impossible de lire le manifeste des ressources avec vos droits.');
    const files=await validateZip(file,data||[]);
    if(generation!==sessionGeneration||!authorized)return;
    staged=files;
    for(const asset of files){
      const item=document.createElement('li');
      item.textContent=asset.path.slice(PATH_PREFIX.length)+' — SHA-256 vérifié';
      $('files').append(item);
    }
    $('upload').disabled=false;
    info('12 fichiers vérifiés. Vous pouvez déclencher l’import privé.');
  }catch(error){info('Vérification refusée : '+messageError(error));}
  finally{$('verify').disabled=false;}
}

async function upload(){
  if(!authorized||!currentUser||!staged||staged.length!==12)return;
  $('verify').disabled=true;$('upload').disabled=true;$('package').disabled=true;
  const generation=sessionGeneration;
  const store=db.storage.from(BUCKET);
  let verified=0,uploaded=0;
  info('Transfert privé en cours. Ne fermez pas cette page.');
  try{
    for(const asset of staged){
      if(generation!==sessionGeneration||!authorized)throw Error('Session modifiée : arrêt.');
      const {data:existing,error:readError}=await store.download(asset.path);
      if(!readError&&existing){
        if(await sha256(await existing.arrayBuffer())!==asset.digest)
          throw Error('Un fichier existant est différent : '+asset.path);
      }else{
        // Only INSERT is granted for a matching asset path. Never overwrite.
        const {error}=await store.upload(asset.path,new Blob([asset.bytes],{type:asset.mime}),
          {contentType:asset.mime,upsert:false});
        if(error)throw Error('Envoi refusé pour '+asset.path+' : '+error.message);
        uploaded++;
      }
      const {data:remote,error:verifyError}=await store.download(asset.path);
      if(verifyError||!remote||await sha256(await remote.arrayBuffer())!==asset.digest)
        throw Error('Vérification distante impossible pour '+asset.path);
      verified++;
      info('Supports privés vérifiés : '+verified+'/12.');
    }
    info('Import privé terminé : '+verified+'/12 fichiers vérifiés, '+uploaded+' nouvel(aux) objet(s). Aucun cours publié.');
    staged=null;
    $('files').replaceChildren();
    $('upload').disabled=true;
  }catch(error){info('Import interrompu après '+verified+' fichier(s) vérifié(s) : '+messageError(error));}
  finally{$('package').disabled=false;$('verify').disabled=false;}
}

$('loginForm').addEventListener('submit',async event=>{
  event.preventDefault();$('login').disabled=true;
  info('Connexion formateur…');
  const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  $('password').value='';$('login').disabled=false;
  if(error){info('Connexion impossible. Vérifiez vos identifiants.');return;}
  await authenticate();
});
$('signout').addEventListener('click',async()=>{
  ++sessionGeneration;currentUser=null;showAccess(false);
  const {error}=await db.auth.signOut();
  info(error?'Fin de session distante non confirmée.':'Déconnexion effectuée.');
});
$('package').addEventListener('change',()=>{staged=null;$('upload').disabled=true;$('files').replaceChildren();});
$('verify').addEventListener('click',verify);
$('upload').addEventListener('click',upload);
db.auth.onAuthStateChange(event=>{
  if(event==='SIGNED_OUT'){++sessionGeneration;currentUser=null;showAccess(false);}
});
authenticate().catch(()=>{currentUser=null;showAccess(false);info('Service temporairement indisponible.');});
