/* IAgile Academy — V6 premium prompt library. Code only; never embed paid text or secrets. */
(() => {
  'use strict';
  const allowedCourses = new Set(['processus','automatisation','agents','sites-3d']);
  const codePattern = /^(?:P|A|G|W)\d{2}$/;
  const maxRows = 100;
  function clear() {
    const area = document.getElementById('v6-prompts');
    const list = document.getElementById('v6-prompts-list');
    if (list) list.replaceChildren();
    if (area) area.hidden = true;
  }
  async function load(client, course, isCurrent) {
    // A stale request must never erase a newer authorized view.
    if (!client || !allowedCourses.has(course) || typeof isCurrent !== 'function' || !isCurrent()) return;
    clear();
    const area = document.getElementById('v6-prompts');
    const list = document.getElementById('v6-prompts-list');
    if (!area || !list) return;
    let response;
    try {
      response = await client.from('academy_prompt_library')
        .select('prompt_code,module_index,title,content_markdown')
        .eq('course_slug',course).eq('published',true)
        .order('module_index',{ascending:true}).order('prompt_code',{ascending:true});
    } catch (_) { return; }
    if (!isCurrent() || response?.error || !Array.isArray(response?.data)) return;
    const coursePrefix = {processus:'P',automatisation:'A',agents:'G','sites-3d':'W'}[course];
    const entries = response.data.filter(row => codePattern.test(String(row.prompt_code || '')) &&
      String(row.prompt_code).startsWith(coursePrefix) &&
      Number.isInteger(row.module_index) && row.module_index >= 0 && row.module_index < 200 &&
      typeof row.title === 'string' && typeof row.content_markdown === 'string' &&
      row.content_markdown.length > 0).slice(0,maxRows);
    if (!entries.length) return;
    const filterLabel = document.createElement('label');
    filterLabel.textContent='Chercher un prompt dans cette formation';
    const search = document.createElement('input');
    search.type='search'; search.placeholder='Identifiant, sujet ou compétence';
    search.setAttribute('aria-label','Rechercher dans la bibliothèque de prompts');
    filterLabel.append(search);
    const count = document.createElement('p'); count.setAttribute('role','status');
    const cards = [];
    const collection = document.createElement('div');
    collection.className='v6-prompt-cards';
    for (const row of entries) {
      const card=document.createElement('details');
      card.className='v6-prompt';
      const title=document.createElement('summary');
      title.textContent=String(row.prompt_code)+' — '+row.title+' (module '+(row.module_index+1)+')';
      const body=document.createElement('pre');
      body.className='v6-prompt-content';
      body.style.whiteSpace='pre-wrap';
      body.style.overflowWrap='anywhere';
      body.textContent=row.content_markdown; // Never use innerHTML with lesson/user content.
      card.append(title,body);
      collection.append(card);
      cards.push({card,haystack:(String(row.prompt_code)+' '+row.title+' '+row.content_markdown).toLocaleLowerCase('fr')});
    }
    const apply = () => {
      const term=search.value.trim().toLocaleLowerCase('fr');
      let displayed=0;
      for(const entry of cards){entry.card.hidden=term!==''&&!entry.haystack.includes(term);if(!entry.card.hidden)displayed++;}
      count.textContent=displayed+' prompt(s) sur '+cards.length;
    };
    search.addEventListener('input',apply);
    list.replaceChildren(filterLabel,count,collection);
    apply();
    if (!isCurrent()) { clear(); return; }
    area.hidden=false;
  }
  window.IAgileV6Prompts=Object.freeze({load,clear});
})();