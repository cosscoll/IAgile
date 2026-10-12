# IAgile — État de pré-lancement (8 octobre 2026)

## Fonctionnel publiquement
- 5 pages principales et 3 nouvelles pages de confiance/orientation
- Programmes visibles, comparer et export texte sans formulaire ni cookies de suivi ajoutés
- Démos illustratives et chatbot guidé (pas encore génératif)
- Pages metadata, sitemap, 404 et liens internes contrôlés

## Bloquants externes avant première vente
1. **Marque** : recherche d'antériorités INPI/EUIPO et nom de domaine.
2. **Structure vendeuse** : identité juridique, coordonnées de support, régime de TVA.
3. **Offre** : première formation testée auprès d'apprenants réels, programme final, durée, prérequis, format, accompagnement, tarifs.
4. **Vente** : checkout, e-mails transactionnels, facturation, remboursement, accès apprenant, tests d'achat.
5. **Juridique** : mentions légales, confidentialité, CGV et droits consommateur adaptés au modèle retenu, médiation le cas échéant.
6. **Chatbot génératif** : backend déployé et secret API serveur, coût, quotas, modération, politique de conservation, évaluation des réponses.
7. **Mesures** : Search Console, Web Vitals sur appareils réels, analytics conformes et tests accessibilité clavier/lecteur d'écran.

## Priorités techniques autonomes suivantes
- Système d'enregistrement d'intérêt avec finalité, consentement et suppression, *uniquement après connexion du prestataire et validation des coordonnées du responsable*.
- QA réelle du starter 3D, workflows n8n, SDK d'agents et pilotes.
- Test charge/abuse API IA avant activation.

## Décisions à prendre
- Identité commerciale définitive, canaux de support, prix et conditions
- Calendrier d'ouverture, première formation
- Outil de paiement et de plateforme apprenant

Ne pas confondre la publication technique GitHub Pages avec une validation de la mise en marché.

## Mise au point du 11/10/2026 — mode de publication et risques
- Configuration du dépôt : `.github/workflows/deploy.yml` est un contrôle de qualité uniquement ; `_config.yml` contient les exclusions Jekyll ; `tests/jekyll-boundary.test.mjs` vérifie leur cohérence.
- GitHub Pages utilise actuellement le mécanisme natif de publication de la branche `main`. La QA personnalisée **n'est pas un verrou de déploiement** : une modification poussée sur `main` peut être publiée même si les tests personnalisés échouent.
- Ne **pas** changer uniquement Settings > Pages > Source vers GitHub Actions : le dépôt ne contient pas actuellement de workflow de publication Actions correspondant. Cette modification isolée risquerait de bloquer les mises à jour.
- Sécurisation recommandée : préparer un nouveau workflow de publication par artefact autorisé, valider les tests avant upload et déploiement, puis basculer ensemble les paramètres Pages vers GitHub Actions et vérifier la version réellement visible sur le site.
- D'ici là, contrôler chaque ajout de fichier dans `_config.yml`, exécuter la QA, vérifier les ressources internes par des requêtes HTTP et contrôler le marqueur de révision sur la page d'accueil.
- **À vérifier encore :** accès public effectif, ressources sensibles non servies, rendu mobile/WebGL et parcours clavier sur un vrai navigateur. Un test Node local ne les prouve pas.
- Le pré-lancement reste ouvert et aucune vente ne doit être engagée sur la seule base de la présence du site en ligne.


## Reprise opérationnelle du 11 octobre 2026

**Exécuté dans le dépôt :** suppression des fermetures HTML invalides sur les quatre pages de formation ; création d'un constructeur d'artefact public à 50 fichiers ; tests des liens, secrets apparents, rendu de SHA et contenu de l'artefact ; préparation du workflow contrôlé GitHub Actions avec vérification HTTP post-déploiement. Documentation de bascule : docs/DEPLOIEMENT-CONTROLE.md. Ce workflow est préparé, **pas encore activé** ; la publication native reste la méthode en place.

**Base Academy vérifiée directement :** projet IAgile Academy actif, 10 tables protégées par RLS, 47 modules non publiés, 14 consignes non publiées, 12 références de supports, 0 objet dans le bucket privé, 0 inscription. 35 modules ont moins de 500 caractères : l'espace apprenant n'est pas prêt à la commercialisation. Aucune alerte de sécurité automatique remontée par Supabase, ce qui n'équivaut pas à des tests d'isolement multi-comptes.

**Dépendances encore à lever :** workflow de publication contrôlée à activer de façon coordonnée dans Settings > Pages, dépôt/stockage réel des cours payants dans un espace non public, finalisation de contenus techniques et évaluations, site apprenant connecté à Auth + contrôle d'inscription, tests fonctionnels réels, identité du vendeur et cadre commercial/juridique. Vérification du site public non effectuée dans cette session (accès HTTP externe indisponible depuis les moyens essayés) : ne pas affirmer que les derniers commits sont déjà visibles sur GitHub Pages.


## Sprint de fiabilisation — 12 octobre 2026

**Résultats vérifiés en GitHub Actions :**
- Site public GitHub Pages accessible (HTTP 200).
- 20 URL sensibles (Academy, backend, sources et documents internes) renvoient HTTP 404.
- Le marqueur de version du site en production correspond exactement au commit main contrôlé, f5f96c601a7c30e7c13eb77bcb39a67dd8be63cc, au moment de l'audit.
- Les suites de qualité du site, du chatbot, des ressources et de la prépublication passent sur la branche du sprint.

**Academy développée mais non déployée :**
- Tests automatiques de contrôle d'accès couvrant les états sans connexion, non inscrit, compte inactif, formation non publiée, lecture/écriture refusée et accès valide simulé.
- Fonction de progression par leçon, lecture et écriture via RLS Supabase ; aucune donnée privée intégrée aux fichiers GitHub.
- Préparation des en-têtes de sécurité et des règles noindex pour un futur hébergement de staging.
- La création du projet Vercel séparé est bloquée par un 403 de l'espace procollomb-6607. **Il faut rétablir l'autorisation Vercel**, puis configurer le projet HTTPS et les URL de redirection Auth pour mener des essais multi-comptes.

**Pas encore terminé :** migration du déploiement Pages natif vers GitHub Actions à déclencher et contrôler dans les réglages du dépôt ; staging Academy en ligne ; tests de connexion réelle, autorisations inter-comptes, validations pédagogiques et commerciale.


## Session complémentaire du 12 octobre 2026 — nouveaux résultats

- Prototype Academy enrichi de la **remise des travaux** avec sauvegarde des réponses et retours formateur en lecture seule, derrière les contrôles Auth/RLS existants.
- Tableau de bord amélioré : différencie droit d'inscription et publication effective ; n'annonce plus un cours en préparation comme accessible.
- Tests de sécurité sur les travaux (anonyme, non inscrit, cours fermé, réponse non lisible, écriture refusée et texte HTML hostile) et tests d'état du tableau de bord ajoutés à la QA.
- Contrôle visuel automatique Chromium : ordinateur 1440 px, mobile 375 px, petit mobile 320 px, sans débordement détecté ; masquage du cours non publié vérifié avec un compte simulé. Captures temporaires dans les artefacts GitHub Actions.
- Présence du fichier SDK Supabase au CDN contrôlée par la CI.
- Avis Supabase au 12/10/2026 : **aucune alerte de sécurité** ; 2 index non utilisés classés informatifs (ne pas supprimer sans mesure).
- **Hébergement de staging toujours bloqué** par l'autorisation Vercel (403 sur procollomb-6607). Sans cet hébergement et les URL Auth configurées, impossible de valider la connexion par e-mail et l'accès premium avec de vrais comptes. Ne pas déclarer l'Academy commercialisable.


## Mise à jour factuelle du 12 octobre 2026 — rédaction et vérification des formations

- **47 modules sur 47** possèdent désormais un cours développé en base privée Supabase, **aucun sous 500 caractères** : Agents 12, Automatisation 11, Processus 9, Sites 3D 15. **35 anciennes fiches courtes** ont été complétées aujourd'hui.
- **15 consignes de livrables** existent dans l'Academy, dont le projet final Playbook Processus sur 100 points, toujours non publié.
- Le corpus Processus V0.9 a été reconstruit comme **candidat**, avec douze jeux de données et un corrigé formateur séparé en bibliothèque privée. Test SHA-256 des 12/12 fichiers candidats réussi ; **0/12** correspondent au manifeste antérieur Supabase. Aucun import forcé ni écrasement d'objets Storage. Rapport privé Drive : https://docs.google.com/document/d/1Qi6YTfEEJpjDWLruemTrSbBiBdMKRQpGuFQPCtHemmA/edit
- L'interface Academy, toujours **non déployée**, a désormais une navigation par leçon, un retour au premier module non terminé et un contrôle strict de version des avis formateurs. Les tests de code et les tests Chromium avec comptes simulés passent, mais ne prouvent pas l'accès de vrais comptes.
- **Aucune ouverture commerciale** : 0 cours/module/livrable/fiche d'asset publié ; 0 fichier dans le stockage privé ; 0 compte apprenant et inscription. Les conseillers de sécurité Supabase ont rendu 0 alerte au dernier contrôle.

Le programme n'est pas achevé par sa seule rédaction : l'ordre de travail est désormais **cohérence des sources et corrigés, exécution des laboratoires techniques, staging privé et tests Auth/RLS multi-comptes, pilotes pédagogiques**, puis décisions commerciales. Rapport éditorial privé : https://docs.google.com/document/d/1eMrtS21H006jYDuGN1_Q4QV_aaiHCORUKSRNAr3vHLI/edit .
