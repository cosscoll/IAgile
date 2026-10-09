# IAgile — CHROME V21

Site public : https://cosscoll.github.io/IAgile/

## État actuel

Site vitrine en pré-lancement, pas de vente ouverte. Les quatre parcours disposent d'un aperçu commercial : sites web 3D, agents personnalisés, automatisation, IA au quotidien. La présentation immersive d’origine est conservée.

## Pages

- `index.html` : 5 scènes immersives, 4 formations, simulations et chatbot guidé.
- `formations/*.html` : aperçu commercial, public cible et résultat visé ; leçons réservées à des sites distincts.
- `parcours.html` : orientation interactive, comparaison et export texte sans collecte.
- `a-propos.html` : présentation du projet et état honnête du développement.
- `faq.html` : réponses actualisées aux questions des futurs apprenants.
- `404.html` : page de secours.

## Important : distinction chatbot

`chatbot.js` utilise par défaut l'assistant guidé local. `chatbot-ai.js` et `backend-iagile/api/chat.js` forment la version générative à activer après déploiement d'un backend sécurisé et configuration de `chat-config.js`. Ne jamais publier les clés API dans ce dépôt. Voir `docs/CHATBOT-IA-DEPLOIEMENT.md`. Tant que le serveur n'est pas activé, le site conserve son assistant guidé.

## Tests

Exécuter `node tests/site-check.mjs` pour valider les fichiers, métadonnées, ancres et liens locaux. Un parcours navigateur doit vérifier le desktop, le mobile et le rendu WebGL matériel.

## Déploiement

GitHub Pages, branche `main`. Éviter les publications concurrentes depuis plusieurs workflows.

## Blocages commerciaux

Voir `docs/ETAT-LANCEMENT.md`. Tant que le vendeur, l'offre, la conformité, la livraison pédagogique et les paiements ne sont pas validés, aucune inscription payante ne doit être activée.

## Répartition vitrine / plateformes de formation

- `index.html`, `parcours.html` et les quatre pages sous `formations/` constituent uniquement **la vitrine publique** : bénéfices, résultat visé et très courts aperçus.
- Chaque formation aura **son propre site d'apprentissage dédié**, avec accès réservé aux apprenants inscrits ; aucun des quatre sites privés n'est encore connecté.
- Les leçons détaillées, ateliers, exercices corrigés, évaluations, modèles et projets complets **ne doivent pas être publiés dans ce dépôt GitHub public ni dans GitHub Pages**.
- Le contenu de formation doit être stocké dans un dépôt privé et livré via une plateforme avec contrôle d'accès **côté serveur** après inscription/paiement. Un masquage HTML ou JavaScript ne protège pas les fichiers.
- Le dossier `pilote/` contient exclusivement un aperçu commercial limité ; les anciennes versions pédagogiques V17/V18 restent visibles dans l'historique de ce dépôt public et ne doivent pas être considérées comme privées.
- Les prix, modalités de vente et ouvertures d'inscriptions restent à valider.

## Mise à jour V21 (9 octobre 2026)

- V20 et V19 responsive intégrées à la V21 : parcours commercial, démonstrations courtes, liens directs vers les formations et transparence sur l'ouverture.
- Préservation des cas de pratique ajoutés à la branche principale le 9 octobre, sans fournir les méthodes complètes.
- Publication GitHub Pages limitée à 36 fichiers de vitrine explicitement autorisés, non aux dossiers internes du dépôt.
- Les données juridiques, le contact réel et la validation de marque restent à finaliser avant commercialisation.
- Le dépôt reste public, y compris l'historique des anciennes ressources pédagogiques.

## Qualité des déploiements — 9 octobre 2026

- Le workflow personnalisé `Deploy IAgile CHROME vitrine` vérifie le code **avant son propre déploiement** via `node tests/site-check.mjs` et `node --check` sur les scripts principaux.
- Le contrôle inspecte les pages, les ancres, le sitemap, les quatre aperçus des formations et la liste explicite des seuls actifs autorisés à être publiés.
- Ces vérifications ne remplacent **pas** les tests visuels, mobiles, GPU ni les tests de parcours de conversion effectués dans un navigateur réel.

**Attention :** le dépôt possède aussi un déploiement GitHub Pages automatique natif (`pages build and deployment`), distinct du workflow personnalisé. Tant que la source Pages n'est pas configurée sur **GitHub Actions uniquement**, cette seconde publication peut contourner le contrôle personnalisé. Une modification des paramètres Pages du dépôt est requise pour garantir un gate unique.
