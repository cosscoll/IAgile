# IAgile Academy — plan d'implémentation

## Périmètre et garde-fous

Vitrine GitHub Pages : uniquement aperçu commercial. Aucun cours complet, exercice corrigé, fichier privé ou clé secrète dans les sources publiques, y compris dans l'historique des commits.

Un seul compte apprenant peut donner accès aux quatre formations, chacune ayant ses pages dédiées et son droit d'inscription indépendant. La possibilité de se connecter ne constitue pas un droit d'accès à une formation.

## Lots techniques

### A — Accès et base de données
- Identifier et auditer le projet Supabase IAgile exact, sans modifier d'autres projets.
- Authentification avec email vérifié, déconnexion et récupération de compte.
- Modéliser formations, modules, leçons, inscriptions, progression et audit minimal des accès.
- Activer RLS sur toutes les tables exposées, droits séparés pour apprenant et administrateur.
- Interdire toute création autonome d'inscription payante par le navigateur.

### B — Livraison pédagogique
- Contenus privés dans stockage sécurisé ; aucune URL permanente librement accessible.
- Contrôle serveur des inscriptions à chaque demande de contenu et téléchargement.
- Progression par leçon, reprise de session, indicateurs de complétion.
- Accessibilité clavier, états de chargement, erreurs explicites et responsive.

### C — Paiement et exploitation
- Choisir l'outil de paiement une fois l'offre validée.
- Attribution des droits uniquement après événement de paiement vérifié côté serveur.
- Traitement idempotent des événements, des remboursements et des expirations.
- Journaux d'erreurs sans secrets ni données sensibles superflues.

## Scénarios de validation obligatoires

1. Visiteur sans connexion : aucune leçon privée n'est disponible.
2. Compte inscrit uniquement à A : A lisible, B/C/D refusées.
3. Compte expiré/suspendu : aucune ressource premium accessible.
4. Un apprenant ne peut ni consulter ni modifier la progression d'un autre.
5. Un apprenant ne peut pas créer ou modifier son inscription payante.
6. Une URL de fichier privé périmée est refusée.
7. Le webhook de paiement rejoué ne crée pas un second accès.
8. Une erreur réseau n'affiche pas de faux état « paiement confirmé ».
9. Desktop, mobile, clavier, reconnexion, navigation et reprise après interruption.
10. Les contenus complets restent absents du dépôt public et du site vitrine.

## Dépendances et état réel

Le 9 octobre 2026, la connexion Supabase renvoyait zéro projet accessible. Aucune table ni politique RLS n'a donc été déployée. Le backend de chatbot Vercel est préparé séparément mais non activé sur le site public ; le paramètre public de son URL reste vide. Aucun paiement ni compte apprenant n'a été validé.

Avant tout déploiement apprenant : restaurer l'accès au bon projet Supabase, vérifier sa configuration et l'existant, tester toutes les politiques avec des comptes de démonstration. Les décisions commerciales et juridiques restent nécessaires avant la vente.

## Publication et contrôle

À chaque changement GitHub : vérifier les tests, la publication Pages, puis l'accès effectif aux URL et les modifications visibles. Le contrôle en ligne automatisé a été ajouté au workflow ; il ne remplace pas les vérifications visuelles sur navigateur et appareils réels. Ne jamais annoncer « en ligne » avant confirmation du déploiement correspondant.
