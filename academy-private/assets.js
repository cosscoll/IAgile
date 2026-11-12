// Course files are stored in a private Supabase Storage bucket.
// Never expose a public bucket URL or persist a signed URL in localStorage.
export async function loadCourseAssets({supabase,course,target,message,isCurrent=()=>true}) {
  if(!isCurrent())return;
  target.replaceChildren();
  const {data,error}=await supabase.from('academy_course_assets')
    .select('asset_key,title,storage_path').eq('course_slug',course.slug)
    .eq('published',true).order('asset_key');
  if(!isCurrent())return;
  if(error){target.textContent='Ressources indisponibles pour le moment.';return;}
  if(!data?.length){target.textContent='Aucune ressource téléchargeable pour cette formation.';return;}
  for(const asset of data){
    const card=document.createElement('article');
    card.className='module-card';
    const title=document.createElement('h4');title.textContent=asset.title;
    const button=document.createElement('button');button.type='button';
    button.textContent='Préparer un accès temporaire';
    const destination=document.createElement('div');destination.className='asset-link';
    button.addEventListener('click',async()=>{
      if(!isCurrent())return;
      destination.replaceChildren();
      button.disabled=true;message('Vérification des droits d’accès au fichier…');
      const {data:link,error:linkError}=await supabase.storage.from('iagile-course-files')
        .createSignedUrl(asset.storage_path,60);
      if(!isCurrent())return;
      button.disabled=false;
      if(linkError||!link?.signedUrl){message('Accès au fichier refusé ou indisponible.');return;}
      const anchor=document.createElement('a');
      anchor.href=link.signedUrl;
      anchor.target='_blank';
      anchor.rel='noopener noreferrer';
      anchor.textContent='Ouvrir le fichier (lien valable une minute)';
      destination.append(anchor);
      message('Le lien temporaire est prêt. Il expirera automatiquement.');
    });
    card.append(title,button,destination);target.append(card);
  }
}
