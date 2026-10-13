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

## 2. État actuel du catalogue — vérifié le 12 octobre 2026

| Élément | Situation constatée |
| --- | --- |
| Vitrine | Publiée via GitHub Pages natif ; contrôle HTTP, 20 chemins internes et SHA de déploiement automatisés et réussis sur le dernier déploiement contrôlé |
| Academy | Code de quatre parcours et tableau de bord en dépôt, **non hébergé** |
| Backend d'apprentissage | Supabase IAgile Academy identifié, 10 tables RLS et bucket privé |
| Modules | 47 fiches non publiées : 9 processus, 12 agents, 11 automatisation, 15 sites 3D |
| Modules très succincts | **0/47** sous 500 caractères, après enrichissement privé de 35 fiches ; ne vaut pas validation technique ou pédagogique |
| Travaux / supports | **15** consignes non publiées (dont Playbook final Processus), 12 références de ressources mais **0** fichier dans le stockage privé |
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

Les **35 fiches anciennement succinctes ont été développées et intégrées à Supabase le 12 octobre 2026** : Agents (11), Automatisation (10), Sites 3D (14). L'étape suivante n'est plus d'ajouter des paragraphes, mais de **tester concrètement** les logiciels, laboratoires, modèles 3D, corrections et résultats, sans inventer de preuves de fonctionnement.

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
| P1 | Audit pédagogique détaillé des 9 modules « IA au quotidien » et des 8 livrables depuis les sources existantes | Oui | Terminé — rapport privé Drive vérifié le 12/10/2026 |
| P1 | Tableau de correspondance modules ↔ fichiers Drive ↔ tables Academy ↔ supports | Oui | Terminé pour Processus — 12 références cohérentes par nom, mais 0 fichier disponible en Storage |
| P1 | Gabarit unique de contrôle qualité et barème de revue pédagogique des quatre cursus | Oui | À faire |
| P1 | Rédiger les 35 modules techniques initialement succincts | Oui | **Terminé — 35/35 textes intégrés en privé, aucune publication** ; recette technique et tests apprenants à faire |
| P2 | Reprendre la création du staging Academy après erreur Vercel 403 | Non pour le compte Vercel tant que l'autorisation manque | Bloqué |
| P2 | Réaliser les tests Auth et RLS multi-comptes réels sur staging | Après hébergement + comptes de test autorisés | Bloqué |
| P2 | Tester les supports premium en Storage privé et leurs politiques de lecture | Oui pour préparer tests ; après disponibilité des fichiers pour essais finaux | À faire |
| P2 | Activer une publication GitHub Pages strictement contrôlée | Paramètre Pages à changer de façon coordonnée | À vérifier |
| P3 | Communication de lancement, SEO, copies des pages et séquences de démonstration | Oui pour préparer les documents | À faire |
| P3 | Tarifs, marque, vendeur, mentions légales, paiements commerciaux | Validation du porteur du projet requise | Bloqué pour l'ouverture |

### Choix par défaut pour la reprise

**S1 exécuté pour IA au quotidien : reprendre S2 avec la résolution de versions des ressources et examens.** L'audit interne des 9 modules et 8 livrables est archivé dans Google Drive privé. Les 12 fichiers anciens retrouvés en bibliothèque présentent des empreintes et des tailles différentes du manifeste actuel (0/12 correspondances) : ne pas écraser les ressources en base ni publier les cours avant arbitrage des versions.


## 8. Compte rendu du sprint 1 — 12 octobre 2026

- **Terminé, preuves conservées dans Drive privé :** examen détaillé des neuf modules, des huit travaux et du programme/manuel d'évaluation ; relevé de leurs dépendances.
- **Structure pédagogique :** les neuf textes Academy contiennent déjà de véritables exercices et plusieurs critères de validation. Ne pas les réécrire systématiquement ; concentrer les corrections sur les divergences vérifiées et les fichiers nécessaires.
- **Dépendances de support :** 12 ressources décrites dans le registre Supabase, zéro objet dans le bucket privé ; cinq modules utilisent des jeux de données externes.
- **Archives récupérées :** les douze anciens fichiers existent dans une archive apprenant privée, mais **0/12 empreintes et tailles ne correspondent** à la version indexée dans Academy. La variante archivale doit être comparée puis versionnée ou remplacée explicitement ; aucun import aveugle.
- **Évaluation :** plusieurs versions de scénario final et des grilles de notation distinctes exigent un choix éditorial cohérent avant ouverture.
- **Changements sur données sensibles :** aucun contenu premium copié dans GitHub ; aucun cours publié ; aucun fichier Storage remplacé.
- **Prochain bloc autonome :** rechercher la version canonique des douze fichiers, analyser l'écart avec la version archivée, figer le protocole de correspondance exercices/corrigés et préparer l'import privé sécurisé. L'Academy reste non commercialisable.


## 9. Reprise autonome — Sprint 2, 12 octobre 2026

**Travaux vérifiés**
- Espace apprenant : quatre parcours équipés d'une liste de ressources privées. Un lien signé Supabase est produit uniquement après clic et seulement pour une ligne `published=true` du bon parcours, après authentification et contrôle des inscriptions. Lien valable 60 secondes, expiré dans l'interface au terme de cette durée ; aucune URL permanente publique.
- Lecture des leçons et des consignes améliorée : paragraphes, titres, listes, blocs de code et emphases créés avec le DOM, sans interprétation HTML. Les tests Chrome sur mobile vérifient la présentation et le caractère inerte du HTML fourni comme texte.
- Tests automatisés GitHub : contrôles d'accès simulés (visiteur anonyme, sans inscription, cours non publié, refus du registre et du Storage, chemin d'un autre cours), Chromium et CDN Supabase.
- Sources pédagogiques : archive apprenant privée V0.8 comparée aux 12 entrées de `academy_course_assets`. **0/12 empreintes et tailles correspondent** : aucun écrasement ni import des données archivées.
- Archive technique **privée** conservée dans la bibliothèque ChatGPT `/IAgile — Supports de formation/IAgile_S2_Controles_Integrite_Prives_20261012.zip`, avec manifeste attendu, tableau des écarts et vérificateur read-only. Ne pas placer ce ZIP dans le dépôt public.
- Épreuve finale : brouillon privé de cadrage du Playbook IA, distinct de la variante Rivage ; version pédagogique non intégrée au LMS avant harmonisation des grilles et des corpus.

**Dépendances et limites**
- L'Academy demeure sans environnement HTTPS public : aucun parcours Auth ni autorisation de lecture par deux vrais comptes n'a été testé. Autorisation Vercel 403 encore à résoudre.
- Supabase Storage ne contient toujours pas les 12 fichiers canoniques ; ceux-ci ne doivent pas être substitués par une archive plus ancienne sans analyse et versionnement.
- Aucun module, livrable ou asset de formation n'est publié. Aucun paiement ouvert.
- Les correctifs visuels et les liens temporaires sont des fonctions **développées et testées en simulation**, pas des preuves d'exploitation commerciale.

**Prochain ordre d'exécution**
1. Retrouver la version canonique des 12 jeux de données et figer une correspondance `source → module → livrable → corrigé` pour les cas Lumen, Orbe et Sillage.
2. Définir une référence unique et un identifiant de version explicite pour chaque épreuve Rivage, puis harmoniser Playbook /100 et transfert /20 ; ne pas utiliser un corrigé d'une autre variante.
3. Restituer les fichiers contrôlés uniquement dans le stockage Supabase privé et tester la signature et la lecture avec de véritables comptes distincts.
4. Terminer la QA du parcours pilote et seulement ensuite étendre l'intégration aux trois autres formations.


## 10. Sprint S2 — contrôles du 12 octobre 2026 (lot complémentaire)

**Ressources et évaluation (confidentiel, hors GitHub public)**
- Les douze ressources du kit apprenant V0.8 ont été retrouvées et copiées octet pour octet dans un **paquet d'audit privé**. Le test SHA-256 valide 12/12 fichiers en tant que V0.8, mais **0/12 ne correspondent** aux empreintes Supabase. Ne pas les appeler « canoniques » ni les charger à la place de celles de la base.
- Un erratum formateur séparé a été créé pour la V0.8 : divergences Lumen, Orbe, Sillage et grilles historiques. Contrôle indépendant : **1 000 €** de devis approuvés et **480 €** de paiements signalés pour le corpus Orbe V0.8 ; ces chiffres ne correspondent pas au corrigé d'une autre version. Les données détaillées et le corrigé restent en **Drive privé**, non dans ce dépôt.
- Chemins de référence internes : bibliothèque privée ChatGPT `IAgile — Supports de formation/IAgile_Processus_Audit_V08_Versions_20261012_PRIVE.zip`, Drive privé « Errata formateur confidentiel — Jeux de données V0.8 » et audit S1 déjà sauvegardé. Aucun fichier premium n'est exposé par la vitrine.

**Sécurité réelle de la base, tests non destructifs**
- Les 10 tables Academy ont RLS activé ; le bucket `iagile-course-files` est privé et limite les types à CSV/Markdown.
- Lectures `SELECT` en transactions en lecture seule : deux identités UUID fictives sous rôle SQL `authenticated` n'ont vu aucune inscription, leçon, consigne ni ressource ; rôle SQL `anon` sans droit de lecture des modules. Il s'agit de tests directs du backend, **pas** d'une connexion Auth réelle ni d'un test d'accès positif avec abonnement.
- Le trigger `academy_answer_revision_invalidates_feedback` supprime les anciens retours lorsque le contenu d'une réponse change ; le client Academy affiche maintenant un retour seulement si `answer_updated_at` correspond exactement à `updated_at`, et masque l'ancien retour après nouvelle soumission réussie. Tests de version périmée, mise à jour refusée et nouvelle soumission ajoutés et réussis (PR #25).

**Restent bloquants** : réconcilier les fichiers canoniques, harmoniser les corrections et examiner des copies tests, déployer l'Academy en HTTPS, connecter plusieurs véritables comptes de test, publier les objets Storage uniquement après vérification, puis piloter l'apprentissage réel. Tous les drapeaux `published` restent inchangés.


## 11. Formation pilote — ajout du projet final brouillon (12 octobre 2026)

Un neuvième livrable `processus/8` a été ajouté dans la table privée `academy_deliverable_prompts` : **« Projet final — Playbook IA personnel (/100) »**, 2 057 caractères d'instructions, `published=false`. L'épreuve « Mission Rivage » conserve son numéro 7 et son objectif de transfert ; aucun ancien contenu n'a été écrasé.

État Supabase vérifié après l'insertion : 9 livrables `processus`, **0 publié** ; 0 module de la formation publié ; 0 cours publié ; 0 fichier dans le bucket privé. Le conseiller de sécurité Supabase ne signale aucune alerte au 12 octobre 2026.

Le projet final a une grille provisoire /100, une exigence de 5 à 10 processus, des mesures contrôlables, au moins 3 essais répétés et des critères bloquants explicites. Il reste à harmoniser le corrigé formateur, à vérifier les ressources exactes, à réaliser des tests Auth/RLS avec de vrais comptes, puis à évaluer l'apprentissage avant toute publication payante. Détails pédagogiques et errata conservés **uniquement** dans le dossier Drive privé.

## 12. Production de contenu — 47 modules rédigés, à qualifier (12 octobre 2026)

**Opération réellement effectuée en base Supabase** : réécriture des seules 35 fiches de moins de 500 caractères, avec prédicats protecteurs `published=false` et `char_length(body_markdown)<500`, sans changer les autres cours et sans transférer de contenu premium dans ce dépôt public. Le module 0 de chacun des trois parcours techniques, ainsi que les 9 modules Processus, étaient déjà développés et ont été conservés.

| Parcours | Modules développés | Très courts (moins de 500 caractères) | Total de caractères | Publiés |
| --- | ---: | ---: | ---: | ---: |
| Agents IA — cas fil rouge Boussole | 12/12 | 0 | 62 886 | 0 |
| Automatisation — cas Atlas | 11/11 | 0 | 44 864 | 0 |
| IA au quotidien — cas Lumen/Orbe/Sillage | 9/9 | 0 | 42 047 | 0 |
| Sites web 3D — cas L'Atrium | 15/15 | 0 | 53 988 | 0 |
| **TOTAL** | **47/47** | **0** | **203 785** | **0** |

**Le mot « rédigé » ne signifie PAS « prêt à vendre ».** Les textes techniques contiennent objectifs, exercices fictifs, méthodes, barèmes et critères bloquants, mais les laboratoires réels n8n/Make, agent LLM SDK/no-code, scène 3D R3F/GLB, mesures GPU, double correction et tests utilisateurs n'ont pas été démontrés par cette opération. La longueur est un indicateur de complétude éditoriale de premier niveau, non de performance pédagogique.

**Preuve éditoriale privée :** rapport Google Drive « Audit éditorial après enrichissement des 47 modules » : https://docs.google.com/document/d/1eMrtS21H006jYDuGN1_Q4QV_aaiHCORUKSRNAr3vHLI/edit . Les cours détaillés et les corrigés restent dans la base et le Drive à accès restreint.

**Livraison encore verrouillée :** à la dernière mesure, 0 cours, 0 module, 0 consigne et 0 fiche de ressource publiés, 0 fichier dans Storage, 0 profil apprenant et 0 inscription. Les conseillers de sécurité Supabase n'ont relevé aucune alerte, ce qui **ne** valide **pas** à lui seul l'authentification de plusieurs vrais comptes.

**Backlog actualisé, par ordre de valeur :**

1. Rapprocher les 12 sources canoniques de Processus avec l'archive candidate V0.9, vérifier chaque cas, choisir explicitement la version et finaliser le corrigé correspondant. Ne pas utiliser le corrigé formateur historique pour noter un autre corpus.
2. Remédier à l'autorisation d'hébergement de staging Academy (Vercel / alternative autorisée), puis tester Auth, RLS et téléchargements privés avec plusieurs véritables comptes aux droits différents.
3. Transformer les exercices déjà rédigés en *démonstrations exécutées* et tests reproductibles pour les trois parcours techniques, avec preuves des résultats et corrections des écarts.
4. Vérifier accessibilité, navigation, mobile, répétition et transfert d'apprentissage sur le pilote avant toute mise sur le marché.
5. Préparer séparément offre, conformité, tarif et paiement de test pour décision humaine.

**Règle de reprise :** ne plus refaire le chantier de rédaction déjà terminé simplement pour augmenter le volume de texte. Travailler sur **preuve d'exécution, fichiers, corrections, accès, pédagogie réelle et lancement**.


## 13. Reprise autonome — paiements, staging, ressources privées (12 octobre 2026)

**Paiement : sécurité préparée, ventes toujours fermées.**
- PR #36 fusionnée : vérification HMAC de la charge brute d'un événement Stripe, validité temporelle, décisions *propose-grant* / *propose-revocation-review* sur commande connue, tests de falsification, somme, cours, identité, doublon, litige. Tests **fictifs uniquement**. Aucun client marchand IAgile, aucun serveur webhook, aucune facture et aucune attribution automatique d'inscription.
- PR #37 fusionnée : migration appliquée à Supabase créant `academy_billing.orders` et `academy_billing.webhook_events` dans un schéma privé. RLS activé sur les deux tables ; pas de droit de schéma ni d'écriture pour `anon` ou `authenticated`. Compte serveur seul habilité. Enregistrements constatés après migration : 0 commande, 0 événement, 0 inscription.
- Les critères `signed_checkout`, `merchant`, `seller`, `price`, `invoices`, `refund` restent **bloqués**, même si les tests unitaires sont réussis.

**Académie : hébergement de staging créé, recette réelle non validée.**
- Projet Vercel `iagile-academy-staging` (ID `prj_bMiSXP3lGCrYPDtzkXAHBPMkXUOC`), premier déploiement `dpl_V6CF2wxkJNikDrTDpnHfn9cMt9Wv` marqué READY, neuf fichiers présents. Protection Vercel Authentication `all` activée.
- La lecture de page authentifiée par l'outil connecté retourne 403 à l'étape d'autorisation Vercel ; ne pas désactiver la protection pour contourner le test. Un nouveau déploiement visant la version avec RPC atomique a été refusé par limite journalière d'API Vercel (HTTP 402). La version hébergée **n'est donc pas vérifiée à jour** ; les tests Auth multi-comptes sont encore absents.

**Supports Processus : pack d'import contrôlé conservé au privé.**
- `IAgile_Processus_V091_Preparation_Import_Controle_PRIVE.zip` est maintenant dans la bibliothèque ChatGPT privée `/IAgile — Supports de formation`. Il contient 12 fichiers apprenant V0.9.1, un contrôle indépendant de SHA-256 et taille (12/12 réussis), les écarts des 12 références Supabase, un mode opératoire et une proposition de SQL **non exécutée**, conditionnée à la présence des 12 objets dans le bucket.
- Source `V0.9.1` toujours **CANDIDAT NON VALIDÉ** et non publié ; 0 fichier Supabase Storage. Le SQL de préparation ne doit pas être utilisé avant une double vérification des octets après import et la validation pédagogique du corpus.
- Les corrigés et copies formateur restent hors du dépôt public. Tous les drapeaux `published` doivent rester faux jusqu'à la recette.

**Lancement : critères explicites et documents.**
- `docs/IAgile-LAUNCH-EVIDENCE.json` contient 15 critères d'ouverture ; seuls les contrôles de vitrine et d'existence du staging ont un statut technique `verified`. `npm run qa:launch` reste volontairement non prêt ; ne pas l'utiliser pour déclencher une mise en vente.
- Runbook privé Drive « IAgile — Runbook opérationnel de première vente » : https://docs.google.com/document/d/1EfsYickzSXcIeQax_1QecZcaPDY73PcbtWTjyZgjuHQ/edit ; kit communication privé, sept posts et trois emails non envoyés : https://docs.google.com/document/d/1_3GuNnaE3k-U_83n7_wMEHwsR_x4ZfN8V14erY_qXw4/edit .
- Aucun prix, contrat définitif, consentement client, facture, certificat, transaction réelle ou inscription commerciale créé.

**Blocages à traiter sans masquer l'état réel :** compte marchand et vendeur validés ; décision juridique sur le type de prestation et mode de facturation ; validation finale du corpus ; import privé vérifié ; permissions Vercel et quota pour actualisation du staging ; deux vrais comptes et tests de droits ; prix et checkout test ; facture/remboursement ; revue pédagogique humaine et support.


## 14. Sprint autonome complémentaire — 12 octobre 2026

**Interface de correction formateur : développée, pas encore validée en réel.**
- PR #40 fusionnée : nouvelle route `academy-app/instructor.html` + JS/CSS pour lister uniquement les copies des cours attribués, si le formateur est actif et si cours/consignes sont publiés. Les contenus des apprenants sont restitués en texte inerte, et non en HTML interprété. Une correction est enregistrée avec l'identifiant de version de la réponse ; le trigger `academy_feedback_verify_answer_version` refuse un travail devenu périmé. Une relecture de la correction en base est exigée avant confirmation.
- Tests automatisés de liste, filtrage de modules non publiés et correctifs périmés ; test Chromium simulant un visiteur, un compte sans attribution et un formateur autorisé. Aucun compte, copie ou correcteur réel créé. Nouvelle interface **non encore redéployée sur le staging Vercel**.
- PR #43 fusionnée : correspondance des versions de réponses sur la représentation sérialisée exacte, sans `Date.parse` (qui tronque les microsecondes) ; test de modification à une microseconde d'intervalle.

**Parcours pilote : test de navigation intégrale, simulations uniquement.**
- PR #41 fusionnée : scénario navigateur avec 9 modules, 9 livrables et 12 fichiers factices, testant mobile, navigation, notes, progression, remise d'un travail, absence d'exécution HTML et téléchargement privé déclenché par clic. Test Chromium réussi.
- Cette preuve est un **test de code avec contenus inventés**, ni un essai pédagogique sur les données Lumen/Orbe/Sillage, ni une validation des autorisations sous de vraies identités Auth.

**Facturation : enregistrement serveur de paiement préparé, vente fermée.**
- PR #42 fusionnée et migration appliquée : `academy_billing.record_checkout_payment(...)`, opération SQL atomique, idempotente grâce à `event_id` unique et à un verrou de commande. Refus si utilisateur, cours, marchand, montant, devise, statut, Checkout Session, PaymentIntent, mode live/test et consentement ne concordent pas.
- Permission de fonction sous `service_role` uniquement ; `anon` et `authenticated` refusés (vérifié dans la base, essai d'appel sous `authenticated` : 42501). Un appel de simulation serveur avec commande inexistante est rejeté (22023), sans création de commande.
- La fonction **n'authentifie pas elle-même le webhook Stripe** : un endpoint backend autorisé, avec HMAC brut Stripe vérifié avant l'appel, reste à développer. Elle ne délivre aucun droit de cours, ne facture aucun client, n'émet aucune facture. Zéro commande, compte Auth, événement et inscription après cette opération.
- Les critères légaux, marchands, prix, facture, rétractation et remboursement restent `blocked`.

**Laboratoires des trois formations techniques : prototypes privés exécutés.**
- Archive `IAgile_Labs_Techniques_Atlas_Boussole_Atrium_v01_PRIVE.zip` dans la bibliothèque `/IAgile — Supports de formation`, SHA256 de l'archive `3342cc490b51de211ef02405cf5627889bca79f0a8af0aa434abb47bd44b3482`.
- **Atlas (Automatisation)** : mini-workflow Node sans effet externe ; jeu fictif de sept demandes, doublon, données sensibles, consentement, validation humaine et reprise après répétition ; tests réussis.
- **Boussole (Agents)** : démonstrateur déterministe de permission des outils, sources à jour et brouillon soumis à validation ; tests réussis, **aucune API LLM réelle**.
- **Atrium (3D)** : projet WebGL2 sans dépendances utilisant shaders, perspectives, profondeur, animation désactivable, clavier et prise en compte de `prefers-reduced-motion`. Tests mathématiques et statiques réussis ; recette graphique Chromium limitée par erreur d'initialisation GPU dans l'environnement automatisé. Une validation sur appareils réels reste obligatoire.
- Archive et code pédagogique conservés hors GitHub public. Ce sont **des laboratoires de démarrage**, non une certification de complétude des 38 modules techniques.

**Offre commerciale préparée, tarifs non décidés.**
- Document Drive privé « IAgile — Décision commerciale première formation — 3 offres à arbitrer » : https://docs.google.com/document/d/1R5CtdvzcmBgnjCwbzy-n5bT3tV_wacyJLTp9uGtiHVU/edit .
- Format autonome, accompagné et B2B sur devis, avec aperçu gratuit séparé. Les fourchettes de recherche reprises du benchmark sont des hypothèses à valider auprès d'acheteurs, **non des tarifs commercialisés**. Identité légale, TVA, type de contrat, support et compte marchand toujours manquants.

**Conclusion de la session :** aucun élève inscrit ; tous les indicateurs `published=false` ; aucune facture et aucune vente ; aucun contenu premium exposé dans le dépôt public. L'Academy Vercel protège toujours un déploiement antérieur, non synchronisé avec les PR #40–43. Avant premier encaissement : choisir et intégrer le corpus canonique privé, vérifier les fichiers en Storage, déployer le dernier frontend, réaliser des tests Auth/RLS avec de vrais comptes, qualifier et approuver le vendeur, les prix et les contrats, connecter le marchand IAgile puis tester une vente/rétractation/facture complète.


## Mise à jour vérifiée — 13 octobre 2026

**La mention précédente « hébergement Academy bloqué par Vercel 403 » est remplacée par ce relevé plus récent.** Les appels Vercel explicitement associés au scope d'équipe `team_S3CZCMukEO0dAG8QdpmXtabI` retournaient 403. Les mêmes opérations effectuées sans ce scope forcé ont réussi dans le contexte du compte authentifié. Le projet `iagile-academy-staging` n'était donc pas absent : un déploiement ancien existait déjà.

**Déploiement effectivement réalisé et lu en retour :** package de 12 fichiers de l'interface Academy depuis le commit `a267aa199ab5369a2a57558bec228f4660694b23` ; première version corrigée `dpl_515GrZspuRJKFYp8ZfhNpQ1phBj8`, remplacée par le dernier staging `dpl_3eEPjQextu73VwJy8xEAN6FZ8b8r` depuis le commit Academy `69486bf0515f1a3e34e224c9f740b23cdefd77da` (PR #46 incluse) dans Vercel, statut `READY`, domaines `https://iagile-academy-staging.vercel.app/` et `https://iagile-academy-staging-procollomb-6607.vercel.app/` ; SSO activé sur **tous** les déploiements. La première tentative produisant `src/src/` a été remplacée par une version avec `src/` vérifié par lecture du listing de fichiers. L'interface formateur est incluse dans la nouvelle arborescence.

**GitHub :** correctifs de masquage immédiat des contenus apprenants après changement de session et d'invalidation de l'ancienne correction après toute nouvelle soumission, réunis dans la PR #45, fusionnée. Quatre contrôles GitHub Actions ont été déclarés réussis sur le commit de la PR avant fusion. L'Academy est **protégée et hébergée à des fins de staging**, mais cela ne prouve pas son fonctionnement avec Auth en situation réelle.

**Statut restant NO GO commercial.** Sur Supabase au 13/10 : 47 modules, zéro publié ; 15 consignes ; zéro profil et zéro inscription ; zéro fichier dans `iagile-course-files`. Les tests Auth/RLS multi-comptes en conditions réelles, les URL de redirection de staging, l'upload versionné des ressources, la validation pédagogique et l'ensemble du paiement restent à certifier. Aucun lien, corrigé ou module premium ajouté au dépôt public. Le domaine de staging est protégé et ne constitue pas un site de cours accessible aux clients.

**Important :** l'accès authentifié HTTP à l'interface n'a pas été testé ; Vercel `READY` et listing de fichiers ne sont pas une recette navigateur, ni une preuve de correspondance bit-à-bit pour tous les gros fichiers. Les futurs commits GitHub ne synchronisent pas automatiquement ce staging non relié à une intégration Git prouvée.


## Récupération des archives privées et vérification du corpus V0.9.1 — 13 octobre 2026

Les archives apprenant et formateur **V0.9.1** ont été retrouvées dans la bibliothèque privée ChatGPT `IAgile — Supports de formation`. Audit indépendant en lecture seule : **12/12 fichiers présents**, tailles et SHA-256 conformes au manifeste V0.9.1 ; 12/12 identiques au pack formateur et à la préparation d'import ; cinq CSV structurellement réguliers. V0.9.1 diffère de V0.9 uniquement pour `SILLAGE-TACHES.csv` (règle T02 clarifiée). Contrôles fictifs recalculés : Orbe 1 670 € de devis validés contre 1 350 € de paiements signalés ; Sillage 420 minutes de tâches, 330 minutes affectables après réserve, portefeuille 270 minutes et complément conditionnel de 60 minutes. **Ces vérifications ne sont pas des essais sur apprenants réels.**

Les **12 empreintes historiques actuelles** dans `academy_course_assets` (source_version `v0.1`) diffèrent des 12 fichiers V0.9.1. Le corpus candidat ne doit ni remplacer silencieusement la version d'origine ni être publié. Aucun upload Storage, aucune écriture SQL et aucune publication n'ont été effectués. La version exacte du corrigé (fichier encore nommé V0.9), l'alignement du Playbook/Rivage et une seconde revue pédagogique restent ouverts.

**Rapport de vérification confidentiel**, dans un dossier Drive contrôlé non partagé « IAgile — Corrigés formateur (accès restreint) » : https://docs.google.com/document/d/1QyoeV5kRHnZAQei9_oK2PlrQfVsRi9mkXw_mqEkf1J8/edit . Le rapport ne contient pas les contenus complets des datasets et ne doit pas être mis dans GitHub public. Les ZIP bruts restent dans la bibliothèque privée. Prochaine étape : arbitrage de version, import Storage privé avec contrôles d'octets après transfert et tests Auth/RLS multi-comptes avant tout `published=true`.


## Addendum : évaluations et version staging du 13 octobre 2026

- **PR #47 fusionnée** : l'espace apprenant relie les 9 évaluations du cursus Processus aux modules correspondants et distingue l'épreuve de transfert Mission Rivage (index 7) du projet final Playbook IA personnel (index 8). Les 4 workflows GitHub Actions sont réussis sur la PR.
- **Brouillon Supabase corrigé** : intitulé et en-tête de Mission Rivage renommés en « Épreuve de transfert — Mission Rivage (dossier Academy, 8 pièces) ». Barème et reste des instructions inchangés, `published=false` confirmé. L'index 8 est toujours l'épreuve finale /100 ; l'index 4 est un exercice de Playbook transmissible.
- **Staging Vercel synchronisé** depuis commit applicatif `2c24091dbee9041aa7a8af4b8c0eaa6ca781f2c0`, déploiement final `dpl_EM3cXXVNPiL3Q73rsSBe1NYa8UC3` vérifié `READY`, 12 fichiers, racine correcte, SSO activé. L'exécution HTTP derrière SSO n'a toujours pas été validée avec un vrai compte ; ne pas revendiquer l'Academy utilisable de bout en bout.
- **Correctif formateur candidat** : fichier `IAgile_Processus_V091_Formateur_CORRIGE_ET_CONTROLES_PRIVE.zip` stocké dans la bibliothèque privée `IAgile — Supports de formation`. Le corrigé porte désormais le nom V0.9.1 et précise la levée de la condition circulaire T02 sans autoriser d'achat ; les 12 fichiers et SHA256 du corpus V0.9.1 sont inchangés. Les tests privés de cohérence des cas réussissent. Aucune double évaluation pédagogique humaine.
- **Préflight SQL en lecture seule** : `docs/academy-readiness-gates.sql` ; au dernier contrôle 4/7 critères techniques positifs (bucket privé, RLS 10/10, garde version de correction, 9 consignes distinctes), 3/7 non remplis (12 supports enregistrés mais 0 présent dans Storage, aucun compte pilote, 0 des 47 modules publiés). Ces critères ne couvrent pas l'intégralité des conditions de vente.
- **NE PAS VENDRE** tant que l'import privé validé, les tests Auth/RLS réels, le pilote pédagogique, le parcours de paiement et la conformité ne sont pas passés. Le dépôt public demeure sans supports premium ni corrigés.
