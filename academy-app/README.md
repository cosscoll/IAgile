# IAgile Academy — prototype d'espace apprenant

**Statut au 13 octobre 2026 : staging Vercel créé et déployé avec SSO actif ; tests multi-comptes Supabase Auth/RLS encore non effectués. Aucune formation ni vente ouverte.**

## Entrées disponibles

- Dashboard : academy-app/index.html
- Sites 3D : academy-app/cours/sites-3d/index.html
- Agents : academy-app/cours/agents/index.html
- Automatisation : academy-app/cours/automatisation/index.html
- IA au quotidien : academy-app/cours/processus/index.html

Ces entrées constituent des pages dédiées dans une même application, pas encore quatre noms de domaine ou hébergements distincts. Un compte commun est prévu, avec droits d'inscription indépendants par formation.

## Architecture implémentée

- Connexion par lien e-mail avec Supabase Auth et PKCE (SDK @supabase/supabase-js version 2.117.3 fixée).
- Pas de création automatique de comptes depuis ce formulaire : shouldCreateUser=false.
- Contrôle du profil actif, d'une inscription active, du statut publié du cours, puis chargement des modules publiés via RLS côté Supabase.
- Suivi des modules terminés et possibilité de les marquer à reprendre, stockés dans academy_module_progress avec politique RLS par utilisateur et par formation. Une erreur de lecture désactive l'édition ; une erreur d'écriture ne montre jamais une progression validée.
- Aucun cours premium, corrigé ou fichier pédagogique n'est intégré dans le HTML, CSS ou JavaScript public. Les corps récupérés depuis la base sont affichés en texte, sans injection de HTML.
- Travaux à rendre : les consignes de academy_deliverable_prompts sont récupérées après contrôle des droits ; réponses propres à l'apprenant sauvegardées via academy_deliverable_answers avec politiques RLS, retour formateur lu depuis academy_deliverable_feedback. Un refus de lecture désactive les modifications pour éviter d'écraser une réponse inconnue ; un échec d'écriture ne produit aucune fausse confirmation.
- Tableau de bord : différencie inscription active, formation non publiée et cours accessible ; indique les modules terminés lorsque le programme est ouvert.
- Supports de cours : le registre academy_course_assets est consulté uniquement après Auth, profil actif, inscription active et publication. Il répertorie les ressources `published=true` dont le chemin appartient au cours courant. Un clic explicite demande une URL signée Supabase Storage de **60 secondes**, jamais une URL publique ; refus/erreur/mauvais hôte laissent le lien masqué.
- Les URL signées sont des jetons temporaires transférables pendant leur courte durée de validité. Ne pas les journaliser, les intégrer dans des analytics ou les afficher par défaut ; leur expiration n'est pas une révocation instantanée après déconnexion.
- Au 12/10/2026, les **12 références du parcours Processus ne correspondent à aucun objet Storage**. Le code de téléchargement est testé uniquement avec mocks et ne démontre pas qu'un support est déjà disponible pour un véritable apprenant.

- Aucun achat, attribution d'inscription, import de fichiers, droit formateur ou facturation depuis le navigateur.
- Si le backend ou les permissions échouent, aucun cours n'est affiché.

## Déploiement de staging du 13 octobre 2026 (preuve technique)

- Projet Vercel existant `iagile-academy-staging`, ID `prj_bMiSXP3lGCrYPDtzkXAHBPMkXUOC`. Le précédent HTTP 403 provenait d'un appel forcé avec un identifiant de scope inapproprié : l'accès au projet a réussi en réutilisant la session Vercel sans ce paramètre.
- Synchronisation **manuelle** actualisée depuis GitHub `cosscoll/IAgile`, commit source `2c24091dbee9041aa7a8af4b8c0eaa6ca781f2c0` (PR #45, #46 et #47). Dernier déploiement Vercel vérifié `READY` : `dpl_EM3cXXVNPiL3Q73rsSBe1NYa8UC3`, alias `https://iagile-academy-staging.vercel.app/`.
- Arborescence Vercel vérifiée : **12 fichiers** client uniquement, dont quatre routes apprenant et `instructor.html`, `instructor.js`, `instructor-policy.mjs`. Le répertoire racine a été corrigé après une première tentative qui créait un `src/src/` indésirable. La version finale revient à `src/`, structure du déploiement initial.
- Contrôle de protection Vercel : `ssoProtection.enabled=true`, `deploymentType=all`. Cette protection n'autorise pas à déclarer des cours accessibles à des utilisateurs réels : ni connexion Supabase à deux comptes, ni test de téléchargement privé, ni test navigateur SSO authentifié ne sont validés.
- Les réponses de lecture des fichiers Vercel via connecteur sont limitées en taille pour certains fichiers ; le statut `READY` et l'arborescence ne constituent pas une vérification bit-à-bit de chaque fichier ni une preuve HTTP de bon fonctionnement de l'application.
- Ne pas activer de comptes de vente : 47 modules toujours non publiés, aucun apprenant inscrit et bucket privé vide au dernier contrôle Supabase. Vérifier les URL de redirection Auth exactes de staging avant les essais de comptes pilotes.
- Le dépôt GitHub n'est pas relié à ce projet Vercel pour un déploiement automatique prouvé : les commits GitHub futurs **ne mettent pas automatiquement le staging à jour**. Utiliser une synchronisation explicite et vérifier l'identifiant du déploiement.

## Étapes encore nécessaires avant validation réelle

1. Créer un environnement de staging HTTPS distinct de la vitrine principale, sans y déposer de ressources pédagogiques dans le dépôt public.
2. Autoriser explicitement les URLs de retour du staging dans Supabase Auth, en veillant à ne pas autoriser des domaines arbitraires.
3. Précréer les comptes pilotes autorisés et les profils academy_profiles côté serveur. Ne pas attribuer d'inscription payante manuellement en production sans justification.
4. Tester utilisateur non connecté, connecté sans profil, profil suspendu, inscrit uniquement à la formation A, puis essayer les trois autres formations.
5. Tester la publication sélective après création de contenus *fictifs* avec RLS et non de cours réels pour le premier essai.
6. Vérifier le stockage privé, les URL signées à durée courte, la déconnexion, l'expiration de session, les erreurs réseau, le clavier, le lecteur d'écran et le mobile.
7. Mettre en place des domaines dédiés par formation si cette séparation reste souhaitée, tout en conservant un service Auth central et des droits séparés.
8. Corriger les erreurs observées puis obtenir une validation explicite avant toute ouverture commerciale.

## Confidentialité du dépôt

academy-app est exclu du GitHub Pages natif via _config.yml et absent de l'artefact contrôlé. Mais **le code de ce répertoire reste consultable sur GitHub** puisque le dépôt est public : c'est acceptable uniquement parce qu'il ne contient aucun contenu premium ou secret.

config.js contient uniquement une clé Supabase de type **publishable**, volontairement exposable à un client navigateur. Il ne doit jamais contenir une clé sb_secret, service_role, mot de passe ou token privé.

**Important :** une bonne RLS ne protège pas automatiquement un fichier publié dans GitHub ou un bucket Storage public. Les fichiers doivent rester en stockage privé, avec contrôle d'accès réel pour chaque téléchargement.

## Tests dans le dépôt

node tests/academy-shell.test.mjs
node tests/academy-access.test.mjs
node tests/academy-dashboard.test.mjs

La GitHub Action « IAgile — Academy browser QA (private shell) » installe un navigateur Chromium, vérifie les affichages simulés en 1440, 375 et 320 px et conserve temporairement des captures **uniquement avec données fictives**. Pour la relancer : Actions > IAgile — Academy browser QA > Run workflow. Les tests restent indépendants du vrai Supabase.

Ce test est statique : il ne remplace pas les tests d'accès avec plusieurs comptes réels.


## Sprint QA — 12 octobre 2026

- 5 routes HTML, styles responsive, CSP et en-têtes de sécurité pour un futur déploiement HTTPS via academy-app/vercel.json.
- Tests simulés des états : visiteur non connecté, profil inactif, absence d'inscription, cours non publié, échec de chargement, lecture de progression indisponible, écriture refusée par RLS, écriture autorisée et texte HTML hostile affiché sans exécution.
- Une tentative de création du projet Vercel « iagile-academy-staging » a été refusée **403 forbidden** pour l'espace « procollomb-6607 ». Aucun projet ou déploiement de staging n'a donc été créé. Reconnecter les autorisations de cet espace Vercel sera nécessaire avant d'utiliser le connecteur pour cette opération.
- Les redirections d'authentification Supabase doivent être configurées uniquement une fois l'URL de staging réellement connue. Ne pas inventer d'URL de redirection et ne pas activer l'ouverture des comptes publics.


## Retours formateur et versionnement des réponses — contrôle S2

- Lors de la lecture, l'Academy compare les horodatages `academy_deliverable_feedback.answer_updated_at` et `academy_deliverable_answers.updated_at` **dans leur représentation PostgreSQL complète**. Un `Date.parse()` limité aux millisecondes n'est pas suffisamment strict pour des modifications successives à quelques microsecondes d'écart. L'ancien verdict reste masqué si les deux valeurs ne sont pas exactement identiques.
- Après une nouvelle saisie **réellement enregistrée**, l'ancienne correction est masquée immédiatement ; une écriture rejetée la conserve si elle correspond toujours à la réponse sauvegardée.
- Supabase applique déjà les triggers `academy_answer_touch_on_edit` (nouveau timestamp serveur) et `academy_answer_revision_invalidates_feedback` (invalidation des retours). Le navigateur constitue une sécurité UX complémentaire, non la source de vérité.
- Tests automatisés : réponse/performance des versions concordantes, correction périmée, absence de réponse, échec d'écriture et succès d'enregistrement.
- Les vérifications RLS réalisées avec deux rôles `authenticated` simulant des UUID sans inscription sont des contrôles de refus. Il faut toujours tester plusieurs comptes Auth réels avec inscriptions différentes pour valider l'Academy avant toute ouverture.


## Navigation des leçons — sprint autonome du 12 octobre 2026

- Après contrôle Auth, profil, inscription, état publié et RLS, les modules sont présentés **un par un**. Le sommaire indique clairement les leçons terminées ; un seul corps de leçon est visible.
- À l'ouverture, la première leçon **non terminée** est sélectionnée automatiquement, ce qui évite de chercher son point de reprise. Le comportement ne s'appuie pas sur une préférence persistée en local : la base de progression apprenant demeure la source de vérité.
- Navigation par choix de module et boutons précédent/suivant ; `aria-current="step"`, `aria-controls`, focus et désactivation des boutons hors limites. UX disponible même quand la lecture de progression est temporairement inaccessible ; l'écriture de progression reste désactivée dans ce cas.
- Les modules non publiés ou les données privées ne sont jamais inclus dans le dépôt ni demandés par le client avant la validation des droits. La présentation du seul module sélectionné n'est **pas** en elle-même un mécanisme de sécurité.
- QA simulée avec trois leçons et un parcours avec une leçon déjà terminée, plus test Chromium mobile sur deux leçons fictives.

## Notes personnelles par module — sprint autonome 12 octobre

L'apprenant dispose d'une zone de notes personnelles distincte pour chaque module publié, avec limite de 4 000 caractères. La note est sauvegardée dans `academy_module_progress.notes` en préservant l'état `completed` lu au préalable. En cas d'erreur de lecture, l'édition est bloquée ; une écriture refusée ne confirme pas une sauvegarde. RLS applique les droits de compte et d'inscription côté Supabase. Ces tests utilisent un backend simulé, pas encore de vrais comptes pilotes.

## Vérification locale avant import des ressources privées

Le dépôt contient uniquement l'outil de contrôle, sans aucun contenu pédagogique payant :

```bash
npm run qa:private-assets -- /chemin/prive/manifest.json /chemin/prive/datasets processus
```

L'outil est **en lecture seule** : il vérifie les SHA-256, tailles, types CSV/Markdown, chemins dédiés à la formation, absence de symlinks et fichiers non inventoriés. Il refuse les manifestes marqués publiés ou déjà importés, et ne fait aucun transfert vers Supabase. Les tests utilisent exclusivement un cas fictif généré au moment de leur exécution.

La réussite de ce contrôle ne prouve pas que les fichiers sont stockés dans le bucket privé ni accessibles uniquement aux étudiants autorisés. Après validation pédagogique et import par un opérateur autorisé, vérifier les octets réellement récupérés et tester RLS/Auth avec plusieurs comptes distincts avant toute publication.

## Espace de correction formateur (pré-lancement du 12 octobre 2026)

Route dédiée `/instructor.html`, non indexée. Authentification par e-mail uniquement pour un compte **préexistant** (`shouldCreateUser:false`). Le navigateur vérifie le statut actif, les attributions `academy_instructor_courses`, les cours publiés et les consignes publiées, puis lit les copies et corrections via les règles RLS de Supabase. Aucune vue formateur n'est accessible aux visiteurs non connectés et aucune élévation de rôle n'est réalisée depuis le navigateur.

Les copies sont affichées exclusivement en texte inerte (`textContent`), y compris si elles contiennent des chaînes HTML potentiellement dangereuses. La liste est limitée temporairement aux 200 premières copies les plus récentes ; la pagination reste à implémenter pour une exploitation à grande échelle. L'identifiant de compte apparaît uniquement dans cette interface formateur privée. Il ne doit pas être publié dans la vitrine, un email ou une capture publique.

Lorsqu'un formateur valide un travail ou demande une révision, l'écriture inclut `answer_updated_at`. Le trigger SQL `academy_feedback_verify_answer_version` refuse les corrections périmées, et le navigateur vérifie ensuite la version et le contenu relus en base avant d'afficher la confirmation. La possibilité de modification d'une correction existante dépend des politiques RLS en vigueur.

**Non validé avec de vraies personnes** : aucun compte formateur, aucun apprenant et aucun cours publié à ce jour. La route est un développement préparé et contrôlé en CI, pas une correction opérationnelle démontrée. Le staging Vercel existant n'est pas automatiquement synchronisé après un commit GitHub ; il faudra le redéployer derrière SSO, puis tester deux comptes apprenants et un formateur avec rôles réels.


### Mise à jour pédagogique du 13 octobre 2026

- La formation Processus comprend **9 consignes** de travaux en base (indices 0 à 8), et non plus 8. L'interface apprenant indique après quels modules chaque travail est pertinent.
- Mission Rivage (index 7) est une **épreuve de transfert sur dossier fictif**, distincte du projet final Playbook personnel (index 8, sur 100 points). Ce renommage a été effectué dans le brouillon Supabase, avec `published=false` conservé.
- Un audit SQL de préparation réexécutable est conservé dans `docs/academy-readiness-gates.sql` : préflight en lecture seule, **pas** un test multi-comptes ni un GO commercial.
- Le corpus candidat V0.9.1 et son corrigé reformulé V0.9.1 restent dans la bibliothèque de supports privée ; aucun octet premium n'a été publié dans ce dépôt.

### Paquet complet du staging — correction de livraison

Le paquet protégé du premier contrôle complet, deployment `dpl_9oRY8NfWaBE182HYkQLnjXQK3Npk`, contient **13 fichiers** et inclut désormais `instructor.css` (omis lors de la synchronisation précédente). Vercel indique `READY` et la protection SSO reste active pour tous les déploiements. Le paquet applicatif correspond au snapshot GitHub `75fa8d3c5f9cddae616c751ac207b732eb7e7846`; les commits de documentation et tests plus récents n'altèrent pas ces assets.

Référence unique pour les futures synchronisations manuelles : `academy-app/deployment-files.json`. Le test `tests/academy-shell.test.mjs` vérifie désormais la liste exacte des 13 fichiers et les références locales des pages HTML. **La copie Vercel doit être recontrôlée après chaque synchronisation** : présence des 13 fichiers, alias, SSO, revision, puis essai HTTP authentifié. `READY` n'est pas une preuve de bon fonctionnement en navigateur.


### Dernier staging contrôlé — 13 octobre 2026

- **Code testé et déployé :** commit source `a2cffdb9e6c925248423ebc10da415e12d269dfc` (PR #49), staging `dpl_67SyGj3RafHZRgtNRPPGMnqahk7A`, `READY`, alias `https://iagile-academy-staging.vercel.app/`, exactement 13 fichiers et `instructor.css` présent. Le projet Vercel maintient `ssoProtection.enabled=true` pour tous les déploiements. L'exécution HTTP en navigateur **authentifié** n'a pas été certifiée.
- **Déconnexion apprenant :** en cas d'échec du serveur Auth, masquer immédiatement le contenu premium et les URLs signées, laisser un bouton de réessai, empêcher un événement de rafraîchissement du token de repeindre des contenus ; tests succès après reprise, erreur renvoyée et exception réseau via PR #49, 4 workflows GitHub Actions réussis.
- **Registre financier privé :** migration appliquée le 13/10 pour indexer `orders.course_slug` et `webhook_events.order_id` ; disparition des deux alertes `unindexed_foreign_keys`. Aucun flux de paiement activé.
- **Gates de lancement :** contrôle SQL en lecture seule `docs/academy-readiness-gates.sql` renforcé (PR #50). Les ressources doivent correspondre aux **12 chemins exacts**, les comptes pilotes doivent inclure deux apprenants actifs inscrits et un formateur actif, et le pilote doit avoir **9/9 modules publiés**. Ce contrôle ne remplace pas la vérification des empreintes et des droits de fichiers ni les essais réels.

**Statut : NO GO commercial ; aucun achat ou compte pilote créé.** Les contenus V0.9.1 restent dans une bibliothèque privée sans publication ni import automatique.


### Préparation de l'import pédagogique contrôlé — 13 octobre 2026

La PR #51 a ajouté `scripts/upload-approved-course-assets.mjs`, un importeur **sec, inactif par défaut**, avec préflight local, contrôle distant des réglages du bucket privé, refus d'une clé `sb_publishable_...`, non-écrasement d'objets existants, lecture distante et comparaison SHA-256 de chaque fichier. Une commande distincte **et** le SHA-256 d'un manifeste éditorialement approuvé sont requis pour autoriser toute écriture. Le script ne modifie pas `academy_course_assets`, les permissions, les indicateurs `published` ou les inscriptions.

Les tests `tests/academy-private-upload.test.mjs` simulent les 12 transferts avec fichiers fictifs, le dry-run sans requête, le rejet des fichiers altérés, un bucket devenu public, le refus réseau et l'import déjà effectué ; les quatre workflows GitHub Actions ont réussi. Guide opérationnel : `docs/ACADEMY-PRIVATE-IMPORT-RUNBOOK.md`. **Aucun upload réel n'a été exécuté** car l'approbation pédagogique et les accès administrateur opérationnels manquent encore.

Validation renforcée du staging `dpl_67SyGj3RafHZRgtNRPPGMnqahk7A` : les 13 fichiers du déploiement ont été rapprochés des 13 sources du commit `a2cffdb9e6c925248423ebc10da415e12d269dfc` par SHA-1 : **13/13 concordances**. Ce contrôle ne démontre toujours pas une navigation SSO/Auth réelle.
