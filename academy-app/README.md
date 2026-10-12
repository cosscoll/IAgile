# IAgile Academy — prototype d'espace apprenant

**Statut : code préparé, non déployé et non validé par des tests multi-comptes. Ne pas commercialiser.**

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

## Avant tout hébergement / test réel

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
