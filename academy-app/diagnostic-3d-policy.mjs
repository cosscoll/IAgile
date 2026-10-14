// Real browser capability detection only. Never infer performance without measured frames.
export function sample3DEnvironment({width,height,motion,webgl2,webgl1}={}){
 const w=Number(width),h=Number(height);
 const hasViewport=Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0;
 const backend=webgl2?'webgl2':webgl1?'webgl1':'html';
 return {backend,
  smallViewport:hasViewport?w<480:null,
  aspect:hasViewport?Math.round((w/h)*100)/100:null,
  motionReduced:motion===true,
  navigation:'HTML keyboard links required in all cases',
  verdict:backend==='html'?'fallback':'device-check-required',
  tested:{context:backend!=='html',frames:false,memory:false,device:false,accessibility:false}};
}
export function safeChecklist(report){
 const items=[
  'Le contenu essentiel doit rester lisible et accessible sans WebGL.',
  'Les liens de navigation doivent fonctionner au clavier et annoncer le focus.',
  report.motionReduced?'Désactiver les animations non essentielles (mouvement réduit activé).':
    'Offrir une option pour réduire les mouvements même si le système ne le demande pas.',
  report.smallViewport===true?'Contrôler les débordements à cette largeur mobile.':
    'Valider séparément un vrai téléphone, même si la fenêtre semble assez large.',
  report.backend==='html'?'Lancer le contenu HTML alternatif, pas une scène 3D vide.':
    'Le contexte graphique existe mais cela ne prouve pas les FPS, la fluidité ou la stabilité mémoire.',
  'Ne déclarer PASS pour les performances qu’après mesure réelle sur l’appareil cible.'
 ];
 return items;
}
