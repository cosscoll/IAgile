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

## Vérification 09/10/2026 — déploiement Pages
- Le workflow personnalisé lance les contrôles HTML/liens, sitemap, liste des ressources publiques et la syntaxe des principaux scripts.
- Un second système automatique « pages build and deployment » reste actif dans le dépôt et peut publier indépendamment du workflow personnalisé. ACTION DE CONFIGURATION : GitHub > Settings > Pages > Build and deployment > Source = GitHub Actions. Ce point doit être vérifié par une personne ayant accès aux paramètres du dépôt.
- Le pré-lancement reste ouvert; les tests Node ne prouvent pas l'accessibilité réelle du site ou le fonctionnement sur un GPU mobile.
