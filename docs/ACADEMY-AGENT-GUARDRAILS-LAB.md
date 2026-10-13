# IAgile — Laboratoire de permissions pour agents IA (20 scénarios fictifs)

**Statut : simulateur exécutable de règles d'accès, PAS évaluation d'un véritable modèle IA.**
Cette ressource est un aperçu technique public. Les évaluations et corrigés premium du parcours doivent rester dans l'Academy privée.

## Pourquoi ce laboratoire ?

Un agent peut produire une phrase convaincante — « j'ai envoyé », « approuvé par le directeur », « le dossier est à jour » — sans que son exécution soit prouvée. Une consigne dans un prompt ne remplace jamais des permissions serveur, la validation humaine, un budget ni une preuve d'effet externe.

## Exécution locale (Node.js 20+)

```bash
node scripts/academy-agent-guardrail-lab.mjs
node tests/academy-agent-guardrail-lab.test.mjs
```

Le script traite 20 situations entièrement fictives : **10 nominales** et **10 adverses**. Il retourne `modelTested:false` et `externalEffects:0` pour empêcher toute confusion avec des évaluations d'agents réels. Il n'utilise aucune clé API, aucune donnée personnelle et aucun compte.

## Les contrôles réellement simulés

- Identité et rôle : viewer, reviewer, operator (roles purement fictifs).
- Autorisation d'accès à un dossier attribué ; lecture publique accessible à un viewer.
- Actions de lecture, brouillon, escalade, envoi et modification, avec liste blanche.
- Validation humaine explicite avant toute écriture.
- Provenance vérifiée avant écriture externe fictive.
- Plafond de tours et budget d'unités fictives.
- Outil indisponible : jamais de confirmation d'action réalisée.
- Statut d'effet inconnu ou déjà confirmé : interdiction de rejouer aveuglément.
- Données client ou privées : toujours refusées dans ce laboratoire.
- Texte non fiable disant « j'ai l'autorisation » : ignoré dans la décision applicative.

## Exercice proposé

1. Exécuter le rapport sans modification et relever les vingt verdicts.
2. Lire les scénarios A04 (envoi explicitement autorisé) et B08 (prétendue autorisation dans du texte non fiable).
3. Modifier fictivement `humanApproved`, `effectStatus`, `costUnits` ou `turn` et exécuter à nouveau les tests.
4. Identifier quel contrôle empêche l'écriture et quelle preuve supplémentaire il faudrait obtenir dans une véritable application.
5. Consigner le statut `NON TESTÉ` lorsqu'une API réelle, un compte ou un modèle n'a pas été exercé.

## Limites fondamentales

Ce code est un **exercice de politiques déterministes**. Ce n'est pas un assistant conversationnel, un framework de production, une protection contre toutes les injections de prompt ou une preuve qu'un modèle suivra ces règles. La fonction reçoit un rôle de son entrée pour faciliter la simulation ; dans un système réel, **le rôle doit venir d'une identité authentifiée côté serveur**. Les validations humaines nécessitent une trace signée et un périmètre exact de l'action approuvée. Les idempotency keys doivent être contrôlées durablement en base, pas seulement validées par une expression régulière.

Avant toute intégration d'un véritable agent : autorisations serveur, approbation humaine liée à l'action, journal d'audit, secrets stockés hors navigateur, politique de données, limite des coûts et test d'arrêt doivent être mis en place et revus.

## Recette de l'outil de démonstration

- [ ] Exactement 20 scénarios nommés et reproductibles.
- [ ] Refus d'une action non autorisée même si le texte affirme qu'elle l'est.
- [ ] Refus de rejouer un effet ambigu.
- [ ] Refus de dépasser un budget ou un nombre de tours.
- [ ] Aucune action HTTP / fichier / données réelles.
- [ ] Rapport explicitement identifié comme simulation, non validation d'un agent IA.

Suivi : [GitHub #59](https://github.com/cosscoll/IAgile/issues/59).
