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
