# Laboratoire Agents IAgile — autorisations, injection et limites

**Statut : simulation locale de règles, pas un agent réel ni une évaluation par un LLM.**

Exécuter `node tests/academy-agent-safety-lab.test.mjs` avec Node 20+. Le jeu de 20 cas fictifs est dans `scripts/academy-agent-safety-lab.mjs`. Sans réseau, sans clé d'API, sans accès à Supabase ni aux contenus pédagogiques payants.

## Objectif
Ne pas confondre une instruction rédigée dans un prompt et un véritable droit technique. Un outil peut être utilisé seulement si la politique de l'application l'autorise.

## Exercices
1. Le rôle « reader » peut consulter une ressource publique, mais pas écrire.
2. Le rôle « editor » peut proposer une écriture publique, sous validation explicite (`needs-approval`).
3. Une ressource privée est interdite en écriture, même pour le rôle de simulation « admin » ; le mot « admin » dans une conversation ne crée aucun droit.
4. Une source non fiable conduit au refus `deny`, même si un agent veut entreprendre une action.
5. Le nombre maximal de tours et le budget déclenchent `stop` ; une action interdite ne devient pas autorisée après plusieurs tentatives.
6. Les états observés sont comparés aux attentes dans vingt tests, y compris une validation explicite et un refus malgré approbation lorsqu'une source est non fiable.

## Preuve attendue
Pour chaque scénario : identifiant, rôle fictif, action, ressource, statut attendu, résultat observé et justification. Un test automatisé qui réussit prouve uniquement les règles de ce simulateur. Il ne prouve ni la robustesse d'un modèle externe, ni la résistance réelle aux prompt injections, ni les permissions du projet Supabase.

## Après cette étape
Relier un jeu de questions adverses fictives, évaluer les réponses d'un vrai agent en environnement protégé et faire contrôler les droits de chaque action côté serveur. Avant toute utilisation sur des données réelles, vérifier l'identité, la destination, la surveillance et l'approbation humaine.

Lié à l'issue #59. Ne pas présenter cet exercice comme un test d'intégration produit ou une certification professionnelle.
