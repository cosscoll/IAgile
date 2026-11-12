# IAgile Academy — prototype privé

Ce dossier contient un espace apprenant de développement, non publié sur le site vitrine. Il utilise Supabase Auth, les droits d'inscription par formation et les politiques RLS existantes du projet IAgile Academy.

Fonctions : connexion, déconnexion, récupération du mot de passe, cours autorisés, lecture des modules publiés, sauvegarde de la progression et interface mobile.

Le fichier config.js contient uniquement une clé publique de navigateur. Il ne contient aucune clé de service.

Vérifications : node --check academy-private/app.js et node --test academy-private/tests/portal.test.mjs.

Reste à valider : tests multi-utilisateurs, redirections Auth, déploiement sur un domaine distinct, import des leçons existantes depuis Drive, achats vérifiés côté serveur et tests UX complets. Aucune inscription payante n'est ouverte.

Les supports pédagogiques détaillés restent privés dans Drive et Supabase ; ils ne doivent pas être copiés dans le dépôt public.


## État des contenus privés — 9 octobre 2026

Les trois programmes maîtres de Google Drive ont été utilisés pour créer 38 **fiches de cadrage inédites en base**, sans publication ni écrasement des neuf modules Processus existants. Les quatre parcours totalisent désormais 47 modules, tous avec `published=false`. Chaque nouveau brouillon reprend le titre et le résumé de son programme officiel, mais **n'est pas une leçon complète**.

Trois projets de fin de formation supplémentaires ont été préparés comme brouillons, un pour chaque parcours autre que Processus. Les consignes de ces projets sont à compléter avec des exercices, exemples distincts, critères d'évaluation et corrections réservées aux formateurs. La base contient maintenant dix consignes de livrables, toutes non publiées.

Migrations Supabase : `academy_curriculum_drafts_drive_v1` et `academy_capstone_drafts_drive_v1`. Les décomptes et les diagnostics sécurité ont été revérifiés après exécution. La publication des cours n'est ni autorisée ni réalisée par ces migrations.

## Améliorations du lecteur

Le lecteur présente les titres, listes et passages mis en évidence du Markdown par des éléments DOM construits sans `innerHTML`. Les notes privées sont enregistrables par module. La déconnexion supprime les contenus pédagogiques visibles ou chargés du DOM. Les tests correspondants sont inclus dans `academy-private/tests`.

La couverture automatisée reste partielle : ne pas confondre tests de rendu, tests anonymes REST et validation avec vrais comptes apprenants/formateurs.


## Évaluation du pilote Processus (10 octobre 2026)

Les sept consignes de travaux du parcours `processus` ont été enrichies **directement dans Supabase** avec livrable attendu, critères d'évaluation et autocontrôle. Les consignes initiales restent présentes. Les sept travaux restent `published=false` et aucune ressource premium n'a été placée dans ce dépôt public.

La vue formateur affiche maintenant la consigne et les critères du travail à côté de la réponse enregistrée, via le rendu Markdown sûr et en lecture seule. Cette fonctionnalité est **développée et testée sur la branche**, sans déploiement Academy réel.

Avant de publier les consignes, charger les documents de cas fictif correspondants dans un espace privé, valider les corrections formateur et exécuter le test multi-comptes sur le backend réel. Les tests Chromium actuels utilisent des données fictives.


## Retours pédagogiques — 10 octobre 2026

La table privée `academy_deliverable_feedback` existe maintenant dans le projet Supabase IAgile Academy. Elle permet au formateur **affecté** à la formation d'enregistrer un avis `validated` ou `needs_revision` et un commentaire entre 20 et 5000 caractères pour un livrable existant. L'apprenant ne peut que lire le retour qui lui est destiné, si son inscription et son compte sont actifs. La table est soumise à RLS et ne donne aucun accès au rôle anonyme. Le schéma TypeScript a été régénéré, et la migration appliquée est copiée dans `migrations/20261010_instructor_feedback.sql`.

La vue formateur permet d'enregistrer le retour et la vue apprenant l'affiche. La validation automatique et la simulation Chromium ne remplacent pas la recette sur de vrais comptes Supabase, et la PR ne doit pas être fusionnée avant les contrôles de sécurité et de publication.


## Import privé sans clé administrateur dans le navigateur (11 octobre 2026)

L'interface `import.html` est réservée à un **formateur authentifié et actif** affecté au cours `processus`. Elle permet de sélectionner le pack ZIP local de 12 dossiers fictifs, puis :

1. Contrôler localement version `0.1`, statut `draft_unpublished`, nombre de fichiers, chemins, tailles et empreintes SHA-256 du manifeste.
2. Comparer ces données aux 12 références existantes de `academy_course_assets` récupérées sous RLS (désormais lisibles par le formateur affecté même si elles sont en brouillon).
3. Transférer uniquement les fichiers correspondant aux chemins déjà approuvés dans le bucket privé `iagile-course-files` via le **JWT du formateur**. Aucun secret administrateur n'est embarqué dans la page.
4. Relire chaque fichier depuis Storage, comparer son empreinte SHA-256 et refuser tout remplacement de contenu existant différent.

La migration `migrations/20261011_instructor_storage_upload.sql` impose la restriction d'upload dans Supabase : rôle `authenticated`, compte `active`, affectation au parcours et chemin de fichier correspondant à une référence `published=false` d'une formation elle-même non publiée. Aucun droit UPDATE/DELETE général sur Storage n'est accordé.

La règle autorise un **transfert de brouillon**, pas la publication : les apprenants restent sans accès et le passage des ressources en `published=true` reste soumis à une validation distincte.

**Tests vérifiés :** simulation SQL transactionnelle avec formateur/apprenant fictifs, y compris INSERT/SELECT sur `storage.objects` et annulation finale ; tests unitaires du code ; scénario navigateur avec 12 fichiers entièrement fictifs dans le navigateur de CI. Ces tests ne prouvent pas encore un transfert réel Auth/Storage.

**Blocage restant :** aucun compte Auth formateur n'existe encore, et l'espace Academy lui-même n'est pas déployé sur une adresse séparée. Le ZIP original demeure disponible dans cette conversation, pas sur GitHub. Ne pas créer de compte avec un mot de passe placé dans des sources publiques.
