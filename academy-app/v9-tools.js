/* IAgile Academy — viewer of approved external learning links (no paid data). */
(() => {
  'use strict';
  const courses = Object.freeze({processus:8, automatisation:10, agents:11, 'sites-3d':14});
  const idPattern = /^[GR]\d{3}$/;
  function clear() {
    const area=document.getElementById('v9-tools');
    const list=document.getElementById('v9-tools-list');
    if(list) list.replaceChildren();
    if(area) area.hidden=true;
  }
  async function load(client,course,isCurrent) {
    if(!client || !Object.hasOwn(courses,course) || typeof isCurrent!=='function' || !isCurrent())return;
    clear();
    const area=document.getElementById('v9-tools');
    const list=document.getElementById('v9-tools-list');
    if(!area || !list)return;
    let result;
    try {
      result=await client.from('academy_external_learning_resources')
        .select('course_slug,module_index,tool_id,title,source_url,short_description,priority,license_status,archived,approved_for_course,published')
        .eq('course_slug',course).eq('published',true).eq('approved_for_course',true)
        .eq('archived',false).order('module_index',{ascending:true}).limit(200);
    } catch (_error) {return;}
    if(!isCurrent() || result?.error || !Array.isArray(result?.data))return;
    const entries=result.data.filter(x=>x && x.course_slug===course &&
      idPattern.test(String(x.tool_id||'')) && Number.isInteger(x.module_index) &&
      x.module_index>=0 && x.module_index<=courses[course] &&
      x.published===true && x.approved_for_course===true && x.archived===false &&
      typeof x.title==='string' && typeof x.short_description==='string' &&
      typeof x.source_url==='string' && /^https:\/\//i.test(x.source_url) &&
      ['P0','P1','P2'].includes(x.priority)).slice(0,160);
    if(!entries.length)return;
    const label=document.createElement('label');label.textContent='Chercher dans les ressources complémentaires';
    const search=document.createElement('input');search.type='search';search.placeholder='Compétence, outil ou module';
    search.setAttribute('aria-label','Rechercher un outil de formation');label.append(search);
    const selectLabel=document.createElement('label');selectLabel.textContent='Priorité';
    const choice=document.createElement('select');choice.setAttribute('aria-label','Filtrer par priorité');
    for(const [name,value] of [['À découvrir (P0)','P0'],['Toutes les ressources',''],['Compléments (P1)','P1'],['Veille (P2)','P2']]) {
      const option=document.createElement('option');option.value=value;option.textContent=name;choice.append(option);
    }
    choice.value='P0';selectLabel.append(choice);
    const count=document.createElement('p');count.setAttribute('role','status');
    const box=document.createElement('div');box.className='v9-external-resources';
    const refs=[];
    for(const x of entries){
      const item=document.createElement('article');item.className='course-resource-row';
      const name=document.createElement('h3');name.textContent=x.title+' · module '+(x.module_index+1);
      const description=document.createElement('p');description.textContent=x.short_description;
      const warning=document.createElement('p');warning.textContent='Priorité '+x.priority+' · Licence : '+x.license_status+' · Installation chez l’éditeur, non incluse.';
      const link=document.createElement('a');link.textContent='Consulter la source officielle ↗';
      link.href=x.source_url;link.rel='noopener noreferrer';link.target='_blank';
      item.append(name,description,warning,link);box.append(item);
      refs.push({item,priority:x.priority,search:(x.title+' '+x.short_description+' '+x.tool_id).toLocaleLowerCase('fr')});
    }
    const apply=()=>{let n=0;const q=search.value.trim().toLocaleLowerCase('fr');for(const r of refs){
      r.item.hidden=(choice.value!==''&&r.priority!==choice.value)||(q!==''&&!r.search.includes(q));
      if(!r.item.hidden)n++;}
      count.textContent=n+' sur '+refs.length+' références complémentaires';
    };
    search.addEventListener('input',apply);choice.addEventListener('change',apply);
    list.replaceChildren(label,selectLabel,count,box);apply();
    if(!isCurrent()){clear();return;}
    area.hidden=false;
  }
  window.IAgileV9Tools=Object.freeze({load,clear});
})();