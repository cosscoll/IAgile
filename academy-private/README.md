# IAgile Academy — prototype privé

Ce dossier contient un espace apprenant de développement, non publié sur le site vitrine. Il utilise Supabase Auth, les droits d'inscription par formation et les politiques RLS existantes du projet IAgile Academy.

Fonctions : connexion, déconnexion, récupération du mot de passe, cours autorisés, lecture des modules publiés, sauvegarde de la progression et interface mobile.

Le fichier config.js contient uniquement une clé publique de navigateur. Il ne contient aucune clé de service.

Vérifications : node --check academy-private/app.js et node --test academy-private/tests/portal.test.mjs.

Reste à valider : tests multi-utilisateurs, redirections Auth, déploiement sur un domaine distinct, import des leçons existantes depuis Drive, achats vérifiés côté serveur et tests UX complets. Aucune inscription payante n'est ouverte.

Les supports pédagogiques détaillés restent privés dans Drive et Supabase ; ils ne doivent pas être copiés dans le dépôt public.
