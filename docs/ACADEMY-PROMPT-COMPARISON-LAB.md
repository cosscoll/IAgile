# IAgile — Comparateur A/B de prompts (notation manuelle et preuves)

**Statut : ressource de méthodologie exécutable, sans modèle connecté ni évaluation automatique du contenu.**
Le comparateur ne publie aucun des 100 prompts premium IAgile. Il traite **uniquement** les fiches de notes que le formateur ou l'apprenant lui remet.

## Principe

Évaluer deux formulations A et B sur **au moins trois cas identiques**. Les cas appariés doivent avoir le même `input_sha256` et le même `model_id`. Sinon, la comparaison est refusée. Cet outil ne calcule pas les empreintes à partir de documents privés : le préparateur des essais doit d'abord les produire et les conserver dans l'espace apprenant autorisé.

Une notation **humaine** sur quatre critères de 0 à 2 : exactitude, vérifiabilité/provenance, clarté, sécurité. Total maximum 8 par réponse. Une note de sécurité égale à 0 produit un avertissement bloquant, même si le prompt B a obtenu plus de points en moyenne. Les valeurs sont des observations déclarées, pas des jugements du programme sur une réponse réelle.

## Procédure

1. Choisir trois questions fictives suffisamment diverses, fixer le même modèle et des paramètres identiques pour A et B.
2. Exécuter les prompts dans l'outil de l'apprenant **avec les autorisations requises**, hors de ce comparateur ; conserver la version du modèle et le même texte d'entrée.
3. Attribuer les quatre notes avant de consulter le résultat agrégé, avec une justification sans donnée personnelle.
4. Remplir un JSON **privé**, au format ci-dessous, en ajoutant A et B pour chaque cas.
5. Exécuter la comparaison ; revoir chaque cas où la sécurité vaut 0, même si la moyenne progresse.
6. Réaliser une épreuve de transfert sur de nouveaux exemples, sans recopier le prompt corrigé du premier exercice.

## Exemple entièrement synthétique

```json
[
  {"case_id":"CASE-TEST-1","variant":"A","input_sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","model_id":"SYNTHETIC-MODEL-V1","scores":{"accuracy":1,"verification":0,"clarity":1,"safety":2},"note":"Notation fictive pour montrer la méthode, pas une mesure réelle."},
  {"case_id":"CASE-TEST-1","variant":"B","input_sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","model_id":"SYNTHETIC-MODEL-V1","scores":{"accuracy":2,"verification":1,"clarity":2,"safety":2},"note":"Notation fictive pour montrer la méthode, pas une mesure réelle."}
]
```

L'exemple ci-dessus comporte **un seul cas** : il est volontairement incomplet et ne passera pas la validation, qui exige trois paires. Pour un essai complet fictif, utiliser les tests automatisés.

```bash
node tests/academy-prompt-compare.test.mjs
node scripts/academy-prompt-compare.mjs /chemin-prive/notes-A-B.json
```

## Limites

- `modelCalls:0` : le programme ne sait pas si un modèle IA a été appelé.
- `automaticGrading:false` : les notes sont fournies par des personnes, ni interprétées ni corrigées par IA.
- Même si A et B utilisent des chaînes de hachage identiques, le script **ne prouve pas** à lui seul que les entrées étaient réellement identiques.
- Une moyenne de 7/8 sur trois cas ne démontre ni fiabilité en production, ni supériorité commerciale d'une formation.
- Ne jamais placer de réponses réelles, données clients, copies d'élèves ou prompts premium dans le dépôt GitHub public.

## Résultat attendu

L'apprenant identifie un problème concret de formulation, modifie son prompt, observe le résultat sur les mêmes cas et documente ce qui reste incertain. Il apprend à **vérifier** plutôt qu'à collectionner les prompts.

Suivi : [GitHub #57](https://github.com/cosscoll/IAgile/issues/57). La mise à disposition pédagogique finale dépend du parcours privé approuvé et des droits d'inscription.
