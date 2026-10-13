// Local-only Academy prerequisites audit. This never grants access or reads learner data.
// Every branch uses fictitious inputs and explicit uncertainty. No remote API requests.
export const COURSES=Object.freeze({
  processus:'Processus du quotidien',
  automatisation:'Automatisation',
  agents:'Agents IA',
  'sites-3d':'Sites web 3D'
});
const result=(status,title,reason,steps)=>({status,title,reason,steps:Object.freeze(steps)});
export function assessPrerequisites(input={}){
  const {course,privacy='synthetic',toolAccess='none',budget='unknown',
    task='repeatable',sample='',webgl=false}=input;
  if(!Object.hasOwn(COURSES,course))return result('blocked','Parcours à choisir',
    'Sélectionnez une formation pour obtenir un diagnostic.', ['Choisir un parcours existant.']);
  if(privacy==='real-sensitive')return result('blocked','Données non autorisées',
    'Ne transmettez pas de données personnelles, confidentielles ou de clients à un outil non approuvé.',
    ['Créer un exemple fictif sans identifiants réels.','Vérifier la politique de votre organisation avant usage.']);
  if(privacy!=='synthetic')return result('prepare','Autorisation à confirmer',
    'Nous ne savons pas si vos données peuvent être traitées ici.',
    ['Choisir des données fictives.','Faire valider le canal et les autorisations si des données réelles sont nécessaires.']);
  if(course==='processus'){
    if(task==='one-off')return result('alternative','Méthode sans IA conseillée',
      'Une tâche simple et ponctuelle ne justifie pas forcément un assistant.',
      ['Commencer par une checklist manuelle.','Comparer qualité et temps de vérification avant automatisation.']);
    return result('ready','Prêt pour le premier exercice fictif',
      'Aucun compte payant ni API externe n’est nécessaire pour un diagnostic de processus.',
      ['Choisir une tâche répétitive fictive.','Noter faits, inconnues et une vérification indépendante.']);
  }
  if(course==='automatisation'){
    let parsed;
    try{parsed=JSON.parse(String(sample||''));}catch{return result('prepare','JSON de départ à corriger',
      'La donnée saisie ne peut pas être analysée comme JSON : tester le format avant le workflow.',
      ['Utiliser un exemple JSON valide avec id et statut.','Tester ensuite un cas de doublon et un refus de faux succès.']);}
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||
       typeof parsed.id!=='string'||!parsed.id.trim()||
       typeof parsed.statut!=='string'||!parsed.statut.trim())
      return result('prepare','Contrat de données incomplet',
        'Il faut un objet avec des champs texte id et statut non vides.',
        ['Vérifier le schéma d’entrée.','Rejouer deux fois le même identifiant avec une destination fictive.']);
    return result('ready','Simulation d’automatisation possible',
      'Le JSON est conforme à cet exemple fictif. Cela ne prouve ni un workflow n8n actif ni une écriture distante.',
      ['Définir l’effet métier attendu.','Simuler une panne 504 et le contrôle des doublons.']);
  }
  if(course==='agents'){
    if(toolAccess==='live'&&budget!=='confirmed')
      return result('prepare','Budget et permissions à vérifier',
        'Ne lancez aucun agent connecté à un outil réel sans limites de coût et droits connus.',
        ['Définir quotas, identité, outils lecture/écriture et arrêt.','Commencer par le scénario fictif sans clé API.']);
    if(toolAccess==='live')
      return result('prepare','Test réel non vérifié',
        'Cette page ne peut ni vérifier vos autorisations serveur ni garantir le coût d’un agent réel.',
        ['Vérifier les permissions dans l’application.','Simuler dix refus avant toute action externe.']);
    return result('alternative','Démarrer sans clé API',
      'Un contrat d’agent et des tests de refus peuvent être conçus avec un simulateur fictif.',
      ['Définir ce que l’agent peut lire et écrire.','Tester une demande interdite et la validation humaine.']);
  }
  if(!webgl)return result('alternative','Version HTML sans WebGL',
    'Ce navigateur ne démontre pas la disponibilité de WebGL ; le contenu doit rester utilisable sans GPU.',
    ['Créer d’abord la navigation et le contenu en HTML.','Tester ensuite la scène 3D sur un appareil compatible.']);
  return result('ready','Navigateur compatible pour un premier essai local',
    'La création d’un contexte WebGL a réussi ici ; performance, accessibilité et rendu mobile restent non testés.',
    ['Créer une scène légère avec fallback HTML.','Mesurer sur mobile et en mouvement réduit avant publication.']);
}
