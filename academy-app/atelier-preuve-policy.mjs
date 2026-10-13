// Fictitious training fixture; no premium syllabus or genuine learner evaluation.
export const CASES=Object.freeze({
  rendezvous:Object.freeze({
    title:'Demande de rendez-vous',
    context:'Une personne demande de confirmer une réunion à 15 h. Vous n’avez accès à aucun calendrier.',
    options:Object.freeze([
      {id:'A',text:'Votre rendez-vous est confirmé à 15 h.'},
      {id:'B',text:'Je dois vérifier le calendrier avant de confirmer ce créneau.'}
    ]),
    risks:Object.freeze([
      {id:'unconfirmed',text:'La disponibilité n’est pas vérifiée.'},
      {id:'tone',text:'Le ton du message est trop formel.'},
      {id:'cost',text:'La réponse ne contient aucun tarif.'}
    ]),
    safest:'B',reason:'unconfirmed',
    feedback:'Sans calendrier, confirmer une disponibilité serait une invention. La bonne réponse préserve une étape de vérification humaine.'
  }),
  remboursement:Object.freeze({
    title:'Épreuve de transfert : statut de remboursement',
    context:'Une cliente demande si son remboursement a été exécuté. Vous ne disposez ni du dossier ni du statut du paiement.',
    options:Object.freeze([
      {id:'A',text:'Le remboursement a été effectué ; vous le recevrez sous peu.'},
      {id:'B',text:'Je ne peux pas confirmer ce statut sans vérifier le dossier auprès du service responsable.'}
    ]),
    risks:Object.freeze([
      {id:'unconfirmed',text:'L’effet métier n’a pas été confirmé par le système source.'},
      {id:'style',text:'Le message n’est pas assez commercial.'},
      {id:'speed',text:'La réponse est trop lente à générer.'}
    ]),
    safest:'B',reason:'unconfirmed',
    feedback:'L’absence de preuve de paiement ou de remboursement interdit de confirmer une opération comme réalisée.'
  })
});
export function verifyEvidenceChoice({caseId,optionId,reasonId,explanation}={}){
  const item=CASES[caseId];
  if(!item)return {status:'invalid',text:'Choisissez un exercice existant.',correct:false};
  if(!item.options.some(x=>x.id===optionId)||!item.risks.some(x=>x.id===reasonId))
    return {status:'incomplete',text:'Sélectionnez une réponse et justifiez son risque.',correct:false};
  if(typeof explanation!=='string'||explanation.trim().length<20)
    return {status:'incomplete',text:'Expliquez votre décision sur au moins 20 caractères.',correct:false};
  const correct=optionId===item.safest&&reasonId===item.reason;
  return {
    status:correct?'consistent':'review',
    correct,
    text:correct?
      'Le choix et le risque correspondent à la situation fictive. Votre justification personnelle n’a pas été évaluée automatiquement.':
      'Le choix ou le risque ne correspond pas à la preuve disponible. Relisez la situation et ce qui peut réellement être confirmé.',
    explanation:item.feedback
  };
}
