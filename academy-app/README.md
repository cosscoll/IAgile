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
- Aucun cours premium, corrigé ou fichier pédagogique n'est intégré dans le HTML, CSS ou JavaScript public. Les corps récupérés depuis la base sont affichés en texte, sans injection de HTML.
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

Ce test est statique : il ne remplace pas les tests d'accès avec plusieurs comptes réels.
