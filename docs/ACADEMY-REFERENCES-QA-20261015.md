# IAgile Academy — contrôle de la bibliothèque d'outils (15 octobre 2026)

## État vérifié
- Supabase : projet `daabfmdlgcwcykevvrcm` actif.
- 4 parcours ; 47 modules enregistrés, tous non publiés.
- 283 associations ressources ↔ modules ; 261 identifiants d'outils distincts ; 5 lignes archivées.
- Aucune ressource n'est approuvée ou publiée. Aucun accès commercial ouvert.
- Licences après le contrôle du 15/10 : 53 références « CONTRÔLE CIBLÉ », 227 « NON CONTRÔLÉE », 3 « PARTIEL / À REVOIR ».
- La seule présence d'une URL sous HTTPS ne prouve ni son fonctionnement actuel ni un droit de redistribution.

## Intégration technique livrée
- `academy-app/app.js` charge `academy_external_learning_resources` uniquement après vérification côté client du compte, du profil, de l'inscription et de la publication de la formation. **Le contrôle effectif reste Supabase RLS.**
- Les requêtes demandent `approved_for_course=true`, `published=true`, `archived=false` et le `course_slug`.
- L'interface refiltre côté client, rejette les protocoles non HTTPS et n'utilise jamais `innerHTML` pour les contenus tiers.
- Les quatre pages de cours ont une section privée dédiée ; les références sont groupées par module et leurs liens portent `noopener noreferrer nofollow`.
- `tests/academy-access.test.mjs` et `tests/academy-shell.test.mjs` couvrent désormais le filtrage attendu. Une simulation directement sur `app.js` a vérifié un enregistrement approuvé, le rejet des URL non HTTPS, le rejet des lignes non approuvées, le refus sans inscription et le comportement fermé après erreur API.
- **Attention :** ces simulations ne remplacent pas un test d'accès avec deux vrais comptes Supabase.

## Correction de paquet
- `academy-app/deployment-files.json` et le test du manifeste incluent maintenant `v6-prompts.js`, qui était référencé par les pages privées mais absent du manifeste.
- Déploiement Vercel staging : `dpl_68GrGAydE9A5F4bHWBgH1SG4TfAt`, état `READY`, Git SHA `a910f50d614bfef230603c5730ce1e1bdc8df053`.
- Projet : `iagile-academy-staging`, domaine `https://iagile-academy-staging.vercel.app/` ; SSO Vercel toujours activé.
- La tentative de validation HTTP des routes protégées n'a pas réussi avec l'autorisation Vercel courante ; `READY` n'est pas une preuve de navigation fonctionnelle.

## Premières licences vérifiées depuis les dépôts officiels
| ID | Logiciel | Licence observée | Caveat |
| --- | --- | --- | --- |
| G042 | Mockoon | MIT — https://github.com/mockoon/mockoon/blob/main/LICENSE.md | Conserver licence et copyright en cas de redistribution ; aucun code inclus |
| G083 | WireMock | Apache-2.0 — https://github.com/wiremock/wiremock/blob/master/LICENSE.txt | Respecter licences et notices en cas de redistribution ; aucun code inclus |
| G141 | Mastra | Cœur Apache-2.0, composants `ee/` soumis à la licence Enterprise — https://github.com/mastra-ai/mastra/blob/main/LICENSE.md | Ne pas incorporer les parties Enterprise à un produit vendu sans droits adaptés |

Quatre associations ont été mises à jour dans Supabase : deux Mockoon, une WireMock, une Mastra. **Aucune approbation ni publication automatique.**

## Contrôles de sécurité et facturation
- Les politiques RLS de la bibliothèque limitent les lectures des apprenants aux références approuvées, publiées et associées à une formation achetée/activée ; les formateurs ont des droits spécifiques.
- Contraintes SQL déjà appliquées : impossible de publier une référence non approuvée ou archivée.
- La fonction `academy_billing.record_checkout_payment` est exécutable par `service_role`, pas par `anon` ni `authenticated`.
- Quatre tables historiques de sauvegarde dans `academy_private` ont le RLS désactivé. L'analyse du schéma a confirmé **aucun privilège SELECT ni INSERT pour les rôles `anon` ou `authenticated`** sur ces quatre tables. Le scan de découverte continue de signaler leur RLS absent : examiner la pertinence d'une activation avec les administrateurs DB avant de changer les permissions ; ne pas l'activer automatiquement sans examen des dépendances.

## Suite prioritaire
1. Vérifier 227 références à licence non contrôlée et 3 références partielles (en priorité les P0), par source officielle ; ne pas confondre lien externe et redistribution du code.
2. Valider en navigateur authentifié les quatre routes sur Vercel staging, avec SSO autorisé.
3. Exécuter un vrai test Supabase Auth/RLS multi-comptes (anonyme, utilisateur sans inscription, apprenant A, apprenant B, formateur, compte suspendu).
4. Vérifier les retours e-mail PKCE et les téléchargements signés du bucket privé.
5. Terminer le contenu pédagogique et les contrôles de qualité des 47 modules ; ne publier qu'après validation.
6. Vérifier les webhooks de paiement, l'idempotence, les remboursements et l'attribution d'inscription sur environnement de test avant toute vente.
7. Exécuter et relever le résultat de la CI complète GitHub ; le statut `READY` de Vercel ne signifie pas que tous les tests ont réussi.
