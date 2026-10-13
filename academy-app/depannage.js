import {findTroubleshooting} from './depannage-data.mjs';
const $=id=>document.getElementById(id);
const course=$('course-filter'),search=$('query-filter'),list=$('troubleshoot-results'),state=$('search-status');
const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;node.textContent=text;return node;};
function render(){
 const matches=findTroubleshooting({course:course.value,query:search.value});
 list.replaceChildren();
 state.textContent=matches.length+' fiche(s) trouvée(s).';
 if(!matches.length){
   list.append(make('p','empty-state','Aucune correspondance. Essayez un mot plus simple ou toutes les formations.'));
   return;
 }
 for(const item of matches){
   const article=make('article','troubleshoot-card','');
   const tag=make('p','troubleshoot-course',item.course+' / '+item.id);
   const title=make('h3','',item.title);
   article.append(tag,title,make('p','troubleshoot-symptom',item.symptom));
   const details=[['Vérification',item.check],['Piste de résolution',item.fix],
     ['Preuve attendue',item.evidence]];
   for(const [label,value] of details){
     const section=make('section','troubleshoot-detail','');
     section.append(make('h4','',label),make('p','',value));
     article.append(section);
   }
   article.append(make('p','troubleshoot-warning','Conseil générique, à adapter et à tester dans votre environnement.'));
   list.append(article);
 }
}
search.addEventListener('input',render);
course.addEventListener('change',render);
render();
