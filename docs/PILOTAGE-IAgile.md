# IAgile — Pilotage opérationnel et feuille de route

**Date de référence : 12 octobre 2026**  
**Statut : pré-lancement ; aucune vente ni formation premium ouverte.**  
**Dépôt :** `cosscoll/IAgile` ; **vitrine :** https://cosscoll.github.io/IAgile/

Ce document est le **point d'entrée pour reprendre le travail**. Les preuves détaillées et le suivi historique sont conservés dans `docs/ETAT-LANCEMENT.md`, `docs/ACADEMY-PLAN.md`, `docs/ACADEMY-CURRICULUM-ROADMAP.md` et `docs/DEPLOIEMENT-CONTROLE.md`. Les **programmes pédagogiques sources sont sur Google Drive**, pas dans ce dépôt public.

## 1. Cap produit et ordre des priorités

IAgile = une vitrine publique donnant des aperçus limités + un espace apprenant réservé avec quatre parcours dédiés, droits séparés, progression, travaux à rendre et corrections. L'existence de quatre routes Academy ne signifie **pas** qu'il y a déjà quatre sites privés hébergés et fonctionnels.

Ordre des priorités :

**P0. Ne perdre aucune donnée et ne divulguer aucun support premium.** Préserver les exclusions de GitHub Pages, les politiques RLS, le bucket privé et les contrôles de publication.

**P1. Produire une formation pilote de qualité vérifiable.** Ne pas disperser l'effort sur quatre parcours à moitié achevés.

**P2. Tester l'Academy en conditions réelles sur un staging isolé.** Vrais comptes de test, vérifications RLS, e-mails, stockage et UX.

**P3. Industrialiser les trois autres formations.** Réutiliser le modèle de cours, les composants et les tests validés pour la formation pilote.

**P4. Préparer puis valider la commercialisation.** Prix, vendeur, marque, conformité, vente, support, données et communications. Aucun checkout actif avant les validations nécessaires.

## 2. Base de départ observée

| Élément | Situation constatée |
| --- | --- |
| Vitrine | Publiée via GitHub Pages natif ; contrôle HTTP, 20 chemins internes et SHA de déploiement automatisés et réussis sur le dernier déploiement contrôlé |
| Academy | Code de quatre parcours et tableau de bord en dépôt, **non hébergé** |
| Backend d'apprentissage | Supabase IAgile Academy identifié, 10 tables RLS et bucket privé |
| Modules | 47 fiches non publiées : 9 processus, 12 agents, 11 automatisation, 15 sites 3D |
| Modules très succincts | 35/47 sous 500 caractères, surtout dans les trois cursus techniques |
| Travaux / supports | 14 consignes non publiées, 12 fiches de ressources mais aucun fichier dans le stockage privé |
| Apprenants | Zéro inscription, pas de test avec plusieurs comptes réels |
| Tests | QA GitHub, simulations Auth/RLS, Chromium desktop/mobile et contrôle de SDK réalisés ; **pas une validation multi-comptes en production** |
| Hébergement Academy | Tentative Vercel refusée avec `403` dans l'espace `procollomb-6607` |
| Déploiement vitrine contrôlé | Workflow de publication par artefact préparé mais non activé ; configuration Pages actuelle toujours native |

**Important :** les diagnostics de sécurité Supabase sans alerte ne remplacent pas les tests RLS réels. Les rapports historiques peuvent contenir des chiffres antérieurs : utiliser le relevé le plus récent, avec date et preuve.

## 3. Trois chantiers parallèles, avec un chantier pilote en tête

### A — Pédagogie (priorité n° 1 ; réalisable sans Vercel)

**Premier parcours à auditer : IA au quotidien / processus.** Justification : neuf modules d'une longueur supérieure au seuil de 500 caractères et huit consignes de livrables ; c'est un meilleur point de départ quantitatif, **pas une validation de fond**.

1. Comparer les neuf modules Supabase à la source Google Drive et au plan directeur, relever doublons, lacunes, exemples trop génériques, erreurs et versions d'outils.
2. Appliquer le gabarit qualité à chaque module : problème concret, résultat observable, prérequis, durée réaliste à mesurer, méthode expliquée, exercice guidé, cas d'erreur, solution/critères de correction, autonomie et accessibilité.
3. Revoir les huit livrables : consigne non ambiguë, preuves demandées, barème et critères d'acceptation, modèle de retour formateur.
4. Dresser l'inventaire des douze références de supports : identifier les fichiers disponibles en Drive, vérifier droits et versions ; **ne jamais déclarer un support présent tant que son objet Storage n'existe pas**.
5. Préparer un lot cohérent « leçon + exercice + corrigé + livrable » et contrôler le tout de bout en bout, avant de passer au module suivant.

**Sortie du chantier :** première formation entièrement documentée et testable, mais toujours `published=false` tant que la livraison sécurisée, l'évaluation pédagogique et les tests apprenants ne sont pas acquis.

Puis étendre le système aux 35 modules succincts : agents (11), automatisation (10), sites 3D (14). Tester concrètement les logiciels, laboratoires et modèles 3D correspondants, et ne jamais inventer de preuve de fonctionnement.

### B — Produit, sécurité et livraison (avancer indépendamment sur les tests)

1. Consolider les tests des parcours déjà codés : connexion, inscription, suspension, retour formateur, progrès, livrables, expiration et déconnexion.
2. Préparer l'hébergement HTTPS de l'Academy dans un environnement distinct. **Vercel : 403 à résoudre avant toute prétention de déploiement.** Si cette autorisation ne peut pas être restaurée, examiner une solution alternative avec les mêmes garanties ; aucune publication des cours privés dans le GitHub public.
3. Une fois le vrai domaine de staging créé, configurer les URL de retour exactes dans Supabase Auth ; utiliser des comptes pilotes fictifs, sans privilège commercial.
4. Exécuter la matrice de permissions avec au moins deux comptes apprenants distincts et un profil formateur : un inscrit seulement à A ne voit pas B/C/D, personne ne modifie la progression d'autrui, pas d'auto-attribution de droits ni de lecture croisée.
5. Vérifier les téléchargements du bucket privé et les expirations d'URL avant de charger les vrais supports ; rejouer les erreurs réseau, les doubles requêtes, la reconnexion et la navigation mobile.
6. Garder le pipeline vitrine actuel tant que la bascule contrôlée GitHub Pages n'a pas été coordonnée avec les paramètres du dépôt. Basculer la source et publier dans la même opération, avec vérification HTTP, SHA et absence de contenus internes.

**Sortie du chantier :** une Academy **de staging** réellement accessible en HTTPS avec preuves d'autorisation par compte ; ne pas annoncer un résultat opérationnel sur la seule base de simulations.

### C — Lancement, visibilité et exploitation (préparer sans ouvrir de vente)

1. Auditer la proposition de valeur des quatre formations et le parcours visiteur de la vitrine ; améliorer les pages d'aperçu, preuves honnêtes, FAQ et conversion vers une prise de contact non trompeuse.
2. Préparer le calendrier de communication, la banque de démonstrations publiques courtes, les contenus SEO, l'argumentaire et les séquences de lancement.
3. Lister les décisions nécessitant validation humaine : marque et nom de domaine, structure vendeuse, identité de contact, prix, accompagnement et calendrier d'ouverture.
4. Préparer paiement, facturation, CGV, confidentialité et service après-vente **sans activer le paiement ni émettre des affirmations de conformité non vérifiées**.
5. Réserver une phase de test pédagogique avec de vrais utilisateurs dès qu'elle sera possible. En attendant, tests simulés et revues expertes doivent être clairement étiquetés comme tels.

**Sortie du chantier :** dossier de lancement exploitable, non assimilé à une autorisation d'ouvrir les ventes.

## 4. Séquençage du travail

| Ordre | Sprint | Travail dominant | Critère de fin |
| --- | --- | --- | --- |
| 1 | S1 — Cartographier | Relevé source Drive ↔ Supabase de la formation pilote, audit détaillé des 9 modules et des 8 travaux ; liste des ressources manquantes | Matrice exhaustive, sources identifiées, priorités classées et aucun contenu premium divulgué |
| 2 | S2 — Finaliser le pilote | Enrichissement et revue des 9 modules, exercices, corrigés et barèmes ; essais documentés des démonstrations | Tous les modules passent le gabarit de contrôle qualité, les limitations sont documentées |
| 3 | S3 — Tester la livraison | Staging, Auth, RLS multi-comptes, Storage, navigateur et accessibilité | Tests réels passés et vérifiés, sans vente active |
| 4 | S4 — Industrialiser | Réutiliser le standard pour agents, automatisation et sites 3D ; traiter 35 modules succincts par priorité | Formation par formation avec tests et inventaire de fichiers complets |
| 5 | S5 — Pré-lancement | Pages de conversion, SEO, communication, juridiques, support et paiement en environnement de test | Go/no-go documenté et validations humaines obtenues |

Les sprints indiquent **un ordre**, pas une promesse de délai. S1 et les activités purement techniques sans dépendance Vercel peuvent démarrer en parallèle. Pas de nouvelle fonctionnalité cosmétique tant qu'un blocage majeur de livraison subsiste.

## 5. Definition of Done — fin de tâche non négociable

Pour une **leçon** : source identifiée, explications exactes, pratique réalisable, résultat contrôlable, correction et grille de réussite, version des outils vérifiée, accessibilité considérée, validation éditoriale, stockage privé uniquement.

Pour une **fonction de l'Academy** : tests de code, scénario positif et scénario refusé, données propres à chaque compte, robustesse des erreurs, rendu mobile, aucune fuite de contenus, vérification réelle avant statut « opérationnel ».

Pour une **mise en ligne** : tests réussis avant publication, commit exact vérifié sur l'URL publique, HTTP attendu, fonctionnalités visibles et ressources privées non servies. Un commit poussé ne prouve pas le déploiement.

Pour une **formation commercialisable** : support présent et sécurisé, accès end-to-end validé, cours testé pédagogiquement, politique de vente et service client validés, tarification approuvée et paiements de test conformes.

## 6. Mode de fonctionnement et suivi entre sessions

**Source de vérité des tâches : ce document GitHub.** L'état factuel détaillé reste dans `docs/ETAT-LANCEMENT.md` ; les programmes originaux restent dans les documents Drive existants. Le suivi utilise cinq états : `À faire`, `En cours`, `Bloqué`, `À vérifier`, `Terminé — preuve disponible`. Aucune tâche ne devient « terminée » sans lien vers un commit, un test, une pièce dans Drive ou un constat vérifiable.

**Une session de travail autonome** doit : reprendre la dernière tâche inachevée, exécuter les modifications accessibles, lancer les tests, corriger les échecs, documenter ce qui a réellement changé, puis donner les résultats et les blocages restants. Pas de demande de validation pour les ajustements réversibles et sans risque ; validation requise pour les publications payantes, décisions de marque, achats, changements d'accès/sécurité externes et paramètres sensibles.

**Point de contrôle à rendre :** « Ce qui a été fait » / « Ce qui a été vérifié » / « Ce qui reste bloqué » / « Ce que je traite ensuite ». Éviter les nouvelles listes de conseils qui répètent le backlog sans produire de livrables.

**Autonomie réaliste :** le travail peut être exécuté dans chaque session déclenchée par l'utilisateur ; il n'y a pas de travail continu en arrière-plan sans tâche programmée.

## 7. Backlog immédiat et responsables

| Priorité | Action | Peut être faite sans intervention ? | État |
| --- | --- | --- | --- |
| P1 | Audit pédagogique détaillé des 9 modules « IA au quotidien » et des 8 livrables depuis les sources existantes | Oui | À faire — prochain travail |
| P1 | Tableau de correspondance modules ↔ fichiers Drive ↔ tables Academy ↔ supports | Oui | À faire |
| P1 | Gabarit unique de contrôle qualité et barème de revue pédagogique des quatre cursus | Oui | À faire |
| P1 | Vérifier et corriger les 35 modules succincts, par groupe cohérent | Oui, sous réserve des informations sources | À faire |
| P2 | Reprendre la création du staging Academy après erreur Vercel 403 | Non pour le compte Vercel tant que l'autorisation manque | Bloqué |
| P2 | Réaliser les tests Auth et RLS multi-comptes réels sur staging | Après hébergement + comptes de test autorisés | Bloqué |
| P2 | Tester les supports premium en Storage privé et leurs politiques de lecture | Oui pour préparer tests ; après disponibilité des fichiers pour essais finaux | À faire |
| P2 | Activer une publication GitHub Pages strictement contrôlée | Paramètre Pages à changer de façon coordonnée | À vérifier |
| P3 | Communication de lancement, SEO, copies des pages et séquences de démonstration | Oui pour préparer les documents | À faire |
| P3 | Tarifs, marque, vendeur, mentions légales, paiements commerciaux | Validation du porteur du projet requise | Bloqué pour l'ouverture |

### Choix par défaut pour la reprise

**Reprendre S1, formation IA au quotidien.** Dresser immédiatement la matrice des 9 modules et 8 livrables à partir des documents officiels de Drive et de la base réelle. Ne rien publier, ne créer aucun cours premium sur GitHub, et livrer un audit module par module avec les corrections réalisables.
