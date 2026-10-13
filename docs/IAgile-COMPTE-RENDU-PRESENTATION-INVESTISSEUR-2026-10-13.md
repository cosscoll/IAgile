# IAgile — Présentation du projet et état d’avancement

Compte rendu stratégique et technique — 13 octobre 2026 — destiné à un partenaire ou investisseur

Document de travail. Les chiffres décrivent l’état vérifié du projet, pas une activité commerciale validée. Les hypothèses de marché, de prix et de croissance doivent être testées.

## 1. Synthèse exécutive

IAgile est un projet d’académie francophone de formations pratiques en intelligence artificielle et compétences digitales. Son ambition : apprendre une méthode, la mettre en application, la vérifier puis livrer un résultat tangible (« Build »). Le public envisagé comprend les particuliers, salariés, indépendants, professionnels et entreprises, avec une segmentation à valider.

Le projet dépasse le stade du concept : une vitrine publique existe, quatre programmes sont définis, 47 modules sont rédigés dans Supabase, une Academy de staging dispose de parcours apprenants et formateurs et une infrastructure d’accès privé est développée. En revanche, aucune offre n’est ouverte à la vente, aucun apprenant pilote n’est inscrit et aucune preuve de chiffre d’affaires ou d’acquisition client n’est disponible.

Thèse de financement : concentrer les moyens sur une seule première formation testable et vendable, valider pédagogie + sécurité + achat + demande, puis industrialiser les trois autres parcours. Il serait prématuré de financer un lancement simultané des quatre cursus.

## 2. Indicateurs vérifiés au 13 octobre 2026

4 formations enregistrées ; 47 modules rédigés en base ; 15 travaux pédagogiques ; 0 cours et 0 module publiés ; 0 profil et 0 inscription dans l’Academy ; 0 objet dans le bucket de supports privés ; 12 ressources candidates V0.9.1 contrôlées hors ligne ; 0 paiement commercial opérationnel.

Academy : 10/10 tables métier sous RLS ; staging Vercel protégé par SSO, état READY ; 13/13 fichiers du dernier paquet comparés avec succès aux sources du commit applicatif. Ces résultats NE constituent PAS un essai d’authentification de bout en bout.

Gouvernance : 4 contrôles techniques de préparation satisfaits sur 7 (bucket privé, protections RLS, verrou des corrections, séparation des travaux), mais 3 bloqués (supports réellement importés, comptes de test autorisés, publication contrôlée du pilote). Sur les 15 critères du registre commercial complet, 2 sont documentés vérifiés et 13 restent bloqués. Ces ratios ne sont pas des pourcentages de maturité financière.

## 3. Vision, problème ciblé et proposition de valeur

Constat de départ : les contenus d’initiation à l’IA sont nombreux, parfois gratuits, tandis que transformer ces connaissances en résultat fiable, mesurable et transmissible représente un besoin potentiel. Cette dernière hypothèse doit être confirmée par de vrais acheteurs.

Réponse IAgile : des parcours guidés orientés métier et réalisation, associant connaissances, exercices contextualisés, vérification des erreurs, ressources de reprise, livrables et projet final démontrant l’autonomie. La promesse « apprendre, pratiquer, vérifier, livrer » doit être concrètement démontrée ; elle n’est pas une exclusivité acquise face aux concurrents.

## 4. Catalogue — les quatre formations

### 4.1. Simplifier et soutenir les processus du quotidien — 9 modules

Apprendre à choisir des usages IA utiles, organiser, rechercher, rédiger, analyser et contrôler des tâches courantes. Neuf travaux (indices 0 à 8), dont Mission Rivage comme épreuve de transfert distincte et le Playbook IA personnel comme projet final noté sur 100. Formation pilote prioritaire, rédigée mais non publiée et non validée auprès d’apprenants réels.

### 4.2. Automatiser une tâche fastidieuse — 11 modules

Créer des flux de travail automatisés et supervisables : cartographie, connecteurs, déclencheurs, données, erreurs, reprises, sécurité et mesure du gain. Projet final envisagé : une automatisation documentée, robuste et testée en environnement réel. Les laboratoires techniques restent à valider.

### 4.3. Créer des agents IA personnalisés — 12 modules

Cadrer la mission d’un agent, concevoir ses instructions et ses sources, gérer les outils et permissions, évaluer ses réponses, ses erreurs, ses coûts et sa maintenance. Projet final envisagé : agent spécialisé audité, documenté et testé. Le fonctionnement des composants techniques doit être éprouvé.

### 4.4. Créer des sites web 3D animés — 15 modules

Développer des expériences immersives : HTML/CSS/JS, Three.js, animations, interactions, optimisation, responsive, SEO et alternative accessible. Projet final envisagé : site 3D publié. Des démonstrations de qualité professionnelle et des essais sur appareils réels restent nécessaires.

## 5. Travaux déjà réalisés

### 5.1. Vitrine, marque et parcours de découverte

Vitrine CHROME publiée via GitHub Pages : page immersive, quatre pages d’aperçu des formations, FAQ, page de présentation, outil d’orientation, démonstrations volontairement limitées et chatbot guidé local. Les leçons premium ne doivent pas être accessibles depuis le site public. Des contrôles automatisés ont vérifié les liens, exclusions et ressources publiques ; rendu mobile/WebGL et dernière version publique exigent des contrôles réguliers.

### 5.2. Academy et expérience apprenant

Application séparée en staging Vercel avec tableau de bord, quatre routes de cours, connexion par e-mail (PKCE Supabase), protection des droits par inscription, navigation une leçon à la fois, reprise des modules, suivi des acquis, notes personnelles, travaux remis et retours formateur. Le projet de staging est hébergé avec SSO et a été livré avec un paquet exact de 13 fichiers. Aucun test navigateur complet avec deux vrais apprenants et un formateur n’est encore acquis.

### 5.3. Backend, sécurité et préparation financière

Base Supabase avec tables pour profils, cours, inscriptions, modules, progression, livrables, corrections et catalogue de ressources ; contrôle de révision serveur pour refuser une correction obsolète ; Storage privé limité en taille et types MIME ; droits anonymes absents des tables Academy. Un registre de commandes et d’événements de paiement existe dans un schéma privé ; deux index de clés étrangères manquants ont été ajoutés. Aucun checkout, aucune facture et aucune attribution post-paiement de production ne sont activés.

### 5.4. Développement pédagogique et ressources privées

Quatre programmes de référence et des travaux complémentaires sont organisés dans Google Drive. Les 47 modules sont rédigés dans la base de brouillon ; leur volume n’équivaut pas à une validation pédagogique. Pour le parcours Processus, 12 fichiers candidats V0.9.1 ont été comparés par taille et empreinte SHA-256 aux versions apprenant, formateur et préparation. Leur registre SQL ancien porte d’autres empreintes : il ne faut pas remplacer silencieusement cette ancienne version.

### 5.5. Tests automatisés, maintenance et outils d’import

Tests Node, simulation des autorisations, QA Chromium mock desktop/mobile, verrouillage des réponses, déconnexion réessayable sans fuite et contrôle des fichiers Vercel. L’outil d’import privé V0.9.1 est prêt en mode simulation, sécurisé par double validation, refus de bucket public, non-écrasement et relecture SHA-256 après import ; aucune opération réelle d’import n’a été lancée. Documentation opérationnelle GitHub et Drive actualisée.

### 5.6. Étude de marché et communication

Benchmark concurrentiel sur les quatre cursus, positionnement commercial, architecture de marque, stratégie de communication par parcours et propositions d’offres documentés. Les concurrents gratuits et les formations spécialisées déjà établies imposent de prouver une valeur dépassant les prompts et tutoriels génériques. Aucun coût d’acquisition, taux de conversion ou marché capté n’a encore été observé.

## 6. Modèle économique envisagé — aucune décision de prix prise

Découverte gratuite : aperçu, diagnostic et démonstration réduite, sans contenus premium.

Offre A — Autonome : accès au programme, exercices, supports, progression et projet final. Fourchette de recherche pour le premier cursus : 79 à 179 € TTC, NON ADOPTÉE.

Offre B — Accompagnée : parcours autonome avec correction humaine, aide et délais de retour définis. Fourchette de recherche : 299 à 699 € TTC, NON ADOPTÉE et conditionnelle à une capacité réelle d’accompagnement.

Offre C — Entreprise B2B : diagnostic, adaptation, livrables d’équipe, support et reporting ; proposition sur devis, selon le périmètre et les obligations contractuelles.

Les fourchettes sont des hypothèses internes de test, pas des prix de vente. Pour calculer une contribution économique, il faudra mesurer prix hors taxe applicable, frais de paiement, coût d’acquisition, correction, support, hébergement, outils, remboursements et maintenance. Aucun CAC, LTV, taux de conversion, marge ou prévision fiable ne peut être présenté aujourd’hui comme acquis.

## 7. Situation commerciale et principaux risques

Commercial : zéro client payant démontré, absence de tunnel de commande, de facturation, de remboursement automatisé et de données de conversion. L’existence du site ne prouve pas l’intérêt commercial.

Pédagogie : neuf modules pilotes et douze supports candidats, mais version définitive, relecture humaine, exécution complète des ateliers et observation de résultats apprenants manquantes. Les trois parcours techniques demandent également des laboratoires éprouvés.

Sécurité / exploitation : règles RLS et tests synthétiques présents, mais tests de rôles avec comptes Auth réels, redirections e-mail, navigation sous SSO, droits inter-comptes, liens signés et reprise après panne non validés en situation réelle.

Offre et conformité : identité juridique du vendeur, TVA, prix, nature juridique des formations, CGV, mentions légales, confidentialité, rétractation/remboursements, support et promesses pédagogiques à décider puis vérifier.

Marché : concurrence forte d’acteurs gratuits, low-cost et premium. La différenciation doit être observée chez de vrais utilisateurs et se traduire en résultats et en ventes, non seulement dans un document de stratégie.

Technique de livraison : le site vitrine est publié depuis GitHub Pages natif ; la chaîne de tests ne bloque pas automatiquement une publication native. L’Academy est synchronisée manuellement avec Vercel : nouveaux commits et documents ne signifient pas nouveau déploiement applicatif.

## 8. Plan de réalisation et jalons de décision

Jalon 1 — Produit pilote testable. Figé éditorialement, le pack V0.9.1 est importé dans Storage privé et vérifié octet par octet. Auth, cours, progression, exercices, corrections et refus inter-comptes sont validés avec au moins deux apprenants distincts et un formateur. Critère de passage : aucun accès indu et un parcours complet reproductible.

Jalon 2 — Valeur pédagogique démontrée. Petits tests de cohorte avec utilisateurs représentatifs, mesures du taux de réussite, du temps de réalisation, du résultat final, des erreurs et des besoins d’accompagnement. Critère de passage : preuves documentées d’une progression utile et corrections des difficultés majeures.

Jalon 3 — Vente juridiquement et techniquement prête. Entité vendeuse, prix, périmètre, coûts, CGV, factures, support et traitement des remboursements validés. Checkout de test signé, événement idempotent, droit attribué uniquement après paiement certifié, puis révocation si nécessaire. Critère de passage : achat de test de bout en bout, sans fausse ouverture commerciale.

Jalon 4 — Première commercialisation mesurée. Campagne ciblée sur une seule offre, mesures des contacts, conversions, ventes, satisfaction, coût d’acquisition et contribution après coûts. Critère de passage : fonctionnement commercial reproductible ; les résultats guident l’investissement suivant.

Jalon 5 — Industrialisation. Réutiliser la plateforme validée pour Automatisation, Agents et Sites 3D, chacun après vérification technique, pédagogique et commerciale propre.

## 9. Contribution attendue d’un investisseur ou partenaire

Apport opérationnel : arbitrer les offres, les responsabilités pédagogiques, la structure juridique du vendeur et le processus de support ; mobiliser des experts métiers et un relecteur pédagogique indépendant.

Accès au marché : identifier des premiers testeurs et prospects, faciliter entretiens, pilotes, premiers achats et retours sincères. Le plus important n’est pas uniquement de financer du trafic, mais de réduire le risque de non-adéquation offre/marché.

Financement séquencé : payer uniquement ce qui débloque les jalons (tests, correction, juridique/fiscal, logiciels, hébergement, paiement, support et premiers essais d’acquisition), sur devis et budget chiffré. Aucune valorisation ni levée cible sérieuse n’est déterminable à ce stade.

Suivi investisseur : tableau d’indicateurs à créer avec activation des comptes, progression, Build livré, satisfaction, intention d’achat, conversion payante, CAC, marge de contribution, remboursements, retours formateur et incidents de sécurité.

## 10. Ce que l’IA peut prendre en charge en autonomie

A. Produit et développement : auditer les fichiers et dépendances ; corriger les défauts du site, du dashboard et des parcours ; améliorer responsive, accessibilité et performance ; écrire des tests et suites de non-régression ; ouvrir, tester et fusionner des modifications sur GitHub ; synchroniser le staging Vercel protégé puis vérifier sa version et ses fichiers. Limite : je ne peux pas inventer un test réel d’utilisateur ou une approbation de production.

B. Backend et sécurité : contrôler les politiques Supabase, migrations, index et garde-fous, préparer des scénarios positifs/négatifs d’accès, corriger les bugs de progression et corrections, analyser les conseils de sécurité et produire un rapport de preuves. Limite : les véritables tests Auth multi-comptes exigent des identités de test et des droits autorisés ; les conditions de sécurité doivent rester en vigueur.

C. Pédagogie : comparer programmes Drive et brouillons Supabase, harmoniser titres et consignes, vérifier intégrité des packs et corrigés, créer des grilles d’évaluation, détecter les incohérences, écrire des tests de calcul, préparer la version candidate et les dossiers d’import privés. Limite : l’approbation éditoriale et l’observation de vrais apprenants restent humaines ; les supports ne doivent pas être publiés par défaut.

D. Paiement / exploitation : développer les contrats d’API, validations d’événements signés, tests d’idempotence et de révocation, mécanismes d’attribution de droits, modèles de factures et emails transactionnels, scénarios de support et de remboursement. Limite : aucune création ou activation commerciale sans vendeur identifié, conditions approuvées et clés de paiement protégées.

E. Marketing : produire et améliorer landing pages, contenus de démonstration, calendrier éditorial, messages segmentés, séquences d’acquisition, FAQ, SEO et tableaux de bord. Comparer des options de prix et préparer une enquête ; compiler les retours observés. Limite : impossible de déclarer des leads, ventes, avis ou taux de conversion inexistants ; ne pas envoyer une campagne réelle sans en contrôler les destinataires et l’autorisation.

F. Gestion de projet : tenir à jour le backlog, établir les priorités, corriger la documentation, rapprocher GitHub / Drive / Supabase / Vercel, relancer les contrôles, enregistrer les preuves et préparer des rapports investisseur. Limite : mes actions s’effectuent pendant une session active ou par tâche programmée explicitement, pas en continu sans déclenchement.

## 11. Ce qui nécessite une personne et/ou une validation explicite

Décider l’identité du vendeur, la fiscalité et les responsabilités ; arrêter le prix et le contenu exact de l’offre ; obtenir l’évaluation juridique appropriée ; choisir le compte de paiement ; approuver le corpus privé canonique et la mise en ligne ; recruter de vrais testeurs, mesurer le service humain et accepter les conditions de lancement. Une IA peut produire dossiers, prototypes et tests, mais ne peut pas se substituer à ces décisions ni prétendre que les résultats commerciaux existent.

## 12. Verdict de maturité

IAgile dispose d’actifs réels : programmes, interface vitrine, application, base de données, contrôles de sécurité, documentation et stratégie. Sa maturité se situe entre un prototype développé et un MVP encore en validation. Les principaux goulots d’étranglement sont l’intégration effective des supports, la validation Auth/RLS avec de vrais comptes, la preuve pédagogique, les opérations commerciales et l’accès à des clients. La priorité d’investissement est donc la preuve, non l’extension du catalogue.

Recommandation : concentrer la prochaine phase sur « Simplifier les processus du quotidien », obtenir un premier parcours apprenant complet, un pilote humain et une première vente de test sécurisée. Financer l’extension aux trois autres cursus seulement après les premiers résultats observés.

## 13. Pièces et liens de référence

Site vitrine : https://cosscoll.github.io/IAgile/

Staging protégé : https://iagile-academy-staging.vercel.app/

Pilotage et historique GitHub : https://github.com/cosscoll/IAgile/blob/main/docs/PILOTAGE-IAgile.md

Contrôle de lancement : https://github.com/cosscoll/IAgile/blob/main/docs/IAgile-LAUNCH-EVIDENCE.json

Étude comparative du marché : https://docs.google.com/document/d/12pZ3Q0TZqBzyWjueWIYN9DJuopzafttx8cMomMpETMs/edit

Offres commerciales à arbitrer : https://docs.google.com/document/d/1R5CtdvzcmBgnjCwbzy-n5bT3tV_wacyJLTp9uGtiHVU/edit

Runbook de première vente : https://docs.google.com/document/d/1EfsYickzSXcIeQax_1QecZcaPDY73PcbtWTjyZgjuHQ/edit

Import privé : https://github.com/cosscoll/IAgile/blob/main/docs/ACADEMY-PRIVATE-IMPORT-RUNBOOK.md

Dernier contrôle : informations GitHub, Supabase et Vercel vérifiées dans la session du 13 octobre 2026. Toute nouvelle décision commerciale exige un nouveau relevé.

---
Document source éditable sur Drive : https://docs.google.com/document/d/1WK8iwWLvr0QEtz0oVTn-nPPb1NGqZ9mFPxuaaQB_OvE/edit
