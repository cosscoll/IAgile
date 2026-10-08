# IAgile — CHROME V16

Site public : https://cosscoll.github.io/IAgile/

## État actuel

Site vitrine en pré-lancement, pas de vente ouverte. Les quatre parcours sont détaillés : sites web 3D, agents personnalisés, automatisation, IA au quotidien. La présentation immersive d’origine est conservée.

## Pages

- `index.html` : 5 scènes immersives, 4 formations, simulations et chatbot guidé.
- `formations/*.html` : programmes complets et projets finaux.
- `parcours.html` : orientation interactive, comparaison et export texte sans collecte.
- `a-propos.html` : présentation du projet et état honnête du développement.
- `faq.html` : réponses actualisées aux questions des futurs apprenants.
- `404.html` : page de secours.

## Important : distinction chatbot

`chatbot.js` sur le site public est un assistant guidé sans génération de texte. La vraie version générative nécessite un backend sécurisé et des clés côté serveur. Le prototype de chatbot génératif est développé sur la branche `feature/assistant-ia-generative`, qui n'est **pas** la version publique. Ne jamais publier les clés API dans ce dépôt.

## Tests

Exécuter `node tests/site-check.mjs` pour valider les fichiers, métadonnées, ancres et liens locaux. Un parcours navigateur doit vérifier le desktop, le mobile et le rendu WebGL matériel.

## Déploiement

GitHub Pages, branche `main`. Éviter les publications concurrentes depuis plusieurs workflows.

## Blocages commerciaux

Voir `docs/ETAT-LANCEMENT.md`. Tant que le vendeur, l'offre, la conformité, la livraison pédagogique et les paiements ne sont pas validés, aucune inscription payante ne doit être activée.
